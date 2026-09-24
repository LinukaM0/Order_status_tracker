import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const dbPath =
  process.env.NODE_ENV === 'test'
    ? ':memory:'
    : path.join(__dirname, '../../orders.db');

const db = new DatabaseSync(dbPath);

if (dbPath !== ':memory:') {
  db.exec('PRAGMA journal_mode = WAL');
}

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
