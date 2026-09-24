import Database from 'better-sqlite3';
import path from 'path';

// Use in-memory DB during tests, file-based otherwise
const dbPath =
  process.env.NODE_ENV === 'test'
    ? ':memory:'
    : path.join(__dirname, '../../orders.db');

const db = new Database(dbPath);

// Enable WAL mode for better concurrent read performance (skipped for in-memory)
if (dbPath !== ':memory:') {
  db.pragma('journal_mode = WAL');
}

// Create tables on startup — idempotent
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id        TEXT PRIMARY KEY,
    status    TEXT NOT NULL DEFAULT 'created',
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS order_events (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    eventId   TEXT UNIQUE NOT NULL,
    orderId   TEXT NOT NULL,
    status    TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (orderId) REFERENCES orders(id)
  );
`);

export default db;
