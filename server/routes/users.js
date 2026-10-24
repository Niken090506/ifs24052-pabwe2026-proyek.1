import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import db from "../db.js";
import { hashPassword, verifyPassword } from "../authHelper.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { sanitizeText, isValidEmail } from "../helpers/validationHelper.js";

const router = Router();

// Semua rute pengguna wajib terotorisasi ketat
router.use(requireAuth);

// Pastikan direktori unggahan foto profil tersedia (gunakan /tmp/uploads di runtime Vercel)
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
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".png";
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e6);
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // Batas 3MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Hanya berkas gambar yang diperbolehkan untuk foto profil"), false);
    }
  },
});

function formatUser(user) {
  if (!user) return null;
  return {
    ...user,
    photo: user.avatar || null,
  };
}

// GET /api/v1/users/me (Secured - Profil pengguna aktif)
router.get("/me", (req, res) => {
  const user = req.user;
  return res.json({ success: true, data: { user: formatUser(user) } });
});

// PUT /api/v1/users/me (Secured - Ubah profil dengan validasi ketat)
router.put("/me", (req, res) => {
  const userId = req.user.id;
  const { name, email, password } = req.body;
  const existing = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);

  if (!existing) {
    return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan" });
  }

  const cleanName = name ? sanitizeText(name) : existing.name;
  if (!cleanName) {
    return res.status(400).json({ success: false, message: "Nama tidak boleh kosong" });
  }

  let cleanEmail = existing.email;
  if (email && email.trim() !== existing.email) {
    cleanEmail = email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ success: false, message: "Format alamat email tidak valid" });
    }
    const duplicate = db.prepare("SELECT id FROM users WHERE email = ? AND id != ?").get(cleanEmail, userId);
    if (duplicate) {
      return res.status(409).json({ success: false, message: "Email sudah digunakan oleh pengguna lain" });
    }
  }

  let newPassword = existing.password;
  if (password && password.trim()) {
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Kata sandi minimal 6 karakter" });
    }
    newPassword = hashPassword(password);
  }

  db.prepare("UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?").run(
    cleanName,
    cleanEmail,
    newPassword,
    userId
  );

  const updated = db.prepare("SELECT id, name, email, avatar, created_at FROM users WHERE id = ?").get(userId);
  return res.json({ success: true, message: "Profil berhasil diperbarui", data: { user: formatUser(updated) } });
});

// POST /api/v1/users/me/photo (Secured - upload avatar)
router.post("/me/photo", (req, res) => {
  upload.single("photo")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || "Gagal mengunggah foto profil" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Pilih file gambar untuk diunggah" });
    }

    const userId = req.user.id;
    const avatarUrl = `/uploads/${req.file.filename}`;

    db.prepare("UPDATE users SET avatar = ? WHERE id = ?").run(avatarUrl, userId);

    const updated = db.prepare("SELECT id, name, email, avatar, created_at FROM users WHERE id = ?").get(userId);
    return res.json({
      success: true,
      message: "Foto profil berhasil diperbarui",
      data: { user: formatUser(updated) },
    });
  });
});

// PUT /api/v1/users/password (Secured - ubah kata sandi dengan validasi keamanan)
router.put("/password", (req, res) => {
  const userId = req.user.id;
  const { password, new_password, new_password_confirmation } = req.body;

  if (!new_password || new_password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Kata sandi baru minimal harus terdiri dari 6 karakter",
    });
  }

  if (new_password_confirmation && new_password !== new_password_confirmation) {
    return res.status(400).json({
      success: false,
      message: "Konfirmasi kata sandi baru tidak cocok",
    });
  }

  // Jika kata sandi lama dikirimkan, verifikasi kecocokan
  if (password) {
    const fullUser = db.prepare("SELECT password FROM users WHERE id = ?").get(userId);
    if (fullUser && !verifyPassword(password, fullUser.password)) {
      return res.status(400).json({
        success: false,
        message: "Kata sandi lama tidak sesuai",
      });
    }
  }

  // Simpan hash kata sandi baru yang aman
  const secureNewHash = hashPassword(new_password);
  db.prepare("UPDATE users SET password = ? WHERE id = ?").run(secureNewHash, userId);

  return res.json({ success: true, message: "Kata sandi berhasil diperbarui" });
});

// GET /api/v1/users (Secured - Hanya pengguna terdaftar yang dapat melihat daftar teman/pengguna)
router.get("/", (_req, res) => {
  const users = db.prepare("SELECT id, name, email, avatar, created_at FROM users ORDER BY id ASC").all();
  return res.json({ success: true, data: { users: users.map(formatUser) } });
});

export default router;
