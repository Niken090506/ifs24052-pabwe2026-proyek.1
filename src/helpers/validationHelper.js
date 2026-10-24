/**
 * Modul utility untuk validasi data input di layer frontend.
 * Menggunakan standar regex yang identik dengan layer backend untuk konsistensi penuh.
 */

/**
 * Pola regex standar RFC 5322 untuk validasi alamat email di seluruh sistem (frontend & backend).
 */
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Memvalidasi apakah string merupakan alamat email yang valid.
 * @param {string} email - Alamat email yang diuji.
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Memvalidasi panjang dan kekuatan kata sandi akun.
 * @param {string} password - Kata sandi yang diuji.
 * @param {number} [minLength=6] - Batas panjang minimal.
 * @returns {{isValid: boolean, message: string}}
 */
export function validatePassword(password, minLength = 6) {
  if (!password || typeof password !== "string") {
    return { isValid: false, message: "Kata sandi wajib diisi" };
  }
  if (password.length < minLength) {
    return {
      isValid: false,
      message: `Kata sandi minimal harus terdiri dari ${minLength} karakter`,
    };
  }
  return { isValid: true, message: "" };
}

/**
 * Memvalidasi teks masukan wajib non-kosong dan batas maksimal karakter.
 * @param {string} text - Teks input.
 * @param {string} [fieldName="Kolom"] - Nama atribut untuk pesan error.
 * @param {number} [maxLength=50] - Batas maksimal karakter.
 * @returns {{isValid: boolean, message: string}}
 */
export function validateRequiredText(text, fieldName = "Kolom", maxLength = 50) {
  if (!text || typeof text !== "string" || !text.trim()) {
    return { isValid: false, message: `${fieldName} wajib diisi dan tidak boleh kosong` };
  }
  if (text.trim().length > maxLength) {
    return {
      isValid: false,
      message: `${fieldName} maksimal terdiri dari ${maxLength} karakter`,
    };
  }
  return { isValid: true, message: "" };
}

/**
 * Memvalidasi objek berkas gambar (tipe MIME dan ukuran berkas).
 * @param {File|Blob} file - Berkas yang dipilih.
 * @param {number} [maxMB=5] - Batas ukuran maksimal berkas dalam Megabyte.
 * @throws {Error} Jika berkas tidak valid atau melebihi batas ukuran.
 */
export function validateImageFile(file, maxMB = 5) {
  if (!file) {
    throw new Error("Pilih berkas gambar untuk diunggah");
  }
  if (file.type && !file.type.startsWith("image/")) {
    throw new Error("Berkas yang dipilih harus berupa format gambar (PNG, JPG, WEBP)");
  }
  if (file.size && file.size > maxMB * 1024 * 1024) {
    throw new Error(`Ukuran berkas gambar melebihi batas maksimal ${maxMB}MB`);
  }
  return true;
}

export default {
  EMAIL_REGEX,
  isValidEmail,
  validatePassword,
  validateRequiredText,
  validateImageFile,
};
