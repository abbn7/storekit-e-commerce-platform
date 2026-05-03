import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import path from "path";
import fs from "fs";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  clerkMiddleware((req) => ({
    publishableKey: publishableKeyFromHost(
      getClerkProxyHost(req) ?? "",
      process.env.CLERK_PUBLISHABLE_KEY,
    ),
  })),
);

app.use("/api", router);

// ── Serve built frontend in production ──────────────────────────────────────
// Set FRONTEND_DIST env var to the path of the built frontend (e.g. ./public)
// This lets the Docker image serve both API + frontend from a single process.
const frontendDist = process.env.FRONTEND_DIST;
if (frontendDist && fs.existsSync(frontendDist)) {
  logger.info({ frontendDist }, "Serving static frontend");
  app.use(express.static(frontendDist, { maxAge: "1y", immutable: true }));
  // SPA fallback — all non-API routes go to index.html
  app.get("*path", (_req, res) => {
    res.sendFile(path.resolve(frontendDist, "index.html"));
  });
}

export default app;
