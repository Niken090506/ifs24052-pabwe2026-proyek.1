import { Router } from "express";
import db from "../db.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { createImageUploader } from "../middleware/uploadMiddleware.js";
import { sanitizeText, parseId } from "../helpers/validationHelper.js";

const router = Router();

// Semua rute catatan wajib terautentikasi secara ketat
router.use(requireAuth);

const upload = createImageUploader({ prefix: "note-img", maxSizeMB: 5 });


// POST /api/v1/notes/upload-image (Otorisasi ketat)
router.post("/upload-image", (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || "Gagal mengunggah gambar" });
    }
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
});

// GET /api/v1/notes (Terkunci khusus catatan milik pengguna aktif)
router.get("/", (req, res) => {
  const userId = req.user.id;
  const { folder_id, q } = req.query;

  let sql = `
    SELECT n.*, f.name as folder_name, f.icon as folder_icon 
    FROM notes n 
    LEFT JOIN folders f ON n.folder_id = f.id 
    WHERE n.user_id = ?
  `;
  const params = [userId];

  if (folder_id && folder_id !== "all") {
    const parsedFolderId = parseId(folder_id);
    if (parsedFolderId) {
      sql += " AND n.folder_id = ?";
      params.push(parsedFolderId);
    }
  }

  if (q && typeof q === "string" && q.trim()) {
    sql += " AND (n.title LIKE ? OR n.content LIKE ?)";
    const term = `%${sanitizeText(q)}%`;
    params.push(term, term);
  }

  sql += " ORDER BY n.updated_at DESC, n.id DESC";

  const notes = db.prepare(sql).all(...params);
  return res.json({ success: true, data: notes });
});

// GET /api/v1/notes/:id (Memverifikasi hak milik catatan)
router.get("/:id", (req, res) => {
  const userId = req.user.id;
  const noteId = parseId(req.params.id);

  if (!noteId) {
    return res.status(400).json({ success: false, message: "ID catatan tidak valid" });
  }

  const note = db
    .prepare(
      `SELECT n.*, f.name as folder_name, f.icon as folder_icon 
       FROM notes n 
       LEFT JOIN folders f ON n.folder_id = f.id 
       WHERE n.id = ? AND n.user_id = ?`
    )
    .get(noteId, userId);

  if (!note) {
    return res.status(404).json({
      success: false,
      message: "Catatan tidak ditemukan atau Anda tidak memiliki akses",
    });
  }

  return res.json({ success: true, data: note });
});

// POST /api/v1/notes (Menyimpan catatan berotorisasi ketat)
router.post("/", (req, res) => {
  const userId = req.user.id;
  const { title, content, folder_id } = req.body;

  const cleanTitle = sanitizeText(title);
  if (!cleanTitle) {
    return res.status(400).json({ success: false, message: "Judul catatan tidak boleh kosong" });
  }

  const cleanContent = typeof content === "string" ? content : "";
  const lines = cleanContent.split("\n").filter((l) => l.trim() && !l.startsWith("#"));
  const preview = lines.length > 0 ? lines[0].substring(0, 100) : "No preview available";

  const cleanFolderId = parseId(folder_id);

  const result = db
    .prepare("INSERT INTO notes (user_id, title, content, preview, folder_id) VALUES (?, ?, ?, ?, ?)")
    .run(userId, cleanTitle, cleanContent, preview, cleanFolderId);

  const newNote = db
    .prepare(
      `SELECT n.*, f.name as folder_name, f.icon as folder_icon 
       FROM notes n 
       LEFT JOIN folders f ON n.folder_id = f.id 
       WHERE n.id = ? AND n.user_id = ?`
    )
    .get(result.lastInsertRowid, userId);

  return res.status(201).json({
    success: true,
    message: "Catatan berhasil dibuat",
    data: newNote,
  });
});

// PUT /api/v1/notes/:id (Hanya pemilik yang dapat memperbarui catatan)
router.put("/:id", (req, res) => {
  const userId = req.user.id;
  const noteId = parseId(req.params.id);

  if (!noteId) {
    return res.status(400).json({ success: false, message: "ID catatan tidak valid" });
  }

  const existing = db.prepare("SELECT * FROM notes WHERE id = ? AND user_id = ?").get(noteId, userId);
  if (!existing) {
    return res.status(404).json({
      success: false,
      message: "Catatan tidak ditemukan atau Anda tidak memiliki hak akses",
    });
  }

  const { title, content, folder_id } = req.body;
  const newTitle = title !== undefined ? sanitizeText(title) : existing.title;
  if (!newTitle) {
    return res.status(400).json({ success: false, message: "Judul catatan tidak boleh kosong" });
  }

  const newContent = content !== undefined && typeof content === "string" ? content : existing.content;
  const newFolderId = folder_id !== undefined ? parseId(folder_id) : existing.folder_id;

  const lines = newContent.split("\n").filter((l) => l.trim() && !l.startsWith("#"));
  const preview = lines.length > 0 ? lines[0].substring(0, 100) : "No preview available";

  db.prepare(
    `UPDATE notes 
     SET title = ?, content = ?, preview = ?, folder_id = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE id = ? AND user_id = ?`
  ).run(newTitle, newContent, preview, newFolderId, noteId, userId);

  const updated = db
    .prepare(
      `SELECT n.*, f.name as folder_name, f.icon as folder_icon 
       FROM notes n 
       LEFT JOIN folders f ON n.folder_id = f.id 
       WHERE n.id = ? AND n.user_id = ?`
    )
    .get(noteId, userId);

  return res.json({
    success: true,
    message: "Catatan berhasil diperbarui",
    data: updated,
  });
});

// DELETE /api/v1/notes/:id (Hanya pemilik yang dapat menghapus catatan)
router.delete("/:id", (req, res) => {
  const userId = req.user.id;
  const noteId = parseId(req.params.id);

  if (!noteId) {
    return res.status(400).json({ success: false, message: "ID catatan tidak valid" });
  }

  const existing = db.prepare("SELECT * FROM notes WHERE id = ? AND user_id = ?").get(noteId, userId);
  if (!existing) {
    return res.status(404).json({
      success: false,
      message: "Catatan tidak ditemukan atau Anda tidak memiliki hak akses",
    });
  }

  db.prepare("DELETE FROM notes WHERE id = ? AND user_id = ?").run(noteId, userId);

  return res.json({
    success: true,
    message: "Catatan berhasil dihapus",
  });
});

export default router;
