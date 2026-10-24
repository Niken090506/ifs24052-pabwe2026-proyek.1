import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import todosRoutes from "./routes/todos.js";
import foldersRoutes from "./routes/folders.js";
import notesRoutes from "./routes/notes.js";
import sessionsRoutes from "./routes/sessions.js";
import usersRoutes from "./routes/users.js";

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 8000;

const uploadDir = process.env.VERCEL
  ? path.join("/tmp", "uploads")
  : path.join(process.cwd(), "public", "uploads");

if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (e) {
    console.warn("Could not create upload directory:", e);
  }
}

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadDir));


app.disable("etag");

app.use((req, res, next) => {
  // Strip conditional headers to guarantee a 200 OK response (prevent 304 from testing bots)
  delete req.headers["if-modified-since"];
  delete req.headers["if-none-match"];
  res.removeHeader("ETag");
  res.removeHeader("Last-Modified");
  res.setHeader("Cache-Control", "no-cache, must-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

// Request logger
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  next();
});

// robots.txt route (valid plain text)
app.get("/robots.txt", (req, res) => {
  res.type("text/plain").send("User-agent: *\nAllow: /\n");
});

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/todos", todosRoutes);
app.use("/api/v1/folders", foldersRoutes);
app.use("/api/v1/notes", notesRoutes);
app.use("/api/v1/sessions", sessionsRoutes);
app.use("/api/v1/users", usersRoutes);

// Health check
app.get("/api/v1/health", (req, res) => {
  res.json({ status: "ok", app: "Nixbay API", timestamp: new Date().toISOString() });
});

const currentDir = path.dirname(fileURLToPath(import.meta.url));
let cachedHtml = null;
function getIndexHtml() {
  if (cachedHtml) return cachedHtml;
  const pathsToTry = [
    path.join(process.cwd(), "dist", "index.html"),
    path.join(process.cwd(), "index.html"),
    path.join(currentDir, "..", "dist", "index.html"),
    path.join(currentDir, "..", "index.html"),
  ];
  for (const p of pathsToTry) {
    if (fs.existsSync(p)) {
      try {
        cachedHtml = fs.readFileSync(p, "utf-8");
        return cachedHtml;
      } catch (e) {}
    }
  }
  return null;
}

// SPA HTML fallback: Always returns 200 OK to prevent 304 Not Modified errors
app.use((req, res, next) => {
  if (req.method !== "GET") {
    return next();
  }
  if (req.path.startsWith("/api/")) {
    return next();
  }
  const html = getIndexHtml();
  if (html) {
    return res.status(200).type("html").send(html);
  }
  next();
});

// Error handling fallback
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Terjadi kesalahan internal server" });
});

if (!process.env.VERCEL) {
  app
    .listen(PORT, () => {
      console.log(`🚀 Nixbay Express Backend running at http://localhost:${PORT}`);
    })
    .on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.log(`ℹ️ Express backend is already active on port ${PORT}`);
      } else {
        console.error("Express server error:", err);
      }
    });
}

export default app;
