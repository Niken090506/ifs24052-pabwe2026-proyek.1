/**
 * Modul pembantu untuk interaksi HTTP Fetch dengan autentikasi Bearer token terpusat.
 */
const apiHelper = (() => {
  /**
   * Mengirim request HTTP ke server dengan otomatisasi header Authorization dan resolution URL.
   * @param {string} url - Target URL atau path relatif endpoint API.
   * @param {RequestInit} options - Opsi standar Fetch API (method, headers, body, dll).
   * @returns {Promise<Response>}
   */
  async function fetchData(url, options = {}) {
    const urlQuery = url.includes("?") ? url.split("?")[1] : "";
    const urlWithoutQuery = url.replace(`?${urlQuery}`, "");
    const fixUrl = urlWithoutQuery.endsWith("/")
      ? urlWithoutQuery.slice(0, -1)
      : urlWithoutQuery;
    const fullUrl = fixUrl + (urlQuery ? `?${urlQuery}` : "");
    let finalUrl = fullUrl;
    if (finalUrl.startsWith("/")) {
      if (
        typeof window !== "undefined" &&
        window.location &&
        window.location.origin &&
        window.location.origin !== "null"
      ) {
        finalUrl = `${window.location.origin}${finalUrl}`;
      } else {
        finalUrl = `http://localhost:8000${finalUrl}`;
      }
    }

    const token = getAccessToken();
    const headers = {
      ...(options.headers || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return fetch(finalUrl, {
      ...options,
      mode: "cors",
      headers,
    });
  }

  /**
   * Menyimpan token autentikasi ke dalam localStorage browser.
   * @param {string|null} token - JWT / Bearer token string.
   */
  function putAccessToken(token) {
    if (!token) {
      localStorage.removeItem("accessToken");
    } else {
      localStorage.setItem("accessToken", token);
    }
  }

  /**
   * Mengambil token autentikasi yang tersimpan di localStorage browser.
   * @returns {string|null}
   */
  function getAccessToken() {
    return localStorage.getItem("accessToken");
  }

  /**
   * Memproses respon HTTP Fetch secara terstandar untuk memvalidasi status dan mengekstrak payload.
   * @param {Response} response - Respon dari fetch API.
   * @param {string} [defaultMessage="Terjadi kesalahan pada server"] - Pesan kegagalan default.
   * @returns {Promise<any>} Objek result.data atau result jika data tidak ada.
   * @throws {Error} Jika respon HTTP gagal (!ok) atau status API bukan "success".
   */
  async function handleResponse(response, defaultMessage = "Terjadi kesalahan pada server") {
    return handleApiResponse(response, defaultMessage);
  }

  return {
    fetchData,
    putAccessToken,
    getAccessToken,
    handleResponse,
  };
})();

/**
 * Memproses respon HTTP Fetch secara terstandar untuk memvalidasi status dan mengekstrak data.
 * @param {Response} response - Respon dari fetch API.
 * @param {string} [defaultMessage="Terjadi kesalahan pada server"] - Pesan kegagalan default.
 * @returns {Promise<any>} Data respon API.
 * @throws {Error}
 */
export async function handleApiResponse(response, defaultMessage = "Terjadi kesalahan pada server") {
  let result;
  try {
    result = await response.json();
  } catch (_err) {
    throw new Error(defaultMessage || "Format respon server tidak valid");
  }

  if (response.ok === false || (!result.success && result.status !== "success")) {
    throw new Error(result.message || defaultMessage);
  }

  return result.data !== undefined ? result.data : result;
}


export default apiHelper;

