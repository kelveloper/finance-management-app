// This file contains type definitions shared between the frontend and backend.

export type Transaction = {
  id: string;
  description: string;
  amount: number;
  posted_date: string;
  category?: string;
  tag?: 'essential' | 'discretionary' | null;
  balance?: number;
}

export interface Insight {
    category: string;
    thisWeek: number;
    weeklyAverage: number;
    insight: string;
    advice?: string;
}

export interface RecurringTransaction {
    name: string;
    amount: number;
    nextDate: string;
} 

// New types for personalized AI features
export interface UserProfile {
  id: string;
  preferences: {
    risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
    financial_goals: string[];
    spending_priorities: string[];
    notification_preferences: {
      anomaly_alerts: boolean;
      goal_reminders: boolean;
      saving_suggestions: boolean;
    };
  };
  financial_personality: {
    spender_type: 'saver' | 'spender' | 'balanced';
    impulse_score: number; // 1-10
    planning_horizon: 'short' | 'medium' | 'long';
  };
  learning_data: {
    category_corrections: Array<{
      original: string;
      corrected: string;
      merchant: string;
      timestamp: string;
    }>;
    ignored_suggestions: string[];
    approved_suggestions: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface PersonalizedInsight {
  id: string;
  type: 'spending_pattern' | 'goal_optimization' | 'saving_opportunity' | 'budget_alert' | 'behavioral_nudge';
  title: string;
  message: string;
  actionable_advice: string[];
  confidence_score: number; // 0-1
  relevant_transactions?: string[]; // Transaction IDs
  dismissed: boolean;
  created_at: string;
}

export interface SpendingPattern {
  category: string;
  monthly_trend: 'increasing' | 'decreasing' | 'stable';
  seasonal_patterns: {
    month: number;
    average_amount: number;
  }[];
  merchant_preferences: {
    merchant: string;
    frequency: number;
    average_amount: number;
  }[];
  time_patterns: {
    day_of_week: number;
    hour_of_day: number;
    frequency: number;
  }[];
}

export interface SmartGoalSuggestion {
  id: string;
  type: 'savings' | 'debt_payoff' | 'budget_optimization' | 'investment';
  title: string;
  description: string;
  suggested_amount: number;
  timeframe_months: number;
  reasoning: string;
  based_on_data: string[];
  confidence: number;
} 