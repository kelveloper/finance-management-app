/**
 * Goal Navigator Service
 * Handles AI-powered goal management, recommendations, and weekly challenges
 */

import moment from 'moment';
import { Transaction, Goal, WeeklyChallenge, AIRecommendation } from '../../../common/types';

export class GoalNavigatorService {
  private transactions: Transaction[];
  private goals: Goal[];

  constructor(transactions: Transaction[], goals: Goal[] = []) {
    this.transactions = transactions;
    this.goals = goals;
  }

  /**
   * Analyze spending patterns for goal recommendations
   */
  analyzeSpendingPatterns() {
    const recentTransactions = this.transactions.filter(t => 
      moment(t.posted_date).isAfter(moment().subtract(90, 'days')) && 
      t.amount < 0
    );

    // Calculate monthly spending by category
    const categorySpending: { [key: string]: number } = {};
    recentTransactions.forEach(t => {
      const category = t.category || 'Uncategorized';
      categorySpending[category] = (categorySpending[category] || 0) + Math.abs(t.amount);
    });

    // Convert to monthly averages (90 days = ~3 months)
    Object.keys(categorySpending).forEach(category => {
      categorySpending[category] = categorySpending[category] / 3;
    });

    // Calculate income and surplus
    const totalIncome = this.transactions
      .filter(t => t.amount > 0 && moment(t.posted_date).isAfter(moment().subtract(90, 'days')))
      .reduce((sum, t) => sum + t.amount, 0) / 3; // Monthly average

    const totalExpenses = Object.values(categorySpending).reduce((sum, amount) => sum + amount, 0);
    const monthlySurplus = totalIncome - totalExpenses;

    return {
      categorySpending,
      monthlySurplus,
      totalIncome,
      totalExpenses
    };
  }

  /**
   * Generate AI recommendations for a specific goal
   */
  generateRecommendations(goal: Goal): AIRecommendation[] {
    const spendingAnalysis = this.analyzeSpendingPatterns();
    if (!spendingAnalysis) return [];

    const monthsRemaining = moment(goal.target_date).diff(moment(), 'months');
    const remainingAmount = goal.target_amount - goal.current_amount_saved;
    const monthlyRequired = remainingAmount / Math.max(monthsRemaining, 1);
    const shortfall = monthlyRequired - spendingAnalysis.monthlySurplus;

    const recommendations: AIRecommendation[] = [];

    // Optional categories for spending reduction
    const OPTIONAL_CATEGORIES = [
      'Food & Drink', 'Entertainment', 'Shopping', 'Personal Care', 'Subscriptions'
    ];

    if (shortfall > 0) {
      // Analyze optional categories for potential savings
      OPTIONAL_CATEGORIES.forEach(category => {
        const currentSpending = spendingAnalysis.categorySpending[category] || 0;
        if (currentSpending > 50) { // Only suggest if spending is significant
          const suggestedReduction = Math.min(currentSpending * 0.3, shortfall); // Suggest up to 30% reduction
          
          recommendations.push({
            id: `rec_${goal.goal_id}_${category}_${Date.now()}`,
            goal_id: goal.goal_id,
            type: 'reduce_spending',
            category,
            current_monthly_spending: currentSpending,
            suggested_reduction: suggestedReduction,
            potential_monthly_savings: suggestedReduction,
            impact_description: this.generateImpactDescription(suggestedReduction, monthlyRequired, monthsRemaining, goal.name),
            confidence_score: currentSpending > 200 ? 0.8 : 0.6,
            created_at: new Date().toISOString()
          });
        }
      });
    }

    return recommendations
      .sort((a, b) => b.potential_monthly_savings - a.potential_monthly_savings)
      .slice(0, 3);
  }

  /**
   * Generate impact description for recommendations
   */
  private generateImpactDescription(
    savings: number, 
    monthlyRequired: number, 
    monthsRemaining: number, 
    goalName: string
  ): string {
    const timeReduction = Math.round((savings / monthlyRequired) * monthsRemaining);
    const percentageImpact = Math.round((savings / monthlyRequired) * 100);
    
    if (timeReduction >= 1) {
      return `This could help you reach your ${goalName} goal ${timeReduction} month${timeReduction > 1 ? 's' : ''} faster!`;
    } else if (percentageImpact > 0) {
      return `This reduces your monthly savings gap by ${percentageImpact}% for your ${goalName} goal.`;
    } else {
      return `Every dollar saved brings you closer to your ${goalName} goal.`;
    }
  }

  /**
   * Generate weekly challenge from recommendations
   */
  generateWeeklyChallenge(goal: Goal, recommendations: AIRecommendation[]): WeeklyChallenge | null {
    if (!recommendations.length) return null;

    const topRecommendation = recommendations[0];
    const weeklyLimit = (topRecommendation.current_monthly_spending - topRecommendation.suggested_reduction) / 4.33; // Convert monthly to weekly

    const currentWeek = moment().week();
    const currentYear = moment().year();

    return {
      challenge_id: `challenge_${goal.goal_id}_${currentWeek}_${currentYear}`,
      goal_id: goal.goal_id,
      week_of_year: currentWeek,
      year: currentYear,
      description: `Spend less than $${weeklyLimit.toFixed(2)} on ${topRecommendation.category.toLowerCase()} this week`,
      category_to_track: topRecommendation.category,
      spend_limit: weeklyLimit,
      current_spending: 0,
      status: 'ACTIVE',
      created_at: new Date().toISOString()
    };
  }

