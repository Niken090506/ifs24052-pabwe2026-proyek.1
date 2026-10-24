import multer from "multer";
import path from "path";
import fs from "fs";

// Pastikan direktori penyimpanan unggahan tersedia (mendukung /tmp/uploads pada runtime Vercel)
export const uploadDir = process.env.VERCEL
  ? path.join("/tmp", "uploads")
  : path.join(process.cwd(), "public", "uploads");

if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (e) {
    console.warn("Could not create upload directory:", e);
  }
}

/**
 * Factory function untuk membuat middleware unggah gambar terstandar Multer.
 * Mengeliminasi duplikasi konfigurasi diskStorage, batasan ukuran, dan filter tipe file.
 * @param {object} options
 * @param {string} [options.prefix="img"] - Awalan penamaan berkas.
 * @param {number} [options.maxSizeMB=5] - Batas ukuran file dalam Megabyte.
 * @returns {import("multer").Multer}
 */
export function createImageUploader({ prefix = "img", maxSizeMB = 5 } = {}) {
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || ".png";
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e6);
      cb(null, `${prefix}-${uniqueSuffix}${ext}`);
    },
  });

  return multer({
    storage,
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Hanya berkas gambar (PNG, JPG, WEBP, GIF) yang diperbolehkan"), false);
      }
    },
  });
}

export default {
  uploadDir,
  createImageUploader,
};
