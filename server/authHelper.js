import crypto from "node:crypto";
import db from "./db.js";

const JWT_SECRET = process.env.JWT_SECRET || "nixbay_secure_hmac_secret_delcom_pabwe_2026_super_key";

/**
 * Melakukan hash kata sandi menggunakan algoritma standar PBKDF2 dengan salt acak dan SHA-512.
 * @param {string} password - Kata sandi mentah.
 * @returns {string} Salt dan hash dalam format `salt:hash`.
 */
export function hashPassword(password) {
  if (!password || typeof password !== "string") return "";
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Memverifikasi kecocokan kata sandi dengan hash tersimpan secara timing-safe.
 * Mendukung migrasi mulus dari plaintext sebelumnya.
 * @param {string} password - Kata sandi mentah masukan pengguna.
 * @param {string} storedPassword - Kata sandi tersimpan di database (salt:hash atau legacy plaintext).
 * @returns {boolean} True jika cocok.
 */
export function verifyPassword(password, storedPassword) {
  if (!password || !storedPassword) return false;

  // Format terenkripsi PBKDF2: salt:hash
  if (storedPassword.includes(":")) {
    const [salt, originalHash] = storedPassword.split(":");
    if (!salt || !originalHash) return false;

    const computedHash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
    const computedBuf = Buffer.from(computedHash, "hex");
    const origBuf = Buffer.from(originalHash, "hex");

    if (computedBuf.length !== origBuf.length) return false;
    return crypto.timingSafeEqual(computedBuf, origBuf);
  }

  // Fallback kompatibilitas untuk akun legacy plaintext (dicek secara timing-safe)
  const passBuf = Buffer.from(password);
  const storedBuf = Buffer.from(storedPassword);
  if (passBuf.length !== storedBuf.length) return false;
  return crypto.timingSafeEqual(passBuf, storedBuf);
}

/**
 * Membuat token autentikasi terenkripsi dengan tanda tangan HMAC-SHA256 untuk mencegah pemalsuan token.
 * @param {object} user - Objek pengguna (id, email).
 * @returns {string} Token Base64 URL-safe bertanda tangan kriptografis.
 */
export function createSecureToken(user) {
  const payload = `${user.id}:${user.email}:${Date.now()}`;
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}::${signature}`).toString("base64");
}

/**
 * Memverifikasi validitas tanda tangan dan kedaluwarsa token kriptografis.
 * @param {string} token - Token Base64 yang diterima dari header Authorization.
 * @returns {{userId: string, email: string}|null}
 */
export function verifySecureToken(token) {
  if (!token || typeof token !== "string") return null;

  try {
    const raw = Buffer.from(token, "base64").toString("utf-8");

    // Format bertanda tangan HMAC: payload::signature
    if (raw.includes("::")) {
      const [payload, signature] = raw.split("::");
      if (!payload || !signature) return null;

      const expectedSignature = crypto.createHmac("sha256", JWT_SECRET).update(payload).digest("hex");
      const sigBuf = Buffer.from(signature, "hex");
      const expBuf = Buffer.from(expectedSignature, "hex");

      if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
        return null; // Tanda tangan tidak cocok / token dipalsukan
      }

      const [userId, email, timestamp] = payload.split(":");
      // Masa berlaku token: 7 hari
      const tokenAge = Date.now() - Number(timestamp);
      if (tokenAge > 7 * 24 * 60 * 60 * 1000) {
        return null; // Token kedaluwarsa
      }

      return { userId, email };
    }

    // Fallback toleran untuk token legacy tanpa tanda tangan selama masa transisi
    const parts = raw.split(":");
    if (parts.length >= 2) {
      return { userId: parts[0], email: parts[1] };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Mengambil data pengguna aktif terautentikasi dari request header HTTP.
 * @param {import("express").Request} req - Express request object.
 * @returns {object|null} Data pengguna dari database jika valid.
 */
export function getAuthUser(req) {
  const authHeader = req.headers?.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, "");

  const verified = verifySecureToken(token);
  if (!verified || !verified.userId) return null;

  try {
    return db
      .prepare("SELECT id, name, email, avatar, created_at FROM users WHERE id = ?")
      .get(verified.userId);
  } catch {
    return null;
  }
}

export default {
  hashPassword,
  verifyPassword,
  createSecureToken,
  verifySecureToken,
  getAuthUser,
};
