import { Router } from "express";
import db from "../db.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { parseId } from "../helpers/validationHelper.js";

const router = Router();

// Semua rute riwayat sesi fokus wajib terautentikasi
router.use(requireAuth);

// GET /api/v1/sessions (Hanya riwayat sesi milik pengguna aktif)
router.get("/", (req, res) => {
  const userId = req.user.id;

  const sessions = db
    .prepare("SELECT * FROM focus_sessions WHERE user_id = ? ORDER BY completed_at DESC LIMIT 50")
    .all(userId);

  const stats = db
    .prepare(
      `SELECT 
        COUNT(*) as total_sessions,
        COALESCE(SUM(duration_minutes), 0) as total_minutes
       FROM focus_sessions
       WHERE user_id = ?`
    )
    .get(userId);

  return res.json({
    success: true,
    data: {
      stats: {
        totalSessions: stats?.total_sessions || 0,
        totalMinutes: stats?.total_minutes || 0,
        totalHours: ((stats?.total_minutes || 0) / 60).toFixed(1),
      },
      sessions: sessions || [],
    },
  });
});

// POST /api/v1/sessions (Mencatat sesi fokus baru berpemilik ketat)
router.post("/", (req, res) => {
  const userId = req.user.id;
  const { duration_minutes } = req.body;

  const minutes = parseId(duration_minutes) || 25;
  if (minutes < 1 || minutes > 1440) {
    return res.status(400).json({ success: false, message: "Durasi fokus harus antara 1 hingga 1440 menit" });
  }

  const result = db
    .prepare("INSERT INTO focus_sessions (user_id, duration_minutes) VALUES (?, ?)")
    .run(userId, minutes);

  const session = db
    .prepare("SELECT * FROM focus_sessions WHERE id = ? AND user_id = ?")
    .get(result.lastInsertRowid, userId);

  return res.status(201).json({
    success: true,
    message: "Sesi fokus berhasil disimpan",
    data: session,
  });
});

export default router;
