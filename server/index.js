import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

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
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

// Request logger
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  next();
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
