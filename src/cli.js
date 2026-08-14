// Terminal mein hi WhatsApp bot jaisa experience — koi API/account nahi chahiye
const readline = require('readline');
const { addExpense, deleteLastExpense } = require('./db');
const { parseExpenseMessage } = require('./parser');
const { generateReport } = require('./report');

const PHONE = 'local-test-user';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

console.log('💬 Expense Bot (CLI mode) — jaise WhatsApp par chalega\n');
console.log('Try karo: "200 auto", "500 lunch", "report today", "undo", "help"');
console.log('Bahar nikalne ke liye "exit" type karo.\n');

function ask() {
  if (rl.closed) return;
  rl.question('You: ', async (input) => {
    const text = input.trim();
    const lower = text.toLowerCase();

    if (lower === 'exit') {
      rl.close();
      return;
    }

    if (lower.startsWith('report')) {
      let range = 'today';
      if (lower.includes('week')) range = 'week';
      else if (lower.includes('month')) range = 'month';
      const report = await generateReport(PHONE, range);
      console.log('\nBot:\n' + report + '\n');
      return ask();
    }

    if (lower === 'undo' || lower === 'delete last') {
      const deletedId = await deleteLastExpense(PHONE);
      console.log('\nBot:', deletedId ? '🗑️ Last entry removed.' : 'Nothing to undo yet.', '\n');
      return ask();
    }

    if (lower === 'help' || lower === 'hi' || lower === 'hello') {
      console.log(`\nBot: 👋 Expense Tracker Bot\nSend: "200 auto" or "500 lunch"\nCommands: "report today/week/month", "undo"\n`);
      return ask();
    }

    const parsed = parseExpenseMessage(text);
    if (!parsed) {
      console.log('\nBot: Couldn\'t understand that 🤔 Try "200 auto" or type "help"\n');
      return ask();
    }

    await addExpense(PHONE, parsed.amount, parsed.category, parsed.note);
    console.log(`\nBot: ✅ ₹${parsed.amount} added under "${parsed.category}"\n`);
    ask();
  });
}

ask();
