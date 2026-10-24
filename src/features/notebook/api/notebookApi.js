import apiHelper from "../../../helpers/apiHelper";

const notebookApi = (() => {
  const BASE_URL = DELCOM_BASEURL;

  async function getFolders() {
    const response = await apiHelper.fetchData(`${BASE_URL}/folders`);
    const result = await response.json();
    if (!result.success && result.status !== "success") {
      throw new Error(result.message || "Gagal mengambil daftar folder");
    }
    return result.data;
  }

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

  async function getNoteById(id) {
    const response = await apiHelper.fetchData(`${BASE_URL}/notes/${id}`);
    const result = await response.json();
    if (!result.success && result.status !== "success") {
      throw new Error(result.message || "Catatan tidak ditemukan");
    }
    return result.data;
  }

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
