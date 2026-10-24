import Swal from "sweetalert2";

/**
 * Menampilkan modal dialog error interaktif menggunakan SweetAlert2.
 * @param {string} message - Pesan kesalahan yang akan ditampilkan.
 * @returns {Promise<any>}
 */
export function showErrorDialog(message) {
  return Swal.fire({
    title: "Terjadi Kesalahan",
    text: message,
    icon: "error",
    confirmButtonText: "Tutup",
    confirmButtonColor: "#ef4444",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.close();
    }
    return result;
  });
}

/**
 * Menampilkan modal dialog peringatan interaktif menggunakan SweetAlert2.
 * @param {string} message - Pesan peringatan yang akan ditampilkan.
 * @returns {Promise<any>}
 */
export function showWarningDialog(message) {
  return Swal.fire({
    title: "Peringatan",
    text: message,
    icon: "warning",
    confirmButtonText: "Tutup",
    confirmButtonColor: "#f59e0b",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.close();
    }
    return result;
  });
}

/**
 * Menampilkan modal dialog sukses interaktif menggunakan SweetAlert2.
 * @param {string} message - Pesan keberhasilan yang akan ditampilkan.
 * @returns {Promise<any>}
 */
export function showSuccessDialog(message) {
  return Swal.fire({
    title: "Tindakan Berhasil",
    text: message,
    icon: "success",
    confirmButtonText: "Tutup",
    confirmButtonColor: "#10b981",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.close();
    }
    return result;
  });
}

/**
 * Menampilkan modal konfirmasi aksi (Ya / Tidak).
 * @param {string} message - Pertanyaan konfirmasi untuk pengguna.
 * @returns {Promise<any>}
 */
export function showConfirmDialog(message) {
  return Swal.fire({
    title: "Konfirmasi",
    text: message,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Ya",
    cancelButtonText: "Tidak",
    confirmButtonColor: "#6366f1",
    cancelButtonColor: "#94a3b8",
  });
}

/**
 * Memformat tanggal string ISO menjadi format lokal Indonesia yang mudah dibaca.
 * @param {string|Date} date - String tanggal atau objek Date.
 * @returns {string} Tanggal terformat (contoh: "24 Oktober 2026 15.30").
 */
export function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Memformat nominal angka ke format mata uang Rupiah (IDR).
 * @param {number|string} number - Nilai numerik yang akan diformat.
 * @returns {string} Format mata uang (contoh: "Rp 150.000").
 */
export function formatRupiah(number) {
  if (number === undefined || number === null || number === "" || isNaN(Number(number))) {
    return "Rp 0";
  }
  const formatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(number));

  return formatted.replace(/\u00a0/g, " ");
}

/**
 * Memastikan URL gambar menggunakan protokol HTTPS yang aman dan valid.
 * @param {string} url - URL gambar asli.
 * @returns {string} URL gambar aman (HTTPS).
 */
export function formatImageUrl(url) {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("http://")) {
    return trimmed.replace(/^http:\/\//i, "https://");
  }
  return trimmed;
}
