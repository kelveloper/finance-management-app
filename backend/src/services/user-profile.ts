import { supabase } from '../supabase';
import { UserProfile } from '../../../common/types';

export class UserProfileService {
  /**
   * Creates or updates a user profile with their preferences and financial personality
   */
  static async upsertUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    const timestamp = new Date().toISOString();
    
    const defaultProfile: UserProfile = {
      id: userId,
      preferences: {
        risk_tolerance: 'moderate',
        financial_goals: [],
        spending_priorities: [],
        notification_preferences: {
          anomaly_alerts: true,
          goal_reminders: true,
          saving_suggestions: true,
        }
      },
      financial_personality: {
        spender_type: 'balanced',
        impulse_score: 5,
        planning_horizon: 'medium',
      },
      learning_data: {
        category_corrections: [],
        ignored_suggestions: [],
        approved_suggestions: [],
      },
      created_at: timestamp,
      updated_at: timestamp,
    };

    const updatedProfile = {
      ...defaultProfile,
      ...profileData,
      updated_at: timestamp,
    };

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(updatedProfile)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Gets user profile by user ID
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignore not found errors
    return data;
  }

  /**
   * Records a category correction made by the user to improve AI learning
   */
  static async recordCategoryCorrection(
    userId: string, 
    original: string, 
    corrected: string, 
    merchant: string
  ): Promise<void> {
    const profile = await this.getUserProfile(userId);
    if (!profile) return;

    const correction = {
      original,
      corrected,
      merchant,
      timestamp: new Date().toISOString()
    };

    const updatedCorrections = [...profile.learning_data.category_corrections, correction];
    
    await this.upsertUserProfile(userId, {
      learning_data: {
        ...profile.learning_data,
        category_corrections: updatedCorrections
      }
    });
  }

  /**
   * Records when a user dismisses or approves a suggestion
   */
  static async recordSuggestionFeedback(
    userId: string,
    suggestionId: string,
    action: 'approved' | 'ignored'
  ): Promise<void> {
    const profile = await this.getUserProfile(userId);
    if (!profile) return;

    const updatedLearningData = { ...profile.learning_data };
    
    if (action === 'approved') {
      updatedLearningData.approved_suggestions = [...updatedLearningData.approved_suggestions, suggestionId];
    } else {
      updatedLearningData.ignored_suggestions = [...updatedLearningData.ignored_suggestions, suggestionId];
    }

    await this.upsertUserProfile(userId, {
      learning_data: updatedLearningData
    });
  }

  /**
   * Analyzes user behavior to determine financial personality traits
   */
  static analyzeSpendingPersonality(transactions: any[]): {
    spender_type: 'saver' | 'spender' | 'balanced';
    impulse_score: number;
    planning_horizon: 'short' | 'medium' | 'long';
  } {
    const totalExpenses = transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const totalIncome = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const savingsRate = totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome : 0;

    // Determine spender type based on savings rate
    let spender_type: 'saver' | 'spender' | 'balanced' = 'balanced';
    if (savingsRate > 0.2) spender_type = 'saver';
    else if (savingsRate < 0.05) spender_type = 'spender';

    // Calculate impulse score based on small, frequent transactions
    const smallTransactions = transactions.filter(t => t.amount < 0 && Math.abs(t.amount) < 50);
    const impulse_score = Math.min(10, Math.max(1, Math.round(smallTransactions.length / 10)));

    // Determine planning horizon based on transaction patterns
    const categoryVariety = new Set(transactions.map(t => t.category)).size;
    let planning_horizon: 'short' | 'medium' | 'long' = 'medium';
    if (categoryVariety > 15) planning_horizon = 'long';
    else if (categoryVariety < 8) planning_horizon = 'short';

    return {
      spender_type,
      impulse_score,
      planning_horizon
    };
  }

  /**
   * Generates personalized financial goals based on user profile and spending patterns
   */
  static generatePersonalizedGoals(profile: UserProfile, transactions: any[]): string[] {
    const goals: string[] = [];
    const { spender_type, planning_horizon } = profile.financial_personality;

    // Goals based on spender type
    if (spender_type === 'spender') {
      goals.push('Reduce impulse purchases by 20%');
      goals.push('Build a $1000 emergency fund');
    } else if (spender_type === 'saver') {
      goals.push('Increase investment portfolio');
      goals.push('Optimize high-yield savings account');
    }

    // Goals based on planning horizon
    if (planning_horizon === 'long') {
      goals.push('Plan for retirement');
      goals.push('Build a house down payment fund');
    } else if (planning_horizon === 'short') {
      goals.push('Create a monthly budget');
      goals.push('Track daily expenses');
    }

    // Goals based on current spending patterns
    const foodSpending = transactions
      .filter(t => t.category === 'Food & Drink' && t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    if (foodSpending > 400) { // If spending more than $400/month on food
      goals.push('Reduce dining out expenses');
    }

    return goals;
  }
} 