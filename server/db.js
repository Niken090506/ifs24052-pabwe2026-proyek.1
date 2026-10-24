import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbPath = path.join(__dirname, "nixbay.sqlite");

// On Vercel / serverless runtime, filesystem is read-only except /tmp
if (process.env.VERCEL) {
  const tmpDbPath = path.join("/tmp", "nixbay.sqlite");
  if (!fs.existsSync(tmpDbPath) && fs.existsSync(dbPath)) {
    try {
      fs.copyFileSync(dbPath, tmpDbPath);
    } catch (e) {
      console.warn("Could not copy sqlite DB to /tmp:", e);
    }
  }
  dbPath = tmpDbPath;
}

const db = new DatabaseSync(dbPath);

// Enable foreign keys
db.exec("PRAGMA foreign_keys = ON;");

// Initialize Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    avatar TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS folders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER DEFAULT 1,
    name TEXT NOT NULL,
    icon TEXT DEFAULT 'folder',
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER DEFAULT 1,
    folder_id INTEGER,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    preview TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER DEFAULT 1,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS focus_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER DEFAULT 1,
    duration_minutes INTEGER NOT NULL,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed initial data if tables are empty
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get().count;
if (userCount === 0) {
  db.prepare(`
    INSERT INTO users (id, name, email, password, avatar)
    VALUES (1, 'Niken Sitohang', 'niken@delcom.org', 'password123', '/assets/avatar.jpeg')
  `).run();

  // Folders
  const insertFolder = db.prepare(`
    INSERT INTO folders (id, user_id, name, icon, description)
    VALUES (?, 1, ?, ?, ?)
  `);
  insertFolder.run(1, "Alstrudat", "code", "Struktur Data & Algoritma");
  insertFolder.run(2, "UI/UX", "palette", "User Interface & Experience");
  insertFolder.run(3, "Personal", "user", "Personal thoughts and logs");
  insertFolder.run(4, "Web Programming", "globe", "Frontend and Backend Web Dev");
  insertFolder.run(5, "Basdat", "database", "Basis Data & SQL");

  // Notes
  const insertNote = db.prepare(`
    INSERT INTO notes (user_id, folder_id, title, content, preview)
    VALUES (1, ?, ?, ?, ?)
  `);
  insertNote.run(
    1,
    "Alstrudat bab 1",
    "# Alstrudat Bab 1\n\nJoins, Subquery, and Group by Practice...\n\n- Inner Join\n- Left Outer Join\n- Self Join",
    "Joins, Subquery, and Group by Practice..."
  );
  insertNote.run(
    5,
    "SQL Query Pratice",
    "# SQL Query Pratice\n\nJoins, Subquery, and Group by Practice...\n\n```sql\nSELECT u.name, COUNT(n.id) FROM users u LEFT JOIN notes n ON u.id = n.user_id GROUP BY u.id;\n```",
    "Joins, Subquery, and Group by Practice..."
  );
  insertNote.run(
    4,
    "Vue.js Architecture",
    "# Vue.js Architecture\n\n- Composition API\n- Pinia State Store\n- Vue Router Guard",
    "Composition API, Pinia State Store..."
  );

  // Todos (Today's Plan)
  const insertTodo = db.prepare(`
    INSERT INTO todos (user_id, title, completed)
    VALUES (1, ?, ?)
  `);
  insertTodo.run("Finish reading Chap 4", 0);
  insertTodo.run("Finish task", 0);
  insertTodo.run("Brainstorming w group", 0);

  // Focus Sessions
  const insertSession = db.prepare(`
    INSERT INTO focus_sessions (user_id, duration_minutes)
    VALUES (1, ?)
  `);
  insertSession.run(45);
  insertSession.run(25);
}

export default db;
