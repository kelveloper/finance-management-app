import { render } from '@testing-library/react-native';
import React from 'react';
import { Transaction } from '@/common/types';

// Simple component that uses the Transaction type
const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
  return null; // Minimal component for testing imports
};

describe('Vitest Transaction Import Test', () => {
  it('should be able to import Transaction type from common directory', () => {
    const mockTransaction: Transaction = {
      id: 'test-id',
      user_id: 'user-123',
      amount: -50.25,
      description: 'Test Transaction',
      category: 'Groceries',
      date: '2025-01-01',
      account_id: 'account-456',
      account_name: 'Test Account',
      iso_currency_code: 'USD',
      is_recurring: false,
      is_anomaly: false,
      confidence_score: 0.95
    };

    const result = render(<TransactionItem transaction={mockTransaction} />);
    expect(result).toBeTruthy();
    expect(mockTransaction.amount).toBe(-50.25);
    expect(mockTransaction.category).toBe('Groceries');
  });

  it('should handle external imports without jest-expo limitations', () => {
    // This test verifies that we can import and use external modules
    const transaction: Transaction = {
      id: 'external-test',
      user_id: 'user-456',
      amount: 100,
      description: 'External Import Test',
      category: 'Testing',
      date: '2025-01-11',
      account_id: 'account-789',
      account_name: 'External Test Account',
      iso_currency_code: 'USD',
      is_recurring: false,
      is_anomaly: false,
      confidence_score: 1.0
    };

    expect(transaction).toBeDefined();
    expect(transaction.id).toBe('external-test');
  });
}); 