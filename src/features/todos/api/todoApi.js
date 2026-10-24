import apiHelper from "../../../helpers/apiHelper";

const todoApi = (() => {
  const BASE_URL = `${DELCOM_BASEURL}/todos`;

  function _url(path = "") {
    return BASE_URL + path;
  }

  async function getTodos() {
    const response = await apiHelper.fetchData(_url());
    const result = await response.json();
    if (!result.success && result.status !== "success") {
      throw new Error(result.message || "Gagal mengambil daftar tugas");
    }
    return result.data;
  }

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
