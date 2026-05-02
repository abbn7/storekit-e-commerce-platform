import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";

const router: IRouter = Router();

function getUploadDir(): string {
  const dir = process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.join(process.cwd(), "uploads");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, getUploadDir()),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const session = req.cookies?.sk_admin_session;
  if (session === "authenticated") return next();
  res.status(401).json({ error: "Unauthorized" });
}

/**
 * POST /api/uploads
 * Upload a single image file (admin only). Returns { url } for use in forms.
 */
router.post(
  "/uploads",
  requireAdmin,
  upload.single("file"),
  (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: "No file provided" });
      return;
    }
    const url = `/api/uploads/${req.file.filename}`;
    res.json({ url, filename: req.file.filename });
  },
);

/**
 * GET /api/uploads/:filename
 * Serve uploaded images from disk.
 */
router.get("/uploads/:filename", (req: Request, res: Response) => {
  const { filename } = req.params;
  if (filename.includes("..") || filename.includes("/")) {
    res.status(400).json({ error: "Invalid filename" });
    return;
  }
  const filePath = path.join(getUploadDir(), filename);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: "File not found" });
    return;
  }
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.sendFile(filePath);
});

export default router;
