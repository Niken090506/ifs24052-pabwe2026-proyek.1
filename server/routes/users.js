import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import db from "../db.js";
import { getAuthUser, hashPassword, verifyPassword } from "../authHelper.js";

const router = Router();

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
});

function formatUser(user) {
  if (!user) return null;
  return {
    ...user,
    photo: user.avatar || null,
  };
}

// GET /api/v1/users/me (Secured)
router.get("/me", (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Akses ditolak: Anda harus login terlebih dahulu untuk mengakses data profil",
    });
  }
  return res.json({ success: true, data: { user: formatUser(user) } });
});

// PUT /api/v1/users/me (Secured)
router.put("/me", (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Akses ditolak: Anda harus login terlebih dahulu untuk mengubah profil",
    });
  }

  const { name, email, password } = req.body;
  const existing = db.prepare("SELECT * FROM users WHERE id = ?").get(user.id);

  const newName = name ? name.trim() : existing.name;
  const newEmail = email ? email.trim().toLowerCase() : existing.email;
  const newPassword = password ? hashPassword(password) : existing.password;

  db.prepare("UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?").run(
    newName,
    newEmail,
    newPassword,
    user.id
  );

  const updated = db.prepare("SELECT id, name, email, avatar, created_at FROM users WHERE id = ?").get(user.id);
  return res.json({ success: true, message: "Profil berhasil diperbarui", data: { user: formatUser(updated) } });
});

// POST /api/v1/users/me/photo (Secured - upload avatar)
router.post("/me/photo", upload.single("photo"), (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, message: "Akses ditolak" });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, message: "Pilih file gambar untuk diunggah" });
  }

  const avatarUrl = `/uploads/${req.file.filename}`;

  db.prepare("UPDATE users SET avatar = ? WHERE id = ?").run(avatarUrl, user.id);

  const updated = db.prepare("SELECT id, name, email, avatar, created_at FROM users WHERE id = ?").get(user.id);
  return res.json({
    success: true,
    message: "Foto profil berhasil diperbarui",
    data: { user: formatUser(updated) },
  });
});

// PUT /api/v1/users/password (Secured - ubah kata sandi dengan validasi keamanan)
router.put("/password", (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, message: "Akses ditolak" });
  }

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
    const fullUser = db.prepare("SELECT password FROM users WHERE id = ?").get(user.id);
    if (fullUser && !verifyPassword(password, fullUser.password)) {
      return res.status(400).json({
        success: false,
        message: "Kata sandi lama tidak sesuai",
      });
    }
  }

  // Simpan hash kata sandi baru yang aman
  const secureNewHash = hashPassword(new_password);
  db.prepare("UPDATE users SET password = ? WHERE id = ?").run(secureNewHash, user.id);

  return res.json({ success: true, message: "Kata sandi berhasil diperbarui" });
});

// GET /api/v1/users (list all users)
router.get("/", (_req, res) => {
  const users = db.prepare("SELECT id, name, email, avatar, created_at FROM users ORDER BY id ASC").all();
  return res.json({ success: true, data: { users: users.map(formatUser) } });
});

export default router;
