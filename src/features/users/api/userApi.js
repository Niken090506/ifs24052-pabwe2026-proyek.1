import apiHelper from "../../../helpers/apiHelper";

/**
 * Service API untuk modul data pengguna dan profil akun.
 */
const userApi = (() => {
  const BASE_URL = `${DELCOM_BASEURL}/users`;

  function _url(path) {
    return BASE_URL + path;
  }

  /**
   * Mengambil daftar semua pengguna terdaftar.
   * @returns {Promise<Array<object>>}
   */
  async function getUsers() {
    const response = await apiHelper.fetchData(_url("/"), {
      method: "GET",
    });

    const result = await response.json();
    if (result.status !== "success" && !result.success) {
      throw new Error(result.message || "Gagal mengambil data pengguna");
    }

    return result.data?.users || [];
  }

  /**
   * Mengambil detail pengguna berdasarkan ID pengguna.
   * @param {number|string} userId - ID target pengguna.
   * @returns {Promise<object>}
   */
  async function getUserById(userId) {
    const response = await apiHelper.fetchData(_url(`/${userId}`), {
      method: "GET",
    });

    const result = await response.json();
    if (result.status !== "success" && !result.success) {
      throw new Error(result.message || "Gagal mengambil detail pengguna");
    }

    return result.data?.user;
  }

  /**
   * Mengambil profil akun pengguna yang sedang login (/me).
   * @returns {Promise<object>}
   */
  async function getProfile() {
    const response = await apiHelper.fetchData(_url("/me"), {
      method: "GET",
    });

    const result = await response.json();
    if (result.status !== "success" && !result.success) {
      throw new Error(result.message || "Gagal mengambil data profil");
    }

    return result.data?.user;
  }

  /**
   * Memperbarui informasi nama dan email profil akun aktif.
   * @param {string} name - Nama baru pengguna.
   * @param {string} email - Alamat email baru.
   * @returns {Promise<object>} Data profil yang telah diperbarui.
   */
  async function putProfile(name, email) {
    const response = await apiHelper.fetchData(_url("/me"), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
      }),
    });

    const result = await response.json();
    if (result.status !== "success" && !result.success) {
      throw new Error(result.message || "Gagal mengubah profil");
    }

    return result.data?.user;
  }

  /**
   * Mengunggah foto profil baru untuk akun pengguna aktif.
   * @param {File} photo - Objek file gambar foto profil.
   * @returns {Promise<string>} Pesan status keberhasilan.
   */
  async function postProfilePhoto(photo) {
    const formData = new FormData();
    formData.append("photo", photo, photo.name || "profile.png");
    const response = await apiHelper.fetchData(_url("/me/photo"), {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    if (result.status !== "success" && !result.success) {
      throw new Error(result.message || "Gagal mengubah foto profil");
    }

    return result.message;
  }

  /**
   * Memperbarui kata sandi akun pengguna.
   * @param {string} password - Kata sandi lama.
   * @param {string} newPassword - Kata sandi baru.
   * @param {string} [newPasswordConfirmation] - Konfirmasi kata sandi baru.
   * @returns {Promise<string>} Pesan status keberhasilan.
   */
  async function putProfilePassword(password, newPassword, newPasswordConfirmation) {
    const response = await apiHelper.fetchData(_url("/password"), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation || newPassword,
      }),
    });

    const result = await response.json();
    if (result.status !== "success" && !result.success) {
      throw new Error(result.message || "Gagal mengubah kata sandi");
    }

    return result.message;
  }

  return {
    getUsers,
    getUserById,
    getProfile,
    putProfile,
    postProfilePhoto,
    putProfilePassword,
  };
})();

export default userApi;
