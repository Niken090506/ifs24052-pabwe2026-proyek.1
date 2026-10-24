import apiHelper from "../../../helpers/apiHelper";

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
    const result = await response.json();
    if (!result.success && result.status !== "success") {
      throw new Error(result.message || "Gagal mengambil daftar folder");
    }
    return result.data;
  }

  /**
   * Membuat folder catatan baru.
   * @param {string} name - Nama folder.
   * @param {string} icon - Ikon folder (contoh: "code", "palette").
   * @param {string} description - Keterangan singkat folder.
   * @returns {Promise<object>}
   */
  async function postFolder(name, icon = "folder", description = "") {
    const response = await apiHelper.fetchData(`${BASE_URL}/folders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, icon, description }),
    });
    const result = await response.json();
    if (!result.success && result.status !== "success") {
      throw new Error(result.message || "Gagal membuat folder");
    }
    return result.data;
  }

  /**
   * Menghapus folder berdasarkan ID.
   * @param {number|string} id - ID folder.
   * @returns {Promise<string>}
   */
  async function deleteFolder(id) {
    const response = await apiHelper.fetchData(`${BASE_URL}/folders/${id}`, {
      method: "DELETE",
    });
    const result = await response.json();
    if (!result.success && result.status !== "success") {
      throw new Error(result.message || "Gagal menghapus folder");
    }
    return result.message;
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
    const result = await response.json();
    if (!result.success && result.status !== "success") {
      throw new Error(result.message || "Gagal mengambil catatan");
    }
    return result.data;
  }

  /**
   * Mengambil detail satu catatan berdasarkan ID.
   * @param {number|string} id - ID catatan.
   * @returns {Promise<object>}
   */
  async function getNoteById(id) {
    const response = await apiHelper.fetchData(`${BASE_URL}/notes/${id}`);
    const result = await response.json();
    if (!result.success && result.status !== "success") {
      throw new Error(result.message || "Catatan tidak ditemukan");
    }
    return result.data;
  }

  /**
   * Membuat catatan baru.
   * @param {string} title - Judul catatan.
   * @param {string} content - Konten markdown catatan.
   * @param {number|string|null} folder_id - ID folder pengelompokan.
   * @returns {Promise<object>}
   */
  async function postNote(title, content, folder_id = null) {
    const response = await apiHelper.fetchData(`${BASE_URL}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, folder_id }),
    });
    const result = await response.json();
    if (!result.success && result.status !== "success") {
      throw new Error(result.message || "Gagal menyimpan catatan");
    }
    return result.data;
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
    const response = await apiHelper.fetchData(`${BASE_URL}/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, folder_id }),
    });
    const result = await response.json();
    if (!result.success && result.status !== "success") {
      throw new Error(result.message || "Gagal memperbarui catatan");
    }
    return result.data;
  }

  /**
   * Menghapus catatan berdasarkan ID.
   * @param {number|string} id - ID catatan.
   * @returns {Promise<string>}
   */
  async function deleteNote(id) {
    const response = await apiHelper.fetchData(`${BASE_URL}/notes/${id}`, {
      method: "DELETE",
    });
    const result = await response.json();
    if (!result.success && result.status !== "success") {
      throw new Error(result.message || "Gagal menghapus catatan");
    }
    return result.message;
  }

  /**
   * Mengunggah gambar ilustrasi/diagram untuk disisipkan ke dalam catatan.
   * @param {File} file - Objek file gambar.
   * @returns {Promise<string>} URL gambar yang berhasil diunggah.
   */
  async function uploadNoteImage(file) {
    const formData = new FormData();
    formData.append("image", file, file.name || "note-image.png");
    const response = await apiHelper.fetchData(`${BASE_URL}/notes/upload-image`, {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    if (!result.success && result.status !== "success") {
      throw new Error(result.message || "Gagal mengunggah gambar");
    }
    return result.data?.url;
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
