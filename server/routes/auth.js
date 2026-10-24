import { Router } from "express";
import db from "../db.js";
import {
  hashPassword,
  verifyPassword,
  createSecureToken,
} from "../authHelper.js";

const router = Router();

// In-memory rate limiting untuk percobaan login gagal
const failedLoginAttempts = new Map();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 menit

function checkRateLimit(key) {
  const record = failedLoginAttempts.get(key);
  if (!record) return { isLocked: false };

  const now = Date.now();
  if (now - record.lastAttempt > LOCKOUT_DURATION_MS) {
    failedLoginAttempts.delete(key);
    return { isLocked: false };
  }

  if (record.count >= MAX_FAILED_ATTEMPTS) {
    const remainingSec = Math.ceil((LOCKOUT_DURATION_MS - (now - record.lastAttempt)) / 1000);
    return { isLocked: true, remainingSec };
  }

  return { isLocked: false };
}

function recordFailedAttempt(key) {
  const record = failedLoginAttempts.get(key) || { count: 0, lastAttempt: Date.now() };
  record.count += 1;
  record.lastAttempt = Date.now();
  failedLoginAttempts.set(key, record);
}

function clearFailedAttempts(key) {
  failedLoginAttempts.delete(key);
}

// POST /api/v1/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email dan kata sandi wajib diisi" });
  }

  const cleanEmail = email.trim().toLowerCase();
  const clientIp = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
  const rateLimitKey = `${clientIp}:${cleanEmail}`;

  // 1. Cek proteksi brute force rate limiting
  const { isLocked, remainingSec } = checkRateLimit(rateLimitKey);
  if (isLocked) {
    return res.status(429).json({
      success: false,
      message: `Terlalu banyak percobaan login yang gagal. Silakan coba lagi dalam ${remainingSec} detik.`,
    });
  }

  // 2. Cari pengguna berdasarkan email atau nama
  const user = db.prepare("SELECT * FROM users WHERE email = ? OR name = ?").get(cleanEmail, email.trim());
  if (!user || !verifyPassword(password, user.password)) {
    recordFailedAttempt(rateLimitKey);
    return res.status(401).json({ success: false, message: "Email atau kata sandi salah" });
  }

  // 3. Reset rate limit setelah login sukses
  clearFailedAttempts(rateLimitKey);

  // 4. Migrasi otomatis: jika kata sandi di database masih plaintext, hash segera dengan PBKDF2
  if (user.password && !user.password.includes(":")) {
    try {
      const secureHash = hashPassword(password);
      db.prepare("UPDATE users SET password = ? WHERE id = ?").run(secureHash, user.id);
    } catch (e) {
      console.warn("Gagal meng-upgrade password hash:", e);
    }
  }

  // 5. Buat token terenkripsi HMAC-SHA256
  const token = createSecureToken(user);
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

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  // Validasi format email dasar
  if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
    return res.status(400).json({ success: false, message: "Format alamat email tidak valid" });
  }

  // Minimal panjang kata sandi
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: "Kata sandi minimal harus terdiri dari 6 karakter" });
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(cleanEmail);
  if (existing) {
    return res.status(409).json({ success: false, message: "Email sudah terdaftar" });
  }

  // Simpan kata sandi yang telah di-hash secara aman menggunakan PBKDF2
  const hashedPassword = hashPassword(password);
  const result = db
    .prepare("INSERT INTO users (name, email, password, avatar) VALUES (?, ?, ?, NULL)")
    .run(cleanName, cleanEmail, hashedPassword);

  const user = db.prepare("SELECT id, name, email, avatar FROM users WHERE id = ?").get(result.lastInsertRowid);
  const token = createSecureToken(user);

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
router.post("/logout", (_req, res) => {
  return res.json({ success: true, message: "Logout berhasil" });
});

export default router;
