import apiHelper from "../../../helpers/apiHelper";

/**
 * Service API untuk modul autentikasi (Registrasi, Login, dan Logout).
 */
const authApi = (() => {
  const BASE_URL = `${DELCOM_BASEURL}/auth`;

  function _url(path) {
    return BASE_URL + path;
  }

  /**
   * Mendaftarkan pengguna baru ke sistem.
   * @param {string} name - Nama lengkap pengguna.
   * @param {string} email - Alamat email unik.
   * @param {string} password - Kata sandi akun.
   * @returns {Promise<string>} Pesan status keberhasilan.
   */
  async function postRegister(name, email, password) {
    const response = await apiHelper.fetchData(_url("/register"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const result = await response.json();
    if (result.status !== "success" && !result.success) {
      const errorDetails =
        result.data && typeof result.data === "object"
          ? Object.values(result.data).flat().join(", ")
          : "";
      const baseMsg = result.message || "Gagal melakukan pendaftaran";
      throw new Error(errorDetails ? `${baseMsg}: ${errorDetails}` : baseMsg);
    }

    return result.message;
  }

  /**
   * Mengotentikasi kredensial pengguna dan mengembalikan token serta data akun.
   * @param {string} email - Alamat email atau nama pengguna.
   * @param {string} password - Kata sandi akun.
   * @returns {Promise<{token: string, user: object}>}
   */
  async function postLogin(email, password) {
    const response = await apiHelper.fetchData(_url("/login"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
    return apiHelper.handleResponse(response, "Gagal login");
  }

  /**
   * Mengakhiri sesi login pengguna aktif.
   * @returns {Promise<string>} Pesan status logout.
   */
  async function postLogout() {
    const response = await apiHelper.fetchData(_url("/logout"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const result = await apiHelper.handleResponse(response, "Gagal logout");
    return result.message || "Logout berhasil";
  }


  return {
    postRegister,
    postLogin,
    postLogout,
  };
})();

export default authApi;
