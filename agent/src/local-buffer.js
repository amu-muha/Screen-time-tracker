import 'dotenv/config'
import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const dbPath = process.env.SQLITE_DB_PATH || './data/agent.db'
fs.mkdirSync(path.dirname(dbPath),{recursive:true})

const db = new Database(dbPath)
db.exec(`
  CREATE TABLE IF NOT EXISTS pending_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_name TEXT NOT NULL,
    window_title TEXT,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    synced INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

export function bufferEvent(event) {
  db.prepare(
    `INSERT INTO pending_events (app_name, window_title, start_time, end_time)
     VALUES (?, ?, ?, ?)`
  ).run(event.app_name, event.window_title, event.start_time, event.end_time);
}

export function getUnsyncedEvents() {
  return db.prepare(`SELECT * FROM pending_events WHERE synced = 0 ORDER BY id ASC`).all();
}

export function markSynced(id) {
  db.prepare(`UPDATE pending_events SET synced = 1 WHERE id = ?`).run(id);
}