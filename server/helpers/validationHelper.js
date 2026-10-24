/**
 * Utility helper untuk sanitasi dan validasi input data sisi backend.
 */

/**
 * Membersihkan string dari potensi injeksi karakter berbahaya dan memangkas whitespace.
 * @param {any} val - Nilai yang akan disanitasi.
 * @returns {string} String bersih.
 */
export function sanitizeText(val) {
  if (typeof val !== "string") return "";
  return val.trim().replace(/[<>]/g, "");
}

/**
 * Memvalidasi apakah alamat email memiliki format standar RFC yang valid.
 * @param {string} email - Alamat email yang diuji.
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email.trim());
}

/**
 * Memvalidasi dan mengurai ID numerik dari parameter rute URL.
 * @param {any} id - Nilai parameter ID.
 * @returns {number|null} Integer positif yang valid atau null jika tidak valid.
 */
export function parseId(id) {
  const num = Number(id);
  if (!id || isNaN(num) || !Number.isInteger(num) || num <= 0) {
    return null;
  }
  return num;
}

export default {
  sanitizeText,
  isValidEmail,
  parseId,
};
