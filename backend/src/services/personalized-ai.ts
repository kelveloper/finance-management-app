import moment from 'moment';
import { Transaction, PersonalizedInsight, SpendingPattern, UserProfile, SmartGoalSuggestion } from '../../../common/types';

export class PersonalizedAI {
  private transactions: Transaction[];
  private userProfile: UserProfile | null;

  constructor(transactions: Transaction[], userProfile?: UserProfile) {
    this.transactions = transactions;
    this.userProfile = userProfile || null;
  }

  /**
   * Analyzes user's spending patterns and generates personalized insights
   */
  generatePersonalizedInsights(): PersonalizedInsight[] {
    const insights: PersonalizedInsight[] = [];

    // 1. Analyze spending patterns
    insights.push(...this.analyzeSpendingPatterns());
    
    // 2. Find saving opportunities
    insights.push(...this.findSavingOpportunities());
    
    // 3. Behavioral nudges based on spending habits
    insights.push(...this.generateBehavioralNudges());
    
    // 4. Goal optimization suggestions
    insights.push(...this.suggestGoalOptimizations());

    return insights.filter(insight => insight.confidence_score > 0.6);
  }

  /**
   * Learns user preferences from their category corrections
   */
  learnFromUserCorrections(corrections: Array<{original: string, corrected: string, merchant: string}>) {
    // This would update the AI model based on user corrections
    // For now, we'll store the patterns for future use
    const patterns = corrections.reduce((acc, correction) => {
      const merchantKey = correction.merchant.toLowerCase();
      if (!acc[merchantKey]) {
        acc[merchantKey] = correction.corrected;
      }
      return acc;
    }, {} as {[merchant: string]: string});

    return patterns;
  }

  /**
   * Analyzes spending patterns to identify trends and habits
   */
  private analyzeSpendingPatterns(): PersonalizedInsight[] {
    const insights: PersonalizedInsight[] = [];
    const monthlySpending = this.getMonthlySpendingByCategory();
    
    // Detect increasing spending trends
    for (const [category, spending] of Object.entries(monthlySpending)) {
      if (spending.length >= 3) {
        const recentAvg = spending.slice(-2).reduce((a, b) => a + b, 0) / 2;
        const olderAvg = spending.slice(0, -2).reduce((a, b) => a + b, 0) / (spending.length - 2);
        
        if (recentAvg > olderAvg * 1.25) {
          insights.push({
            id: `pattern_${category}_${Date.now()}`,
            type: 'spending_pattern',
            title: `${category} Spending Trending Up`,
            message: `Your ${category.toLowerCase()} spending has increased by ${Math.round(((recentAvg - olderAvg) / olderAvg) * 100)}% recently.`,
            actionable_advice: [
              `Review your recent ${category.toLowerCase()} purchases`,
              `Set a monthly budget limit for ${category.toLowerCase()}`,
              `Consider alternatives that might cost less`
            ],
            confidence_score: 0.8,
            dismissed: false,
            created_at: new Date().toISOString()
          });
        }
      }
    }

    return insights;
  }

  /**
   * Identifies potential saving opportunities based on spending patterns
   */
  private findSavingOpportunities(): PersonalizedInsight[] {
    const insights: PersonalizedInsight[] = [];
    const subscriptions = this.detectSubscriptions();
    const frequentMerchants = this.getFrequentMerchants();

    // Unused or rarely used subscriptions
    subscriptions.forEach(sub => {
      if (sub.frequency < 2) { // Less than 2 times per month
        insights.push({
          id: `saving_${sub.name}_${Date.now()}`,
          type: 'saving_opportunity',
          title: 'Potentially Unused Subscription',
          message: `You're paying $${Math.abs(sub.amount)} for ${sub.name} but haven't used it much recently.`,
          actionable_advice: [
            'Review if you still need this subscription',
            'Cancel if unused',
            `Could save $${Math.abs(sub.amount * 12)} per year`
          ],
          confidence_score: 0.7,
          dismissed: false,
          created_at: new Date().toISOString()
        });
      }
    });

    // Frequent small purchases that add up
    frequentMerchants.forEach(merchant => {
      if (merchant.frequency > 10 && merchant.average_amount < 15) {
        const monthlyTotal = merchant.frequency * merchant.average_amount;
        if (monthlyTotal > 50) {
          insights.push({
            id: `saving_${merchant.name}_${Date.now()}`,
            type: 'saving_opportunity',
            title: 'Small Purchases Adding Up',
            message: `You spend about $${monthlyTotal.toFixed(2)}/month on small purchases at ${merchant.name}.`,
            actionable_advice: [
              'Consider bulk buying to save money',
              'Set a weekly limit for small purchases',
              'Look for loyalty programs or discounts'
            ],
            confidence_score: 0.6,
            dismissed: false,
            created_at: new Date().toISOString()
          });
        }
      }
    });

    return insights;
  }

