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

export const categorizeTransactions = async (): Promise<{
  total: number;
  categorized: Record<string, number>;
  uncategorized: number;
}> => {
  console.log('Fetching uncategorized transactions from Supabase...');

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('id, description')
    .or('category.is.null,category.eq.General,category.eq.Uncategorized');

  if (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }

  if (!transactions || transactions.length === 0) {
    console.log('No transactions to categorize.');
    return { total: 0, categorized: {}, uncategorized: 0 };
  }

  console.log(`Found ${transactions.length} transactions to categorize.`);

  // Track categorization results
  const categoryStats: Record<string, number> = {};
  let generalCount = 0;

  const updates = transactions.map(t => {
    const category = getCategoryFromDescription(t.description);
    
    // Track stats
    if (category === 'General') {
      generalCount++;
    } else {
      categoryStats[category] = (categoryStats[category] || 0) + 1;
    }

    console.log(`  - ID ${t.id}: ${t.description.substring(0, 40)}... -> ${category}`);
    return supabase
      .from('transactions')
      .update({ category: category })
      .eq('id', t.id);
  });

  console.log('Updating categories in Supabase based on rules...');
  await Promise.all(updates);

  console.log('Rule-based categorization complete!');
  
  return {
    total: transactions.length,
    categorized: categoryStats,
    uncategorized: generalCount
  };
};

// Run categorization when this file is executed directly
if (require.main === module) {
  categorizeTransactions();
} 