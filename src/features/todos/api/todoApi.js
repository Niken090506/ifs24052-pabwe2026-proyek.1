import apiHelper from "../../../helpers/apiHelper";

/**
 * Service API untuk modul tugas (Today's Plan).
 */
const todoApi = (() => {
  const BASE_URL = `${DELCOM_BASEURL}/todos`;

  function _url(path = "") {
    return BASE_URL + path;
  }

  /**
   * Mengambil semua daftar tugas milik pengguna yang sedang login.
   * @returns {Promise<Array<object>>}
   */
  async function getTodos() {
    const response = await apiHelper.fetchData(_url());
    const result = await response.json();
    if (!result.success && result.status !== "success") {
      throw new Error(result.message || "Gagal mengambil daftar tugas");
    }
    return result.data;
  }

  /**
   * Membuat tugas baru dalam Today's Plan.
   * @param {string} title - Judul/deskripsi tugas.
   * @returns {Promise<object>} Data tugas baru yang dibuat.
   */
  async function postTodo(title) {
    const response = await apiHelper.fetchData(_url(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    });
    const result = await response.json();
    if (!result.success && result.status !== "success") {
      throw new Error(result.message || "Gagal menambahkan tugas");
    }
    return result.data;
  }

  /**
   * Memperbarui status selesai atau judul tugas.
   * @param {number|string} id - ID tugas yang akan diubah.
   * @param {object} data - Payload pembaruan (completed, title).
   * @returns {Promise<object>} Data tugas yang telah diperbarui.
   */
  async function putTodo(id, data) {
    const response = await apiHelper.fetchData(_url(`/${id}`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!result.success && result.status !== "success") {
      throw new Error(result.message || "Gagal memperbarui tugas");
    }
    return result.data;
  }

  /**
   * Menghapus tugas dari daftar Today's Plan.
   * @param {number|string} id - ID tugas yang akan dihapus.
   * @returns {Promise<string>} Pesan status penghapusan.
   */
  async function deleteTodo(id) {
    const response = await apiHelper.fetchData(_url(`/${id}`), {
      method: "DELETE",
    });
    const result = await response.json();
    if (!result.success && result.status !== "success") {
      throw new Error(result.message || "Gagal menghapus tugas");
    }
    return result.message;
  }

  return {
    getTodos,
    postTodo,
    putTodo,
    deleteTodo,
  };
})();

export default todoApi;