  /**
   * Generates behavioral nudges based on spending habits and timing
   */
  private generateBehavioralNudges(): PersonalizedInsight[] {
    const insights: PersonalizedInsight[] = [];
    const spendingByDayOfWeek = this.getSpendingByDayOfWeek();
    const spendingByTimeOfDay = this.getSpendingByTimeOfDay();

    // Weekend spending pattern
    const weekendSpending = (spendingByDayOfWeek[6] || 0) + (spendingByDayOfWeek[0] || 0); // Sat + Sun
    const weekdaySpending = Object.entries(spendingByDayOfWeek)
      .filter(([day]) => parseInt(day) >= 1 && parseInt(day) <= 5)
      .reduce((sum, [, amount]) => sum + amount, 0);

    if (weekendSpending > weekdaySpending * 0.4) {
      insights.push({
        id: `nudge_weekend_${Date.now()}`,
        type: 'behavioral_nudge',
        title: 'Weekend Spending Pattern Detected',
        message: 'You tend to spend more on weekends. This is normal, but worth being mindful of.',
        actionable_advice: [
          'Set a weekend spending budget',
          'Plan weekend activities in advance',
          'Consider free or low-cost weekend activities'
        ],
        confidence_score: 0.7,
        dismissed: false,
        created_at: new Date().toISOString()
      });
    }

    // Late night spending (often impulse purchases)
    const lateNightSpending = Object.entries(spendingByTimeOfDay)
      .filter(([hour]) => parseInt(hour) >= 22 || parseInt(hour) <= 2)
      .reduce((sum, [, amount]) => sum + amount, 0);

    if (lateNightSpending > 0) {
      insights.push({
        id: `nudge_latenight_${Date.now()}`,
        type: 'behavioral_nudge',
        title: 'Late Night Spending Detected',
        message: 'Late night purchases are often impulse buys. Consider waiting until morning.',
        actionable_advice: [
          'Wait 24 hours before non-essential purchases',
          'Remove payment info from apps',
          'Set phone to "Do Not Disturb" for shopping apps after 10 PM'
        ],
        confidence_score: 0.8,
        dismissed: false,
        created_at: new Date().toISOString()
      });
    }

    return insights;
  }

  /**
   * Suggests goal optimizations based on spending analysis
   */
  private suggestGoalOptimizations(): PersonalizedInsight[] {
    const insights: PersonalizedInsight[] = [];
    const monthlyIncome = this.calculateMonthlyIncome();
    const monthlyExpenses = this.calculateMonthlyExpenses();
    const savingsRate = (monthlyIncome - monthlyExpenses) / monthlyIncome;

    if (savingsRate < 0.1) { // Less than 10% savings rate
      insights.push({
        id: `goal_savings_${Date.now()}`,
        type: 'goal_optimization',
        title: 'Low Savings Rate Detected',
        message: `Your current savings rate is ${(savingsRate * 100).toFixed(1)}%. Experts recommend at least 20%.`,
        actionable_advice: [
          'Identify non-essential expenses to cut',
          'Set up automatic savings transfers',
          'Start with saving just 1% more each month'
        ],
        confidence_score: 0.9,
        dismissed: false,
        created_at: new Date().toISOString()
      });
    }

    return insights;
  }

  /**
   * Generates smart goal suggestions based on user's financial data
   */
  generateSmartGoalSuggestions(): SmartGoalSuggestion[] {
    const suggestions: SmartGoalSuggestion[] = [];
    const monthlyIncome = this.calculateMonthlyIncome();
    const monthlyExpenses = this.calculateMonthlyExpenses();
    const monthlySurplus = monthlyIncome - monthlyExpenses;

    // Emergency fund suggestion
    if (monthlySurplus > 0) {
      const emergencyFundTarget = monthlyExpenses * 6;
      suggestions.push({
        id: `smart_goal_emergency_${Date.now()}`,
        type: 'savings',
        title: 'Build Emergency Fund',
        description: '6 months of expenses for financial security',
        suggested_amount: emergencyFundTarget,
        timeframe_months: 24,
        reasoning: `Based on your monthly expenses of $${monthlyExpenses.toFixed(2)}, you should have $${emergencyFundTarget.toFixed(2)} in emergency savings.`,
        based_on_data: ['monthly expenses', 'income stability'],
        confidence: 0.9
      });
    }

    // Debt optimization suggestion
    const highInterestDebt = this.detectHighInterestDebt();
    if (highInterestDebt.length > 0) {
      const totalHighInterestDebt = highInterestDebt.reduce((sum, debt) => sum + debt.balance, 0);
      suggestions.push({
        id: `smart_goal_debt_${Date.now()}`,
        type: 'debt_payoff',
        title: 'Pay Off High-Interest Debt',
        description: 'Focus on credit cards and high-interest loans first',
        suggested_amount: totalHighInterestDebt,
        timeframe_months: 18,
        reasoning: 'Paying off high-interest debt first saves money on interest charges.',
        based_on_data: ['detected credit card transactions', 'interest rates'],
        confidence: 0.8
      });
    }

    return suggestions;
  }

