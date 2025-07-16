import express from 'express';
import { generateSpendingProfileWithGemini } from '../services/gemini-service';

const router = express.Router();

// POST /api/generate-spending-profile
router.post('/', async (req, res) => {
  try {
    const { transactions, userProfile } = req.body;
    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({ error: 'Missing or invalid transactions array' });
    }

    // Build a prompt for Gemini
    const topCategories = getTopCategories(transactions, 2);
    const frequentMerchants = getFrequentMerchants(transactions, 3);
    const exampleFoodMerchant = frequentMerchants.find(m => m.category?.toLowerCase().includes('food'));

    const prompt = `Analyze the following user's recent spending data and generate a personalized, purpose-driven spending profile. Include:
- What their top spending categories say about them (e.g., crypto investor, foodie, etc.)
- A whimsical, web-informed remark about a merchant they frequent (e.g., Fresh & Co, Starbucks, etc.)
- Make it insightful, fun, and motivating.

Top categories: ${topCategories.map(c => `${c.category} ($${c.total.toFixed(2)})`).join(', ')}
Frequent merchants: ${frequentMerchants.map(m => `${m.merchant} (${m.count}x)`).join(', ')}
Example food merchant: ${exampleFoodMerchant ? exampleFoodMerchant.merchant : 'N/A'}

Recent transactions:
${transactions.slice(0, 5).map(t => `- ${t.description} ($${t.amount}) [${t.category}]`).join('\n')}

Use real web info about the merchant if possible. End with a motivating or whimsical remark.`;

    const profile = await generateSpendingProfileWithGemini(prompt);
    res.json({ profile });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate spending profile' });
  }
});

// Helpers
function getTopCategories(transactions: any[], n: number) {
  const totals: { [cat: string]: number } = {};
  transactions.forEach(t => {
    if (!t.category) return;
    totals[t.category] = (totals[t.category] || 0) + Math.abs(t.amount);
  });
  return Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([category, total]) => ({ category, total }));
}

function getFrequentMerchants(transactions: any[], n: number) {
  const counts: { [merchant: string]: { count: number, category?: string } } = {};
  transactions.forEach(t => {
    if (!t.merchant) return;
    if (!counts[t.merchant]) counts[t.merchant] = { count: 0, category: t.category };
    counts[t.merchant].count++;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, n)
    .map(([merchant, data]) => ({ merchant, count: data.count, category: data.category }));
}

export default router; 