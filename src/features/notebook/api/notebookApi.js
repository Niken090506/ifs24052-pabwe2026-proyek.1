import apiHelper from "../../../helpers/apiHelper";
import { uploadImageFile } from "../../../helpers/uploadHelper";

/**
 * Service API untuk modul buku catatan (Notebook, Folder, Catatan, dan Unggah Gambar).
 */
const notebookApi = (() => {
  const BASE_URL = DELCOM_BASEURL;

  /**
   * Mengambil semua folder catatan milik pengguna.
   * @returns {Promise<Array<object>>}
   */
  async function getFolders() {
    const response = await apiHelper.fetchData(`${BASE_URL}/folders`);
    return apiHelper.handleResponse(response, "Gagal mengambil daftar folder");
  }

  /**
   * Membuat folder catatan baru.
   * @param {string} name - Nama folder.
   * @param {string} icon - Ikon folder (contoh: "code", "palette").
   * @param {string} description - Keterangan singkat folder.
   * @returns {Promise<object>}
   */
  async function postFolder(name, icon = "folder", description = "") {
    if (!name || typeof name !== "string" || !name.trim()) {
      throw new Error("Nama folder wajib diisi");
    }
    const response = await apiHelper.fetchData(`${BASE_URL}/folders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), icon, description }),
    });
    return apiHelper.handleResponse(response, "Gagal membuat folder");
  }

  /**
   * Menghapus folder berdasarkan ID.
   * @param {number|string} id - ID folder.
   * @returns {Promise<string>}
   */
  async function deleteFolder(id) {
    if (!id) {
      throw new Error("ID folder tidak valid");
    }
    const response = await apiHelper.fetchData(`${BASE_URL}/folders/${id}`, {
      method: "DELETE",
    });
    const result = await apiHelper.handleResponse(response, "Gagal menghapus folder");
    return result.message || "Berhasil menghapus folder";
  }

  /**
   * Mengambil daftar catatan berdasarkan filter folder dan kata kunci pencarian.
   * @param {number|string} folderId - ID folder filter atau "all".
   * @param {string} searchQuery - Kata kunci pencarian judul atau isi catatan.
   * @returns {Promise<Array<object>>}
   */
  async function getNotes(folderId = "all", searchQuery = "") {
    const params = new URLSearchParams();
    if (folderId && folderId !== "all") params.append("folder_id", folderId);
    if (searchQuery) params.append("q", searchQuery);

    const qs = params.toString() ? `?${params.toString()}` : "";
    const response = await apiHelper.fetchData(`${BASE_URL}/notes${qs}`);
    return apiHelper.handleResponse(response, "Gagal mengambil catatan");
  }

  /**
   * Mengambil detail satu catatan berdasarkan ID.
   * @param {number|string} id - ID catatan.
   * @returns {Promise<object>}
   */
  async function getNoteById(id) {
    if (!id) {
      throw new Error("ID catatan tidak valid");
    }
    const response = await apiHelper.fetchData(`${BASE_URL}/notes/${id}`);
    return apiHelper.handleResponse(response, "Catatan tidak ditemukan");
  }

  /**
   * Membuat catatan baru.
   * @param {string} title - Judul catatan.
   * @param {string} content - Konten markdown catatan.
   * @param {number|string|null} folder_id - ID folder pengelompokan.
   * @returns {Promise<object>}
   */
  async function postNote(title, content, folder_id = null) {
    if (!title || typeof title !== "string" || !title.trim()) {
      throw new Error("Judul catatan wajib diisi");
    }
    const response = await apiHelper.fetchData(`${BASE_URL}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), content: content || "", folder_id }),
    });
    return apiHelper.handleResponse(response, "Gagal menyimpan catatan");
  }

  /**
   * Memperbarui data catatan yang sudah ada.
   * @param {number|string} id - ID catatan.
   * @param {string} title - Judul baru.
   * @param {string} content - Konten baru.
   * @param {number|string|null} folder_id - ID folder baru.
   * @returns {Promise<object>}
   */
  async function putNote(id, title, content, folder_id) {
    if (!id) {
      throw new Error("ID catatan tidak valid");
    }
    if (!title || typeof title !== "string" || !title.trim()) {
      throw new Error("Judul catatan wajib diisi");
    }
    const response = await apiHelper.fetchData(`${BASE_URL}/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), content: content || "", folder_id }),
    });
    return apiHelper.handleResponse(response, "Gagal memperbarui catatan");
  }

  /**
   * Menghapus catatan berdasarkan ID.
   * @param {number|string} id - ID catatan.
   * @returns {Promise<string>}
   */
  async function deleteNote(id) {
    if (!id) {
      throw new Error("ID catatan tidak valid");
    }
    const response = await apiHelper.fetchData(`${BASE_URL}/notes/${id}`, {
      method: "DELETE",
    });
    const result = await apiHelper.handleResponse(response, "Gagal menghapus catatan");
    return result.message || "Berhasil menghapus catatan";
  }

  /**
   * Mengunggah gambar ilustrasi/diagram untuk disisipkan ke dalam catatan.
   * @param {File} file - Objek file gambar.
   * @returns {Promise<string>} URL gambar yang berhasil diunggah.
   */
  async function uploadNoteImage(file) {
    const data = await uploadImageFile("/notes/upload-image", file, "image", 5);
    return data?.url;
  }



  return {
    getFolders,
    postFolder,
    deleteFolder,
    getNotes,
    getNoteById,
    postNote,
    putNote,
    deleteNote,
    uploadNoteImage,
  };
})();

export default notebookApi;
