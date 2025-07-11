import { supabase } from './supabase';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// --- Rule-Based Categorization ---

const CATEGORY_RULES: { [category: string]: string[] } = {
  'Income': ['POPONSMILESLLC', 'Zelle payment from'],
  'Food & Drink': [
    "MCDONALD'S", 'GRUBHUB', 'SQ *', 'TST*', 'CARMINES PIZZERIA', 
    '8TH AVE DELI', 'MI AMOR FAST FOOD', 'FRESH & CO'
  ],
  'Transportation': ['UBER'],
  'Shopping': ['CVS/PHARMACY', 'DORNEY PARK MERCHANDISE'],
  'Entertainment': ['DORNEY PARK'],
  'Bills & Utilities': ['HP *INSTANT INK'],
  'Financial & Transfers': [
    'Coinbase.com', 'Zelle payment to', 'Acorns', 'PAYPAL', 
    'APPLECARD GSBANK', 'BARCLAYCARD US', '1ST BANKCARD CTR', 
    'Payment to Chase card'
  ],
};

const getCategoryFromDescription = (description: string): string => {
  for (const category in CATEGORY_RULES) {
    for (const keyword of CATEGORY_RULES[category]) {
      if (description.toUpperCase().includes(keyword.toUpperCase())) {
        return category;
      }
    }
  }
  return 'General'; // Default category if no rule matches
};

const categorizeTransactions = async () => {
  console.log('Fetching uncategorized transactions from Supabase...');

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('id, description')
    .or('category.is.null,category.eq.General,category.eq.Uncategorized');

  if (error) {
    console.error('Error fetching transactions:', error);
    return;
  }

  if (!transactions || transactions.length === 0) {
    console.log('No transactions to categorize.');
    return;
  }

  console.log(`Found ${transactions.length} transactions to categorize.`);

  const updates = transactions.map(t => {
    const category = getCategoryFromDescription(t.description);
    console.log(`  - ID ${t.id}: ${t.description.substring(0, 40)}... -> ${category}`);
    return supabase
      .from('transactions')
      .update({ category: category })
      .eq('id', t.id);
  });

  console.log('Updating categories in Supabase based on rules...');
  await Promise.all(updates);

  console.log('Rule-based categorization complete!');
};

categorizeTransactions(); 