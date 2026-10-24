import { getAuthUser } from "../authHelper.js";

/**
 * Middleware untuk memvalidasi otorisasi pengguna secara ketat.
 * Mengembalikan status HTTP 401 Unauthorized jika token tidak ada, salah, atau kedaluwarsa.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export function requireAuth(req, res, next) {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Akses ditolak: Autentikasi dan token valid diperlukan",
    });
  }
  req.user = user;
  next();
}

/**
 * Middleware opsional yang memeriksa identitas pengguna jika token disertakan.
 * @param {import("express").Request} req
 * @param {import("express").Response} _res
 * @param {import("express").NextFunction} next
 */
export function optionalAuth(req, _res, next) {
  req.user = getAuthUser(req);
  next();
}

export default {
  requireAuth,
  optionalAuth,
};
