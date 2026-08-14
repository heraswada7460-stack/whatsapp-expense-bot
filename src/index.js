require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const { addExpense, deleteLastExpense } = require('./db');
const { parseExpenseMessage } = require('./parser');
const { generateReport } = require('./report');
const { sendWhatsAppMessage } = require('./whatsapp');

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'change-this-token';
const PORT = process.env.PORT || 3000;

// 1) Webhook verification (Meta calls this once when you set up the webhook URL)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified successfully');
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// 2) Incoming messages land here
app.post('/webhook', async (req, res) => {
  // Always ack immediately so Meta doesn't retry
  res.sendStatus(200);

  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (!message || message.type !== 'text') return;

    const from = message.from; // sender's phone number
    const text = message.text.body.trim();
    const lower = text.toLowerCase();

    // --- Command handling ---
    if (lower.startsWith('report')) {
      let range = 'today';
      if (lower.includes('week')) range = 'week';
      else if (lower.includes('month')) range = 'month';

      const report = await generateReport(from, range);
      await sendWhatsAppMessage(from, report);
      return;
    }

    if (lower === 'undo' || lower === 'delete last') {
      const deletedId = await deleteLastExpense(from);
      await sendWhatsAppMessage(
        from,
        deletedId ? '🗑️ Last entry removed.' : 'Nothing to undo yet.'
      );
      return;
    }

    if (lower === 'help' || lower === 'hi' || lower === 'hello') {
      await sendWhatsAppMessage(
        from,
        `👋 *Expense Tracker Bot*\n\nJust send me an expense like:\n"200 auto"\n"500 lunch with friends"\n\nCommands:\n• "report today" / "report week" / "report month"\n• "undo" — remove last entry`
      );
      return;
    }

    // --- Otherwise, try to parse as an expense ---
    const parsed = parseExpenseMessage(text);
    if (!parsed) {
      await sendWhatsAppMessage(
        from,
        `Couldn't understand that 🤔\nTry: "200 auto" or "500 lunch"\nOr type "help" for options.`
      );
      return;
    }

    await addExpense(from, parsed.amount, parsed.category, parsed.note);
    await sendWhatsAppMessage(
      from,
      `✅ ₹${parsed.amount} added under "${parsed.category}"${parsed.note !== 'Uncategorized' ? ` (${parsed.note})` : ''}`
    );
  } catch (err) {
    console.error('Error handling webhook message:', err);
  }
});

app.get('/', (req, res) => res.send('WhatsApp Expense Bot is running.'));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
