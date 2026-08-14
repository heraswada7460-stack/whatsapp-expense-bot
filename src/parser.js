// Simple keyword-based category mapping (Hinglish + English)
const CATEGORY_KEYWORDS = {
  Food: ['lunch', 'dinner', 'breakfast', 'khana', 'food', 'zomato', 'swiggy', 'restaurant', 'chai', 'coffee', 'nashta'],
  Travel: ['auto', 'uber', 'ola', 'cab', 'taxi', 'petrol', 'diesel', 'metro', 'bus', 'train', 'fuel', 'travel'],
  Shopping: ['shopping', 'clothes', 'amazon', 'flipkart', 'kapde', 'shoes'],
  Bills: ['bill', 'recharge', 'electricity', 'wifi', 'rent', 'internet', 'mobile bill'],
  Groceries: ['grocery', 'groceries', 'sabzi', 'vegetables', 'kirana', 'milk', 'doodh'],
  Health: ['medicine', 'doctor', 'hospital', 'pharmacy', 'medical'],
  Entertainment: ['movie', 'netflix', 'party', 'game', 'outing'],
  Other: [],
};

function detectCategory(text) {
  const lower = text.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return category;
    }
  }
  return 'Other';
}

// Extracts amount from strings like "500 lunch", "lunch 500", "spent 500 on lunch", "₹500 auto"
function parseExpenseMessage(text) {
  const cleaned = text.trim();
  const amountMatch = cleaned.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d{1,2})?)/i);

  if (!amountMatch) return null;

  const amount = parseFloat(amountMatch[1]);
  if (isNaN(amount) || amount <= 0) return null;

  // Remove the amount portion to get the remaining text as note/category hint
  const note = cleaned.replace(amountMatch[0], '').trim() || 'Uncategorized';
  const category = detectCategory(note);

  return { amount, category, note };
}

module.exports = { parseExpenseMessage, detectCategory };
