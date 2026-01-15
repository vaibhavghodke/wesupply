const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      image TEXT
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS item_details (
      item_detail_id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL,
      item_name TEXT NOT NULL,
      type TEXT NOT NULL,
      company TEXT NOT NULL,
      quantity TEXT NOT NULL,
      price REAL NOT NULL,
      order_type TEXT NOT NULL CHECK(order_type IN ('retail', 'wholesale')),
      FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS order_summary_history (
      order_id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_summary TEXT NOT NULL,
      contact TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'Open', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
      create_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT
    )
  `);

  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstname TEXT,
      lastname TEXT,
      userid TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT UNIQUE,
      primary_phone TEXT,
      secondary_phone TEXT,
      address TEXT,
      city TEXT,
      role TEXT DEFAULT 'user',
      created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_date DATETIME,
      created_by TEXT
    )
  `);
});

module.exports = db;