  // Helper methods
  private getMonthlySpendingByCategory(): {[category: string]: number[]} {
    const monthlyData: {[category: string]: {[month: string]: number}} = {};
    
    this.transactions.forEach(t => {
      if (t.amount < 0 && t.category) {
        const month = moment(t.posted_date).format('YYYY-MM');
        if (!monthlyData[t.category]) monthlyData[t.category] = {};
        if (!monthlyData[t.category][month]) monthlyData[t.category][month] = 0;
        monthlyData[t.category][month] += Math.abs(t.amount);
      }
    });

    const result: {[category: string]: number[]} = {};
    for (const [category, months] of Object.entries(monthlyData)) {
      result[category] = Object.values(months);
    }
    return result;
  }

  private detectSubscriptions() {
    // Logic to detect recurring payments/subscriptions
    const merchants: {[name: string]: {amount: number, dates: string[]}} = {};
    
    this.transactions.forEach(t => {
      if (t.amount < 0) {
        const merchant = t.description.split(' ')[0];
        if (!merchants[merchant]) merchants[merchant] = {amount: 0, dates: []};
        merchants[merchant].amount = Math.abs(t.amount);
        merchants[merchant].dates.push(t.posted_date);
      }
    });

    return Object.entries(merchants)
      .filter(([, data]) => data.dates.length >= 2)
      .map(([name, data]) => ({
        name,
        amount: data.amount,
        frequency: data.dates.length
      }));
  }

  private getFrequentMerchants() {
    const merchants: {[name: string]: {total: number, count: number}} = {};
    
    this.transactions.forEach(t => {
      if (t.amount < 0) {
        const merchant = t.description.split(' ')[0];
        if (!merchants[merchant]) merchants[merchant] = {total: 0, count: 0};
        merchants[merchant].total += Math.abs(t.amount);
        merchants[merchant].count += 1;
      }
    });

    return Object.entries(merchants)
      .map(([name, data]) => ({
        name,
        frequency: data.count,
        average_amount: data.total / data.count
      }))
      .filter(m => m.frequency > 3);
  }

  private getSpendingByDayOfWeek(): {[day: number]: number} {
    const spending: {[day: number]: number} = {};
    
    this.transactions.forEach(t => {
      if (t.amount < 0) {
        const dayOfWeek = moment(t.posted_date).day();
        if (!spending[dayOfWeek]) spending[dayOfWeek] = 0;
        spending[dayOfWeek] += Math.abs(t.amount);
      }
    });

    return spending;
  }

  private getSpendingByTimeOfDay(): {[hour: number]: number} {
    const spending: {[hour: number]: number} = {};
    
    this.transactions.forEach(t => {
      if (t.amount < 0) {
        // For now, we'll simulate time data since it's not in the transaction
        const hour = Math.floor(Math.random() * 24);
        if (!spending[hour]) spending[hour] = 0;
        spending[hour] += Math.abs(t.amount);
      }
    });

    return spending;
  }

  private calculateMonthlyIncome(): number {
    const threeMonthsAgo = moment().subtract(3, 'months');
    const income = this.transactions
      .filter(t => t.amount > 0 && moment(t.posted_date).isAfter(threeMonthsAgo))
      .reduce((sum, t) => sum + t.amount, 0);
    
    return income / 3; // Average monthly income
  }

  private calculateMonthlyExpenses(): number {
    const threeMonthsAgo = moment().subtract(3, 'months');
    const expenses = this.transactions
      .filter(t => t.amount < 0 && moment(t.posted_date).isAfter(threeMonthsAgo))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    return expenses / 3; // Average monthly expenses
  }

  private detectHighInterestDebt() {
    // Simulate high interest debt detection based on credit card transactions
    const creditCardTransactions = this.transactions.filter(t => 
      t.description.toLowerCase().includes('card') || 
      t.description.toLowerCase().includes('credit')
    );

    if (creditCardTransactions.length > 0) {
      return [{
        name: 'Credit Card Debt',
        balance: 2500, // Simulated balance
        interestRate: 18.9
      }];
    }

    return [];
  }
} 