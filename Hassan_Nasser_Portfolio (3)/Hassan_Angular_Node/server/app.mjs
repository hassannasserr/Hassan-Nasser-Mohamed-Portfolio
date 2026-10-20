import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.get("/api/portfolio", async (_req, res, next) => {
    try {
      res.json(
        JSON.parse(
          await readFile(path.join(root, "public/data/portfolio.json"), "utf8"),
        ),
      );
    } catch (e) {
      next(e);
    }
  });
  app.get("/Hassan_Nasser_CV.pdf", (_req, res) =>
    res.download(
      path.join(root, "public/Hassan_Nasser_CV.pdf"),
      "Hassan_Nasser_CV.pdf",
    ),
  );
  app.use(
    "/images",
    express.static(path.join(root, "public/images")),
    (_req, res) => res.sendStatus(404),
  );
  app.use("/api", (_req, res) =>
    res.status(404).json({ error: "API endpoint not found" }),
  );
  app.use(express.static(path.join(root, "dist/portfolio/browser")));
  app.get("/{*path}", (_req, res) =>
    res.sendFile(path.join(root, "dist/portfolio/browser/index.html")),
  );
  return app;
}
