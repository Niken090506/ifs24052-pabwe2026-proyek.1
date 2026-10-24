import { Router } from "express";
import db from "../db.js";
import { getAuthUser } from "../authHelper.js";

const router = Router();

// GET /api/v1/sessions (scoped to logged in user)
router.get("/", (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.json({
      success: true,
      data: {
        stats: {
          totalSessions: 0,
          totalMinutes: 0,
          totalHours: "0.0",
        },
        sessions: [],
      },
    });
  }

  const sessions = db
    .prepare("SELECT * FROM focus_sessions WHERE user_id = ? ORDER BY completed_at DESC LIMIT 50")
    .all(user.id);

  const stats = db
    .prepare(
      `SELECT 
        COUNT(*) as total_sessions,
        COALESCE(SUM(duration_minutes), 0) as total_minutes
       FROM focus_sessions
       WHERE user_id = ?`
    )
    .get(user.id);

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

// POST /api/v1/sessions
router.post("/", (req, res) => {
  const user = getAuthUser(req);
  const userId = user ? user.id : 1;
  const { duration_minutes } = req.body;
  const minutes = Number(duration_minutes) || 25;

  const result = db
    .prepare("INSERT INTO focus_sessions (user_id, duration_minutes) VALUES (?, ?)")
    .run(userId, minutes);
  const session = db.prepare("SELECT * FROM focus_sessions WHERE id = ?").get(result.lastInsertRowid);

  return res.status(201).json({
    success: true,
    message: "Sesi fokus berhasil disimpan",
    data: session,
  });
});

export default router;

