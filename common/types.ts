// This file contains type definitions shared between the frontend and backend.

export interface Transaction {
    id: string;
    user_id: string;
    account_id: string;
    amount: number;
    description: string;
    posted_date: string;
    category: string;
    subcategory?: string;
    tag?: 'essential' | 'discretionary';
    transaction_type?: 'DEBIT' | 'CREDIT';
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
  type: 'spending_pattern' | 'goal_optimization' | 'saving_opportunity' | 'budget_alert' | 'behavioral_nudge' | 'positive_feedback' | 'financial_planning' | 'behavioral_insight';
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

export interface UserBehaviorPattern {
  spending_velocity: number; // transactions per day
  preferred_categories: string[];
  spending_timing: {
    most_active_days: number[]; // 0-6 (Sunday-Saturday)
    most_active_hours: number[]; // 0-23
  };
  decision_patterns: {
    accepts_ai_suggestions: number; // 0-1 ratio
    changes_categories: number; // frequency of manual corrections
    uses_tags: boolean;
  };
  financial_discipline: {
    budget_adherence: number; // 0-1
    impulse_spending_score: number; // 1-10
    planning_consistency: number; // 0-1
  };
}

export interface AILearningData {
  user_corrections: Array<{
    original_category: string;
    corrected_category: string;
    original_subcategory?: string;
    corrected_subcategory?: string;
    merchant: string;
    amount: number;
    reasoning?: string; // User's optional explanation
    timestamp: string;
  }>;
  suggestion_feedback: Array<{
    suggestion_id: string;
    action: 'accepted' | 'dismissed' | 'modified';
    user_modification?: string;
    timestamp: string;
  }>;
  spending_motivations: Array<{
    category: string;
    subcategory?: string;
    motivation: 'necessity' | 'convenience' | 'pleasure' | 'social' | 'investment';
    context?: string; // User's explanation
    timestamp: string;
  }>;
}

// Goal Navigator Types
export interface Goal {
  goal_id: string;
  user_id: string;
  goal_type: 'HOUSE' | 'CAR' | 'DEBT' | 'VACATION' | 'EMERGENCY' | 'CUSTOM';
  name: string;
  target_amount: number;
  current_amount_saved: number;
  target_date: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED';
  metadata: {
    down_payment_percentage?: number;
    apr?: number;
    priority: 'high' | 'medium' | 'low';
    category: string;
    monthly_contribution?: number;
  };
  created_at: string;
  updated_at: string;
}

export interface WeeklyChallenge {
  challenge_id: string;
  goal_id: string;
  week_of_year: number;
  year: number;
  description: string;
  category_to_track: string;
  spend_limit: number;
  current_spending: number;
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED';
  reward_message?: string;
  created_at: string;
}

export interface AIRecommendation {
  id: string;
  goal_id: string;
  type: 'reduce_spending' | 'increase_income' | 'optimize_timeline' | 'budget_reallocation';
  category: string;
  current_monthly_spending: number;
  suggested_reduction: number;
  potential_monthly_savings: number;
  impact_description: string;
  confidence_score: number;
  user_feedback?: 'helpful' | 'not_helpful' | 'tried';
  created_at: string;
}