const { getExpenses } = require('./db');

function getStartDate(range) {
  const now = new Date();
  let start;
  if (range === 'today') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (range === 'week') {
    start = new Date(now);
    start.setDate(now.getDate() - 7);
  } else if (range === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    // default: today
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  const pad = (n) => String(n).padStart(2, '0');
  return `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())} 00:00:00`;
}

async function generateReport(phone, range = 'today') {
  const since = getStartDate(range);
  const rows = await getExpenses(phone, since);

  if (rows.length === 0) {
    return `📊 No expenses logged for "${range}" yet.\n\nJust send a message like "200 auto" or "500 lunch" to start logging.`;
  }

  const byCategory = {};
  let total = 0;
  for (const row of rows) {
    byCategory[row.category] = (byCategory[row.category] || 0) + row.amount;
    total += row.amount;
  }

  const label = { today: "Today's", week: "Last 7 Days'", month: "This Month's" }[range] || "Your";

  let msg = `📊 *${label} Expense Report*\n\n`;
  for (const [cat, amt] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
    msg += `${cat}: ₹${amt.toFixed(2)}\n`;
  }
  msg += `\n*Total: ₹${total.toFixed(2)}*`;
  msg += `\n(${rows.length} entries)`;

  return msg;
}

module.exports = { generateReport };
