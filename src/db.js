const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '..', 'expenses.db'));

// Initialize table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      note TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `);
});

function addExpense(phone, amount, category, note) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO expenses (phone, amount, category, note) VALUES (?, ?, ?, ?)`,
      [phone, amount, category, note],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

function getExpenses(phone, sinceDate) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM expenses WHERE phone = ? AND created_at >= ? ORDER BY created_at ASC`,
      [phone, sinceDate],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
}

function deleteLastExpense(phone) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT id FROM expenses WHERE phone = ? ORDER BY id DESC LIMIT 1`,
      [phone],
      (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);
        db.run(`DELETE FROM expenses WHERE id = ?`, [row.id], (err2) => {
          if (err2) reject(err2);
          else resolve(row.id);
        });
      }
    );
  });
}

module.exports = { db, addExpense, getExpenses, deleteLastExpense };
