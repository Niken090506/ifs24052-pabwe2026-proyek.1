import { Router } from "express";
import db from "../db.js";
import { getAuthUser } from "../authHelper.js";

const router = Router();

// GET /api/v1/todos (scoped to logged in user)
router.get("/", (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.json({ success: true, data: [] });
  }

  const todos = db.prepare("SELECT * FROM todos WHERE user_id = ? ORDER BY id DESC").all(user.id);
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

// POST /api/v1/todos
router.post("/", (req, res) => {
  const user = getAuthUser(req);
  const { title } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: "Judul tugas tidak boleh kosong" });
  }

  const userId = user ? user.id : 1;
  const result = db.prepare("INSERT INTO todos (user_id, title, completed) VALUES (?, ?, 0)").run(userId, title.trim());
  const newTodo = db.prepare("SELECT * FROM todos WHERE id = ?").get(result.lastInsertRowid);

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

// PUT /api/v1/todos/:id
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;

  const existing = db.prepare("SELECT * FROM todos WHERE id = ?").get(id);
  if (!existing) {
    return res.status(404).json({ success: false, message: "Tugas tidak ditemukan" });
  }

  const newTitle = title !== undefined ? title : existing.title;
  const newCompleted = completed !== undefined ? (completed ? 1 : 0) : existing.completed;

  db.prepare("UPDATE todos SET title = ?, completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(
    newTitle,
    newCompleted,
    id
  );

  const updated = db.prepare("SELECT * FROM todos WHERE id = ?").get(id);

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

// DELETE /api/v1/todos/:id
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const existing = db.prepare("SELECT * FROM todos WHERE id = ?").get(id);
  if (!existing) {
    return res.status(404).json({ success: false, message: "Tugas tidak ditemukan" });
  }

  db.prepare("DELETE FROM todos WHERE id = ?").run(id);

  return res.json({
    success: true,
    message: "Tugas berhasil dihapus",
  });
});

export default router;
