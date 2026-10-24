import { Router } from "express";
import db from "../db.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { sanitizeText, parseId } from "../helpers/validationHelper.js";

const router = Router();

// Semua rute folder dilindungi oleh requireAuth
router.use(requireAuth);

// GET /api/v1/folders (hanya menampilkan folder milik pengguna yang login)
router.get("/", (req, res) => {
  const userId = req.user.id;

  const folders = db
    .prepare(
      `SELECT f.*, COUNT(n.id) as note_count 
       FROM folders f 
       LEFT JOIN notes n ON f.id = n.folder_id 
       WHERE f.user_id = ?
       GROUP BY f.id 
       ORDER BY f.id ASC`
    )
    .all(userId);

  const totalNotesRow = db.prepare("SELECT COUNT(*) as count FROM notes WHERE user_id = ?").get(userId);
  const totalNotes = totalNotesRow ? totalNotesRow.count : 0;

  return res.json({
    success: true,
    data: {
      totalNotes,
      folders,
    },
  });
});

// POST /api/v1/folders (membuat folder baru berpemilik ketat)
router.post("/", (req, res) => {
  const userId = req.user.id;
  const { name, icon, description } = req.body;

  const cleanName = sanitizeText(name);
  if (!cleanName) {
    return res.status(400).json({ success: false, message: "Nama folder wajib diisi dan tidak boleh kosong" });
  }

  if (cleanName.length > 50) {
    return res.status(400).json({ success: false, message: "Nama folder maksimal terdiri dari 50 karakter" });
  }

  const cleanIcon = sanitizeText(icon) || "folder";
  const cleanDesc = sanitizeText(description) || "";

  const result = db
    .prepare("INSERT INTO folders (user_id, name, icon, description) VALUES (?, ?, ?, ?)")
    .run(userId, cleanName, cleanIcon, cleanDesc);

  const newFolder = db.prepare("SELECT * FROM folders WHERE id = ?").get(result.lastInsertRowid);

  return res.status(201).json({
    success: true,
    message: "Folder berhasil dibuat",
    data: { ...newFolder, note_count: 0 },
  });
});

// DELETE /api/v1/folders/:id (verifikasi otorisasi kepemilikan folder)
router.delete("/:id", (req, res) => {
  const userId = req.user.id;
  const folderId = parseId(req.params.id);

  if (!folderId) {
    return res.status(400).json({ success: false, message: "ID folder tidak valid" });
  }

  const existing = db.prepare("SELECT * FROM folders WHERE id = ? AND user_id = ?").get(folderId, userId);
  if (!existing) {
    return res.status(404).json({
      success: false,
      message: "Folder tidak ditemukan atau Anda tidak memiliki akses untuk menghapusnya",
    });
  }

  db.prepare("DELETE FROM folders WHERE id = ? AND user_id = ?").run(folderId, userId);

  return res.json({
    success: true,
    message: "Folder berhasil dihapus",
  });
});

export default router;
