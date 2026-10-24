import apiHelper from "./apiHelper";
import { validateImageFile } from "./validationHelper";

/**
 * Mengunggah berkas gambar multipart ke endpoint backend secara terpusat.
 * Mengeliminasi duplikasi pembentukan FormData dan validasi berkas di notes dan users.
 * @param {string} endpoint - Path endpoint API (misal "/notes/upload-image" atau "/users/me/photo").
 * @param {File|Blob} file - Berkas gambar yang akan diunggah.
 * @param {string} [fieldName="image"] - Nama field FormData ("image" atau "photo").
 * @param {number} [maxSizeMB=5] - Batas ukuran maksimal gambar dalam Megabyte.
 * @param {string} [fallbackMessage="Gagal mengunggah berkas gambar"] - Pesan kegagalan default.
 * @returns {Promise<any>} Data hasil respon dari backend.
 */
export async function uploadImageFile(
  endpoint,
  file,
  fieldName = "image",
  maxSizeMB = 5,
  fallbackMessage = "Gagal mengunggah berkas gambar"
) {
  validateImageFile(file, maxSizeMB);

  const formData = new FormData();
  formData.append(fieldName, file, file.name || "upload.png");

  const fullUrl = endpoint.startsWith("http") ? endpoint : `${DELCOM_BASEURL}${endpoint}`;
  const response = await apiHelper.fetchData(fullUrl, {
    method: "POST",
    body: formData,
  });

  return apiHelper.handleResponse(response, fallbackMessage);
}

export default {
  uploadImageFile,
};
