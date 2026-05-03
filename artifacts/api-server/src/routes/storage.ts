import { Router, type IRouter, type Request, type Response } from "express";
import { Readable } from "stream";
import { z } from "zod";
import { ObjectStorageService, ObjectNotFoundError } from "../lib/objectStorage";

const router: IRouter = Router();

// Lazy — only instantiated when a storage route is actually hit.
// On Railway (no Replit sidecar) the constructor itself is fine; errors
// surface only when bucket methods are called, which is what we want.
let _objectStorageService: ObjectStorageService | null = null;
function getObjectStorageService(): ObjectStorageService {
  if (!_objectStorageService) _objectStorageService = new ObjectStorageService();
  return _objectStorageService;
}

const RequestUploadUrlBody = z.object({
  name: z.string(),
  size: z.number(),
  contentType: z.string(),
});

const RequestUploadUrlResponse = z.object({
  uploadURL: z.string(),
  objectPath: z.string(),
  metadata: z.object({ name: z.string(), size: z.number(), contentType: z.string() }),
});

/**
 * POST /storage/uploads/request-url
 * Request a presigned URL for file upload.
 */
router.post("/storage/uploads/request-url", async (req: Request, res: Response) => {
  const parsed = RequestUploadUrlBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Missing or invalid required fields" });
    return;
  }

  try {
    const { name, size, contentType } = parsed.data;
    const service = getObjectStorageService();
    const uploadURL = await service.getObjectEntityUploadURL();
    const objectPath = service.normalizeObjectEntityPath(uploadURL);

    res.json(
      RequestUploadUrlResponse.parse({
        uploadURL,
        objectPath,
        metadata: { name, size, contentType },
      }),
    );
  } catch (error: any) {
    if (error.message?.includes("only available on Replit")) {
      res.status(503).json({ error: "Storage service is only available on Replit. Please use local uploads on Railway." });
      return;
    }
    req.log.error({ err: error }, "Error generating upload URL");
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

/**
 * GET /storage/public-objects/*
 * Serve public assets unconditionally.
 */
router.get("/storage/public-objects/*filePath", async (req: Request, res: Response) => {
  try {
    const raw = req.params.filePath;
    const filePath = Array.isArray(raw) ? raw.join("/") : raw;
    const service = getObjectStorageService();
    const file = await service.searchPublicObject(filePath);
    if (!file) {
      res.status(404).json({ error: "File not found" });
      return;
    }
    const response = await service.downloadObject(file);
    res.setHeader("Content-Type", response.headers.get("Content-Type") ?? "application/octet-stream");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    if (response.body) {
      Readable.fromWeb(response.body as any).pipe(res);
    } else {
      res.end();
    }
  } catch (err: any) {
    if (err.message?.includes("only available on Replit")) {
      res.status(503).json({ error: "Storage service is only available on Replit." });
      return;
    }
    req.log.error({ err }, "Error serving public object");
    res.status(500).json({ error: "Failed to serve file" });
  }
});

/**
 * GET /storage/objects/:objectId
 * Serve uploaded object entities.
 */
router.get("/storage/objects/:objectId", async (req: Request, res: Response) => {
  const { objectId } = req.params;
  try {
    const service = getObjectStorageService();
    const file = await service.getObjectEntityFile(`/objects/${objectId}`);
    const response = await service.downloadObject(file, 3600);
    res.setHeader("Content-Type", response.headers.get("Content-Type") ?? "application/octet-stream");
    res.setHeader("Cache-Control", "public, max-age=3600");
    if (response.body) {
      Readable.fromWeb(response.body as any).pipe(res);
    } else {
      res.end();
    }
  } catch (err: any) {
    if (err.message?.includes("only available on Replit")) {
      res.status(503).json({ error: "Storage service is only available on Replit." });
      return;
    }
    if (err instanceof ObjectNotFoundError) {
      res.status(404).json({ error: "Object not found" });
    } else {
      req.log.error({ err }, "Error serving object");
      res.status(500).json({ error: "Failed to serve object" });
    }
  }
});

export default router;