  /**
   * Track challenge progress
   */
  trackChallengeProgress(challenge: WeeklyChallenge): WeeklyChallenge {
    const weekStart = moment().startOf('week');
    const weekEnd = moment().endOf('week');

    const currentSpending = this.transactions
      .filter(t => 
        t.category === challenge.category_to_track &&
        t.amount < 0 &&
        moment(t.posted_date).isBetween(weekStart, weekEnd, null, '[]')
      )
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const updatedChallenge = {
      ...challenge,
      current_spending: currentSpending,
      status: this.determineChallengeStatus(currentSpending, challenge.spend_limit)
    };

    return updatedChallenge;
  }

  /**
   * Determine challenge status based on spending
   */
  private determineChallengeStatus(currentSpending: number, spendLimit: number): 'ACTIVE' | 'COMPLETED' | 'FAILED' {
    const weekProgress = moment().day() / 7; // How far through the week we are
    
    if (weekProgress >= 0.9) { // Near end of week
      return currentSpending <= spendLimit ? 'COMPLETED' : 'FAILED';
    }
    
    return currentSpending > spendLimit ? 'FAILED' : 'ACTIVE';
  }

  /**
   * Calculate goal feasibility
   */
  calculateGoalFeasibility(goal: Goal) {
    const spendingAnalysis = this.analyzeSpendingPatterns();
    if (!spendingAnalysis) return { feasible: false, reason: 'Insufficient data' };

    const monthsRemaining = moment(goal.target_date).diff(moment(), 'months');
    const remainingAmount = goal.target_amount - goal.current_amount_saved;
    const monthlyRequired = remainingAmount / Math.max(monthsRemaining, 1);

    if (monthlyRequired <= spendingAnalysis.monthlySurplus) {
      return {
        feasible: true,
        reason: 'Goal is achievable with current surplus',
        monthlyRequired,
        currentSurplus: spendingAnalysis.monthlySurplus
      };
    }

    const shortfall = monthlyRequired - spendingAnalysis.monthlySurplus;
    const optionalSpending = this.calculateOptionalSpending(spendingAnalysis.categorySpending);

    if (shortfall <= optionalSpending * 0.5) { // Can reduce optional spending by up to 50%
      return {
        feasible: true,
        reason: 'Goal is achievable by reducing discretionary spending',
        monthlyRequired,
        currentSurplus: spendingAnalysis.monthlySurplus,
        requiredReduction: shortfall
      };
    }

    return {
      feasible: false,
      reason: 'Goal requires significant lifestyle changes or timeline extension',
      monthlyRequired,
      currentSurplus: spendingAnalysis.monthlySurplus,
      shortfall
    };
  }

  /**
   * Calculate total optional spending
   */
  private calculateOptionalSpending(categorySpending: { [key: string]: number }): number {
    const OPTIONAL_CATEGORIES = [
      'Food & Drink', 'Entertainment', 'Shopping', 'Personal Care', 'Subscriptions'
    ];

    return OPTIONAL_CATEGORIES.reduce((total, category) => {
      return total + (categorySpending[category] || 0);
    }, 0);
  }

  /**
   * Generate goal suggestions based on spending patterns
   */
  generateGoalSuggestions() {
    const spendingAnalysis = this.analyzeSpendingPatterns();
    if (!spendingAnalysis) return [];

    const suggestions = [];

    // Emergency fund suggestion
    if (spendingAnalysis.monthlySurplus > 200) {
      const emergencyFundTarget = spendingAnalysis.totalExpenses * 3; // 3 months of expenses
      suggestions.push({
        id: `suggestion_emergency_${Date.now()}`,
        type: 'savings',
        title: 'Build Emergency Fund',
        description: 'Create a financial safety net for unexpected expenses',
        suggested_amount: emergencyFundTarget,
        timeframe_months: Math.ceil(emergencyFundTarget / (spendingAnalysis.monthlySurplus * 0.5)),
        reasoning: `Based on your monthly expenses of $${spendingAnalysis.totalExpenses.toFixed(2)}, an emergency fund of $${emergencyFundTarget.toFixed(2)} would provide 3 months of coverage.`,
        based_on_data: ['monthly_expenses', 'surplus_analysis'],
        confidence: 0.9
      });
    }

    // Debt payoff suggestion (if high interest spending detected)
    const financialSpending = spendingAnalysis.categorySpending['Financial & Transfers'] || 0;
    if (financialSpending > 100) {
      suggestions.push({
        id: `suggestion_debt_${Date.now()}`,
        type: 'debt_payoff',
        title: 'Accelerate Debt Payoff',
        description: 'Pay off high-interest debt faster to save on interest',
        suggested_amount: financialSpending * 12, // Annual amount
        timeframe_months: 18,
        reasoning: `Your monthly financial transfers of $${financialSpending.toFixed(2)} suggest debt payments that could be accelerated.`,
        based_on_data: ['financial_transfers', 'interest_analysis'],
        confidence: 0.7
      });
    }

    return suggestions;
  }
}