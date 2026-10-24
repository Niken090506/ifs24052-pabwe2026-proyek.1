import db from "./db.js";

export function getAuthUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, "");
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [userId] = decoded.split(":");
    if (!userId) return null;
    return db.prepare("SELECT id, name, email, avatar FROM users WHERE id = ?").get(userId);
  } catch {
    return null;
  }
}
