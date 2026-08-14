const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'expenses.json');

function readAll() {
  if (!fs.existsSync(DB_FILE)) return [];
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8').trim();
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading expenses.json:', err);
    return [];
  }
}

function writeAll(records) {
  fs.writeFileSync(DB_FILE, JSON.stringify(records, null, 2), 'utf8');
}

function nowLocal() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

async function addExpense(phone, amount, category, note) {
  const records = readAll();
  const newRecord = {
    id: records.length ? records[records.length - 1].id + 1 : 1,
    phone,
    amount,
    category,
    note,
    created_at: nowLocal(),
  };
  records.push(newRecord);
  writeAll(records);
  return newRecord.id;
}

async function getExpenses(phone, sinceDate) {
  const records = readAll();
  return records
    .filter((r) => r.phone === phone && r.created_at >= sinceDate)
    .sort((a, b) => (a.created_at > b.created_at ? 1 : -1));
}

async function deleteLastExpense(phone) {
  const records = readAll();
  const userRecords = records.filter((r) => r.phone === phone);
  if (userRecords.length === 0) return null;

  const last = userRecords[userRecords.length - 1];
  const filtered = records.filter((r) => r.id !== last.id);
  writeAll(filtered);
  return last.id;
}

module.exports = { addExpense, getExpenses, deleteLastExpense };
