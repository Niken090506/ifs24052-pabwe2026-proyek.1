import { Router } from "express";
import db from "../db.js";

const router = Router();

// Helper to generate a simple token
const makeToken = (user) => Buffer.from(`${user.id}:${user.email}:${Date.now()}`).toString("base64");

// POST /api/v1/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email dan kata sandi wajib diisi" });
  }

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: "Email atau kata sandi salah" });
  }

  const token = makeToken(user);
  return res.json({
    success: true,
    message: "Login berhasil",
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        photo: user.avatar || null,
      },
    },
  });
});

// POST /api/v1/auth/register
router.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Nama, email, dan kata sandi wajib diisi" });
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    return res.status(409).json({ success: false, message: "Email sudah terdaftar" });
  }

  const result = db
    .prepare("INSERT INTO users (name, email, password, avatar) VALUES (?, ?, ?, NULL)")
    .run(name.trim(), email.trim().toLowerCase(), password);

  const user = db.prepare("SELECT id, name, email, avatar FROM users WHERE id = ?").get(result.lastInsertRowid);
  const token = makeToken(user);

  return res.status(201).json({
    success: true,
    message: "Pendaftaran berhasil",
    data: {
      token,
      user: {
        ...user,
        photo: user.avatar || null,
      },
    },
  });
});

// POST /api/v1/auth/logout
router.post("/logout", (req, res) => {
  return res.json({ success: true, message: "Logout berhasil" });
});

export default router;
