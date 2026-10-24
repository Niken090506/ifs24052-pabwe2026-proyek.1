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

  return {
    fetchData,
    putAccessToken,
    getAccessToken,
  };
})();

export default apiHelper;
