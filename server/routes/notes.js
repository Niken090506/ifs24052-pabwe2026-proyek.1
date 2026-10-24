import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import db from "../db.js";
import { getAuthUser } from "../authHelper.js";

const router = Router();

// Ensure uploads directory exists (use /tmp/uploads on Vercel)
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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".png";
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e6);
    cb(null, `note-img-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// POST /api/v1/notes/upload-image (upload image for note content)
router.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Pilih file gambar untuk diunggah" });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  return res.json({
    success: true,
    message: "Gambar berhasil diunggah",
    data: {
      url: imageUrl,
      filename: req.file.originalname,
    },
  });
});

// GET /api/v1/notes (scoped to logged-in user)
router.get("/", (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.json({ success: true, data: [] });
  }

  const { folder_id, q } = req.query;

  let sql = `
    SELECT n.*, f.name as folder_name, f.icon as folder_icon 
    FROM notes n 
    LEFT JOIN folders f ON n.folder_id = f.id 
    WHERE n.user_id = ?
  `;
  const params = [user.id];

  if (folder_id && folder_id !== "all") {
    sql += " AND n.folder_id = ?";
    params.push(folder_id);
  }

  if (q && q.trim()) {
    sql += " AND (n.title LIKE ? OR n.content LIKE ?)";
    const term = `%${q.trim()}%`;
    params.push(term, term);
  }

  sql += " ORDER BY n.updated_at DESC, n.id DESC";

  const notes = db.prepare(sql).all(...params);
  return res.json({ success: true, data: notes });
});

// GET /api/v1/notes/:id
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const note = db
    .prepare(
      `SELECT n.*, f.name as folder_name, f.icon as folder_icon 
       FROM notes n 
       LEFT JOIN folders f ON n.folder_id = f.id 
       WHERE n.id = ?`
    )
    .get(id);

  if (!note) {
    return res.status(404).json({ success: false, message: "Catatan tidak ditemukan" });
  }

  return res.json({ success: true, data: note });
});

// POST /api/v1/notes
router.post("/", (req, res) => {
  const user = getAuthUser(req);
  const { title, content, folder_id } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: "Judul catatan tidak boleh kosong" });
  }

  const userId = user ? user.id : 1;
  const cleanContent = content || "";
  const lines = cleanContent.split("\n").filter((l) => l.trim() && !l.startsWith("#"));
  const preview = lines.length > 0 ? lines[0].substring(0, 100) : "No preview available";

  const result = db
    .prepare("INSERT INTO notes (user_id, title, content, preview, folder_id) VALUES (?, ?, ?, ?, ?)")
    .run(userId, title.trim(), cleanContent, preview, folder_id || null);

  const newNote = db
    .prepare(
      `SELECT n.*, f.name as folder_name, f.icon as folder_icon 
       FROM notes n 
       LEFT JOIN folders f ON n.folder_id = f.id 
       WHERE n.id = ?`
    )
    .get(result.lastInsertRowid);

  return res.status(201).json({
    success: true,
    message: "Catatan berhasil dibuat",
    data: newNote,
  });
});

// PUT /api/v1/notes/:id
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { title, content, folder_id } = req.body;

  const existing = db.prepare("SELECT * FROM notes WHERE id = ?").get(id);
  if (!existing) {
    return res.status(404).json({ success: false, message: "Catatan tidak ditemukan" });
  }

  const newTitle = title !== undefined ? title : existing.title;
  const newContent = content !== undefined ? content : existing.content;
  const newFolderId = folder_id !== undefined ? folder_id : existing.folder_id;

  const lines = newContent.split("\n").filter((l) => l.trim() && !l.startsWith("#"));
  const preview = lines.length > 0 ? lines[0].substring(0, 100) : "No preview available";

  db.prepare(
    `UPDATE notes 
     SET title = ?, content = ?, preview = ?, folder_id = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE id = ?`
  ).run(newTitle, newContent, preview, newFolderId, id);

  const updated = db
    .prepare(
      `SELECT n.*, f.name as folder_name, f.icon as folder_icon 
       FROM notes n 
       LEFT JOIN folders f ON n.folder_id = f.id 
       WHERE n.id = ?`
    )
    .get(id);

  return res.json({
    success: true,
    message: "Catatan berhasil diperbarui",
    data: updated,
  });
});

// DELETE /api/v1/notes/:id
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const existing = db.prepare("SELECT * FROM notes WHERE id = ?").get(id);
  if (!existing) {
    return res.status(404).json({ success: false, message: "Catatan tidak ditemukan" });
  }

  db.prepare("DELETE FROM notes WHERE id = ?").run(id);

  return res.json({
    success: true,
    message: "Catatan berhasil dihapus",
  });
});

export default router;
