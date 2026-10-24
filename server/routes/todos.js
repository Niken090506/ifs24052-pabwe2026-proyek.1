import { Router } from "express";
import db from "../db.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { sanitizeText, parseId } from "../helpers/validationHelper.js";

const router = Router();

// Semua rute tasks/todos wajib terautentikasi secara ketat
router.use(requireAuth);

// GET /api/v1/todos (Hanya daftar tugas milik pengguna yang sedang login)
router.get("/", (req, res) => {
  const userId = req.user.id;

  const todos = db.prepare("SELECT * FROM todos WHERE user_id = ? ORDER BY id DESC").all(userId);
  return res.json({
    success: true,
    data: todos.map((t) => ({
      id: t.id,
      title: t.title,
      completed: Boolean(t.completed),
      created_at: t.created_at,
    })),
  });
});

// POST /api/v1/todos (Menambah tugas baru dengan otorisasi user)
router.post("/", (req, res) => {
  const userId = req.user.id;
  const { title } = req.body;

  const cleanTitle = sanitizeText(title);
  if (!cleanTitle) {
    return res.status(400).json({ success: false, message: "Judul tugas tidak boleh kosong" });
  }

  const result = db.prepare("INSERT INTO todos (user_id, title, completed) VALUES (?, ?, 0)").run(userId, cleanTitle);
  const newTodo = db.prepare("SELECT * FROM todos WHERE id = ? AND user_id = ?").get(result.lastInsertRowid, userId);

  return res.status(201).json({
    success: true,
    message: "Tugas berhasil ditambahkan",
    data: {
      id: newTodo.id,
      title: newTodo.title,
      completed: Boolean(newTodo.completed),
      created_at: newTodo.created_at,
    },
  });
});

// PUT /api/v1/todos/:id (Hanya pemilik yang dapat mengubah status/judul tugas)
router.put("/:id", (req, res) => {
  const userId = req.user.id;
  const todoId = parseId(req.params.id);

  if (!todoId) {
    return res.status(400).json({ success: false, message: "ID tugas tidak valid" });
  }

  const existing = db.prepare("SELECT * FROM todos WHERE id = ? AND user_id = ?").get(todoId, userId);
  if (!existing) {
    return res.status(404).json({
      success: false,
      message: "Tugas tidak ditemukan atau Anda tidak memiliki hak akses",
    });
  }

  const { title, completed } = req.body;
  const newTitle = title !== undefined ? sanitizeText(title) : existing.title;
  if (!newTitle) {
    return res.status(400).json({ success: false, message: "Judul tugas tidak boleh kosong" });
  }

  const newCompleted = completed !== undefined ? (completed ? 1 : 0) : existing.completed;

  db.prepare("UPDATE todos SET title = ?, completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?").run(
    newTitle,
    newCompleted,
    todoId,
    userId
  );

  const updated = db.prepare("SELECT * FROM todos WHERE id = ? AND user_id = ?").get(todoId, userId);

  return res.json({
    success: true,
    message: "Tugas berhasil diperbarui",
    data: {
      id: updated.id,
      title: updated.title,
      completed: Boolean(updated.completed),
      updated_at: updated.updated_at,
    },
  });
});

// DELETE /api/v1/todos/:id (Hanya pemilik yang dapat menghapus tugas)
router.delete("/:id", (req, res) => {
  const userId = req.user.id;
  const todoId = parseId(req.params.id);

  if (!todoId) {
    return res.status(400).json({ success: false, message: "ID tugas tidak valid" });
  }

  const existing = db.prepare("SELECT * FROM todos WHERE id = ? AND user_id = ?").get(todoId, userId);
  if (!existing) {
    return res.status(404).json({
      success: false,
      message: "Tugas tidak ditemukan atau Anda tidak memiliki hak akses",
    });
  }

  db.prepare("DELETE FROM todos WHERE id = ? AND user_id = ?").run(todoId, userId);

  return res.json({
    success: true,
    message: "Tugas berhasil dihapus",
  });
});

export default router;
