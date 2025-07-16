import { Transaction } from '../../common/types';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

// Generate mock transactions
const generateMockTransactions = (userId: string, count: number): Transaction[] => {
  const transactions: Transaction[] = [];
  
  const categories = [
    'Groceries',
    'Dining Out',
    'Entertainment',
    'Bills & Utilities',
    'Transportation',
    'Shopping',
    'Health & Medical',
    'Travel',
    'Personal Care',
    'Education'
  ];
  
  const merchants = [
    'Whole Foods',
    'Amazon',
    'Netflix',
    'Uber',
    'Target',
    'CVS Pharmacy',
    'Starbucks',
    'Chevron',
    'Apple',
    'Spotify'
  ];
  
  const today = new Date();
  
  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const merchant = merchants[Math.floor(Math.random() * merchants.length)];
    const amount = Math.random() > 0.2 
      ? -(Math.floor(Math.random() * 200) + 5) // Expense (negative amount)
      : Math.floor(Math.random() * 2000) + 500; // Income (positive amount)
    
    // Random date within the last 3 months
    const date = new Date(today);
    date.setDate(today.getDate() - Math.floor(Math.random() * 90));
    
    const transaction: Transaction = {
      id: `mock-${userId}-${i}`,
      user_id: userId,
      account_id: 'mock-account',
      amount,
      description: `${merchant} - ${category}`,
      posted_date: date.toISOString().split('T')[0],
      category,
      // Only set tag for some transactions
      tag: Math.random() > 0.5 ? (Math.random() > 0.5 ? 'essential' : 'discretionary') : undefined
    };
    
    transactions.push(transaction);
  }
  
  return transactions;
};

// Insert mock data into Supabase
export const insertMockData = async (userId: string = 'dev_user_2025', count: number = 50): Promise<void> => {
  const transactions = generateMockTransactions(userId, count);
  
  // Check if we already have data for this user
  const { data: existingData, error: checkError } = await supabase
    .from('transactions')
    .select('id')
    .eq('user_id', userId)
    .limit(1);
    
  if (checkError) {
    console.error('Error checking for existing data:', checkError);
    return;
  }
  
  if (existingData && existingData.length > 0) {
    console.log(`Mock data already exists for user ${userId}`);
    return;
  }
  
  // Insert transactions
  const { error } = await supabase
    .from('transactions')
    .insert(transactions);
    
  if (error) {
    console.error('Error inserting mock data:', error);
    return;
  }
  
  console.log(`Successfully inserted ${transactions.length} mock transactions for user ${userId}`);
};

// If this file is run directly, insert mock data
if (require.main === module) {
  insertMockData()
    .then(() => console.log('Mock data insertion complete'))
    .catch(err => console.error('Error inserting mock data:', err));
}