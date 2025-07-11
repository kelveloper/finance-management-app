import { analyzeTransactions } from './index';
import { detectRecurringTransactions } from './services/recurring';
import { runSync } from './sync-chase-csv';
import fs from 'fs';
import { Readable } from 'stream';

// Mocking Supabase
jest.mock('./supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn(),
    update: jest.fn(),
    delete: jest.fn().mockReturnThis(),
    insert: jest.fn().mockResolvedValue({ error: null }), // Correctly mock the insert method
  },
}));
import { supabase } from './supabase';
import moment from 'moment';

describe('Backend API and Services', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('CSV Sync Service', () => {
    it('should process a given list of transactions and insert data into Supabase', async () => {
      const mockTransactions = [
        {
          description: 'Test Transaction from Array',
          amount: -55.55,
          posted_date: '2025-07-09'
        }
      ];

      // Await the refactored function with mock data
      await runSync(mockTransactions);

      // Assert that delete was called to clear old transactions
      expect(supabase.from('transactions').delete).toHaveBeenCalled();
      
      // Assert that insert was called with the correct data
      expect(supabase.from('transactions').insert).toHaveBeenCalledWith(mockTransactions);
    });
  });

  describe('Transaction Analysis', () => {
    it('should correctly identify a spending anomaly', () => {
      const MOCK_TRANSACTIONS: any[] = [
        // Last 4 weeks spending: $75 total, so $18.75/week average
        { id: 1, user_id: '1', description: 'Restaurant', amount: -25, posted_date: moment().subtract(2, 'weeks').format('YYYY-MM-DD'), category: 'Food and Drink', tag: 'discretionary', transaction_type: 'DEBIT' },
        { id: 2, user_id: '1', description: 'Restaurant', amount: -25, posted_date: moment().subtract(3, 'weeks').format('YYYY-MM-DD'), category: 'Food and Drink', tag: 'discretionary', transaction_type: 'DEBIT' },
        { id: 3, user_id: '1', description: 'Restaurant', amount: -25, posted_date: moment().subtract(4, 'weeks').format('YYYY-MM-DD'), category: 'Food and Drink', tag: 'discretionary', transaction_type: 'DEBIT' },
        // This week's spending: $50, which is > $18.75
        { id: 5, user_id: '1', description: 'Fancy Dinner', amount: -50, posted_date: moment().subtract(2, 'days').format('YYYY-MM-DD'), category: 'Food and Drink', tag: 'discretionary', transaction_type: 'DEBIT' },
      ];
      const anomalies = analyzeTransactions(MOCK_TRANSACTIONS);
      expect(anomalies).toHaveLength(1);
      expect(anomalies[0].category).toBe('Food and Drink');
      expect(anomalies[0].thisWeek).toBe(50);
    });
  });

  describe('Recurring Transaction Detection', () => {
    it('should identify recurring transactions', () => {
      const MOCK_TRANSACTIONS: any[] = [
        { id: 1, user_id: '1', description: 'Netflix', amount: -15.99, posted_date: '2024-07-15', category: 'Subscriptions', tag: 'discretionary', transaction_type: 'DEBIT' },
        { id: 2, user_id: '1', description: 'Netflix', amount: -15.99, posted_date: '2024-06-15', category: 'Subscriptions', tag: 'discretionary', transaction_type: 'DEBIT' },
        { id: 3, user_id: '1', description: 'Netflix', amount: -15.99, posted_date: '2024-05-15', category: 'Subscriptions', tag: 'discretionary', transaction_type: 'DEBIT' },
        { id: 4, user_id: '1', description: 'Spotify', amount: -9.99, posted_date: '2024-07-10', category: 'Subscriptions', tag: 'discretionary', transaction_type: 'DEBIT' },
        { id: 5, user_id: '1', description: 'Spotify', amount: -9.99, posted_date: '2024-06-10', category: 'Subscriptions', tag: 'discretionary', transaction_type: 'DEBIT' },
        { id: 6, user_id: '1', description: 'Gas Bill', amount: -75.00, posted_date: '2024-07-01', category: 'Utilities', tag: 'essential', transaction_type: 'DEBIT' },
      ];
      const recurring = detectRecurringTransactions(MOCK_TRANSACTIONS);
      expect(recurring).toHaveLength(2); // Netflix and Spotify
      expect(recurring.find(r => r.name === 'Netflix')).not.toBeUndefined();
      expect(recurring.find(r => r.name === 'Spotify')).not.toBeUndefined();
    });
  });

  // Further tests for API endpoints would require setting up supertest
  // and mocking the express app itself.
  
}); 