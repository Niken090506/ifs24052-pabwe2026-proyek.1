import { Router } from "express";
import db from "../db.js";
import { getAuthUser } from "../authHelper.js";

const router = Router();

// GET /api/v1/folders (scoped to logged in user)
router.get("/", (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.json({
      success: true,
      data: {
        totalNotes: 0,
        folders: [],
      },
    });
  }

  const folders = db
    .prepare(
      `SELECT f.*, COUNT(n.id) as note_count 
       FROM folders f 
       LEFT JOIN notes n ON f.id = n.folder_id 
       WHERE f.user_id = ?
       GROUP BY f.id 
       ORDER BY f.id ASC`
    )
    .all(user.id);

  const totalNotes = db.prepare("SELECT COUNT(*) as count FROM notes WHERE user_id = ?").get(user.id).count;

  return res.json({
    success: true,
    data: {
      totalNotes,
      folders,
    },
  });
});

// POST /api/v1/folders
router.post("/", (req, res) => {
  const user = getAuthUser(req);
  const { name, icon, description } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: "Nama folder tidak boleh kosong" });
  }

  const userId = user ? user.id : 1;
  const result = db
    .prepare("INSERT INTO folders (user_id, name, icon, description) VALUES (?, ?, ?, ?)")
    .run(userId, name.trim(), icon || "folder", description || "");

  const newFolder = db.prepare("SELECT * FROM folders WHERE id = ?").get(result.lastInsertRowid);

  return res.status(201).json({
    success: true,
    message: "Folder berhasil dibuat",
    data: { ...newFolder, note_count: 0 },
  });
});

// DELETE /api/v1/folders/:id
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const existing = db.prepare("SELECT * FROM folders WHERE id = ?").get(id);
  if (!existing) {
    return res.status(404).json({ success: false, message: "Folder tidak ditemukan" });
  }

  db.prepare("DELETE FROM folders WHERE id = ?").run(id);

  return res.json({
    success: true,
    message: "Folder berhasil dihapus",
  });
});

export default router;
