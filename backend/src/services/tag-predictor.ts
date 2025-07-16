import { Transaction } from '../../../common/types';

/**
 * Service for predicting whether transactions are essential or discretionary
 */
export class TagPredictorService {
  /**
   * Predicts whether a transaction is essential or discretionary based on
   * category, description, and amount
   */
  predictTag(transaction: Transaction): 'essential' | 'discretionary' {
    // If transaction already has a tag, return it
    if (transaction.tag) {
      return transaction.tag;
    }

    // Essential categories
    const essentialCategories = [
      'Bills & Utilities',
      'Health & Medical',
      'Groceries',
      'Rent',
      'Mortgage',
      'Insurance',
      'Transportation',
      'Education',
      'Childcare',
      'Debt Payments'
    ];

    // Discretionary categories
    const discretionaryCategories = [
      'Entertainment',
      'Shopping',
      'Dining Out',
      'Travel',
      'Personal Care',
      'Gifts & Donations',
      'Hobbies',
      'Subscriptions'
    ];

    // Check if category is in essential or discretionary list
    if (transaction.category) {
      const category = transaction.category.toLowerCase();
      
      if (essentialCategories.some(c => category.includes(c.toLowerCase()))) {
        return 'essential';
      }
      
      if (discretionaryCategories.some(c => category.includes(c.toLowerCase()))) {
        return 'discretionary';
      }
    }

    // Check description for essential keywords
    const essentialKeywords = [
      'rent', 'mortgage', 'electric', 'water', 'gas', 'utility', 'utilities',
      'insurance', 'medical', 'doctor', 'hospital', 'pharmacy', 'prescription',
      'grocery', 'groceries', 'supermarket', 'transit', 'bus', 'subway', 'train',
      'commute', 'tuition', 'student loan', 'daycare', 'childcare', 'internet',
      'phone', 'cell', 'mobile', 'tax', 'healthcare'
    ];

    // Check description for discretionary keywords
    const discretionaryKeywords = [
      'restaurant', 'cafe', 'coffee', 'bar', 'pub', 'cinema', 'movie', 'theater',
      'concert', 'netflix', 'spotify', 'subscription', 'amazon', 'shopping',
      'clothing', 'shoes', 'electronics', 'game', 'vacation', 'hotel', 'flight',
      'travel', 'salon', 'spa', 'gift', 'donation', 'charity', 'hobby', 'gym',
      'fitness', 'entertainment', 'dining', 'takeout', 'fast food', 'alcohol'
    ];

    const description = transaction.description.toLowerCase();

    // Check if description contains essential keywords
    if (essentialKeywords.some(keyword => description.includes(keyword))) {
      return 'essential';
    }

    // Check if description contains discretionary keywords
    if (discretionaryKeywords.some(keyword => description.includes(keyword))) {
      return 'discretionary';
    }

    // Amount-based heuristics
    // Small transactions are more likely to be discretionary
    if (Math.abs(transaction.amount) < 20) {
      return 'discretionary';
    }

    // Large transactions are more likely to be essential
    if (Math.abs(transaction.amount) > 200) {
      return 'essential';
    }

    // Default to discretionary for unknown patterns
    return 'discretionary';
  }

  /**
   * Predicts tags for multiple transactions
   */
  predictTags(transactions: Transaction[]): { [id: string]: 'essential' | 'discretionary' } {
    const predictions: { [id: string]: 'essential' | 'discretionary' } = {};
    
    transactions.forEach(transaction => {
      predictions[transaction.id] = this.predictTag(transaction);
    });
    
    return predictions;
  }

  /**
   * Learns from user corrections to improve future predictions
   * (This is a placeholder for future ML implementation)
   */
  learnFromCorrection(transaction: Transaction, correctTag: 'essential' | 'discretionary'): void {
    // In a real implementation, this would update a machine learning model
    // For now, we'll just log the correction
    console.log(`Learning from correction: ${transaction.description} is ${correctTag}`);
  }
}