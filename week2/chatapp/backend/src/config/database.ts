import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

// Create a persistent database file
const dbPath = path.join(__dirname, '../../data/chat.db');

// Ensure the data directory exists
if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

// Create/connect to the database file
const db: Database.Database = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Test database connection
try {
  db.prepare('SELECT 1').get();
  console.log('Successfully connected to SQLite database at:', dbPath);
} catch (err) {
  console.error('Error connecting to the database:', err);
}

export default db; 