import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "20kb" }));
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
  app.post("/api/contact", async (req, res) => {
    const { name, email, message, website } = req.body || {};
    if (website) return res.status(400).json({ error: "Invalid submission" });
    if (typeof name !== "string" || !name.trim() || name.trim().length > 100) {
      return res.status(400).json({ error: "Please enter your name." });
    }
    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }
    if (
      typeof message !== "string" ||
      !message.trim() ||
      message.trim().length > 5000
    ) {
      return res.status(400).json({ error: "Please enter a message." });
    }
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: "Email service is not configured." });
    }
    try {
      const portfolio = JSON.parse(
        await readFile(path.join(root, "public/data/portfolio.json"), "utf8"),
      );
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || "Portfolio contact <onboarding@resend.dev>",
          to: [portfolio.email],
          reply_to: email.trim(),
          subject: `Portfolio message from ${name.trim()}`,
          text: `Name: ${name.trim()}\nEmail: ${email.trim()}\n\n${message.trim()}`,
        }),
      });
      if (!response.ok) {
        const details = await response.text();
        console.error("Resend rejected contact email:", response.status, details);
        return res.status(502).json({
          error:
            "Email service rejected the message. Check that RESEND_FROM_EMAIL is a verified sender.",
        });
      }
      return res.status(202).json({ message: "Message sent." });
    } catch (error) {
      console.error("Failed to send contact email:", error);
      return res.status(502).json({ error: "Unable to send message." });
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
