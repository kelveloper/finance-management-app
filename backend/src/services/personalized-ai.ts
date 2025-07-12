import moment from 'moment';
import { Transaction, PersonalizedInsight, SpendingPattern, UserProfile, SmartGoalSuggestion, UserBehaviorPattern, AILearningData } from '../../../common/types';

export class PersonalizedAI {
  private transactions: Transaction[];
  private userProfile: UserProfile | null;
  private learningData: AILearningData = {
    user_corrections: [],
    suggestion_feedback: [],
    spending_motivations: []
  };
  private behaviorPattern: UserBehaviorPattern | null = null;

  constructor(transactions: Transaction[], userProfile?: UserProfile) {
    this.transactions = transactions;
    this.userProfile = userProfile || null;
    this.initializeLearningData();
  }

  /**
   * Analyzes user's spending patterns and generates personalized insights
   */
  generatePersonalizedInsights(): PersonalizedInsight[] {
    const insights: PersonalizedInsight[] = [];

    // 1. Essential vs Discretionary Analysis
    insights.push(...this.analyzeEssentialVsDiscretionary());
    
    // 2. Subcategory-level spending patterns
    insights.push(...this.analyzeSubcategoryPatterns());
    
    // 3. Traditional spending patterns
    insights.push(...this.analyzeSpendingPatterns());
    
    // 4. Find saving opportunities
    insights.push(...this.findSavingOpportunities());
    
    // 5. Behavioral nudges based on spending habits
    insights.push(...this.generateBehavioralNudges());
    
    // 6. Goal optimization suggestions
    insights.push(...this.suggestGoalOptimizations());

    return insights.filter(insight => insight.confidence_score > 0.6);
  }

  /**
   * NEW: Analyzes essential vs discretionary spending patterns
   */
  private analyzeEssentialVsDiscretionary(): PersonalizedInsight[] {
    const insights: PersonalizedInsight[] = [];
    const recentTransactions = this.transactions.filter(t => 
      moment(t.posted_date).isAfter(moment().subtract(30, 'days')) && t.amount < 0
    );

    const essentialSpending = recentTransactions
      .filter(t => t.tag === 'essential')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const discretionarySpending = recentTransactions
      .filter(t => t.tag === 'discretionary')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalSpending = essentialSpending + discretionarySpending;
    
    if (totalSpending > 0) {
      const discretionaryPercentage = (discretionarySpending / totalSpending) * 100;
      
      // High discretionary spending insight
      if (discretionaryPercentage > 40) {
        insights.push({
          id: `discretionary_high_${Date.now()}`,
          type: 'spending_pattern',
          title: 'High Discretionary Spending Alert',
          message: `${discretionaryPercentage.toFixed(1)}% of your spending this month was discretionary ($${discretionarySpending.toFixed(2)} out of $${totalSpending.toFixed(2)}).`,
          actionable_advice: [
            'Consider reducing optional purchases to increase savings',
            `You could save $${(discretionarySpending * 0.2).toFixed(2)} by cutting discretionary spending by 20%`,
            'Review your discretionary purchases to identify patterns'
          ],
          confidence_score: 0.8,
          dismissed: false,
          created_at: new Date().toISOString()
        });
      }

      // Good balance insight
      if (discretionaryPercentage >= 15 && discretionaryPercentage <= 30) {
        insights.push({
          id: `balance_good_${Date.now()}`,
          type: 'positive_feedback',
          title: 'Great Spending Balance! 🎯',
          message: `You're maintaining a healthy balance with ${discretionaryPercentage.toFixed(1)}% discretionary spending. Your essential expenses are well-controlled.`,
          actionable_advice: [
            'Keep up this balanced approach to spending',
            'Consider allocating some of your savings to long-term goals',
            'You have good financial discipline'
          ],
          confidence_score: 0.9,
          dismissed: false,
          created_at: new Date().toISOString()
        });
      }

      // Emergency fund recommendation based on essential spending
      if (essentialSpending > 0) {
        const monthlyEssentials = essentialSpending;
        const recommendedEmergencyFund = monthlyEssentials * 6;
        
        insights.push({
          id: `emergency_fund_${Date.now()}`,
          type: 'financial_planning',
          title: 'Emergency Fund Recommendation',
          message: `Based on your essential expenses of $${essentialSpending.toFixed(2)}/month, you should have $${recommendedEmergencyFund.toFixed(2)} in emergency savings.`,
          actionable_advice: [
            `Aim for 6 months of essential expenses ($${recommendedEmergencyFund.toFixed(2)})`,
            'Start with a smaller goal like 1-2 months if needed',
            'Automate savings to build this fund gradually'
          ],
          confidence_score: 0.85,
          dismissed: false,
          created_at: new Date().toISOString()
        });
      }
    }

    return insights;
  }

  /**
   * NEW: Analyzes subcategory-level spending patterns for detailed insights
   */
  private analyzeSubcategoryPatterns(): PersonalizedInsight[] {
    const insights: PersonalizedInsight[] = [];
    const recentTransactions = this.transactions.filter(t => 
      moment(t.posted_date).isAfter(moment().subtract(60, 'days')) && 
      t.amount < 0 && 
      t.subcategory
    );

    // Group by subcategory
    const subcategorySpending: { [key: string]: { amount: number; count: number; category: string } } = {};
    
    recentTransactions.forEach(t => {
      const key = `${t.category} > ${t.subcategory}`;
      if (!subcategorySpending[key]) {
        subcategorySpending[key] = { amount: 0, count: 0, category: t.category || 'General' };
      }
      subcategorySpending[key].amount += Math.abs(t.amount);
      subcategorySpending[key].count += 1;
    });

    // Find top spending subcategories
    const sortedSubcategories = Object.entries(subcategorySpending)
      .sort(([,a], [,b]) => b.amount - a.amount)
      .slice(0, 3);

    sortedSubcategories.forEach(([subcategory, data], index) => {
      const monthlyAverage = data.amount / 2; // 60 days = ~2 months
      
      if (monthlyAverage > 100) { // Only for significant spending
        insights.push({
          id: `subcategory_${subcategory.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`,
          type: 'spending_pattern',
          title: `${subcategory} Spending Analysis`,
          message: `You spent $${data.amount.toFixed(2)} on ${subcategory} over the last 2 months (${data.count} transactions, avg $${monthlyAverage.toFixed(2)}/month).`,
          actionable_advice: [
            `Track if this ${subcategory.toLowerCase()} spending aligns with your priorities`,
            `Consider setting a monthly budget of $${(monthlyAverage * 1.1).toFixed(2)} for ${subcategory.toLowerCase()}`,
            index === 0 ? 'This is your top spending subcategory' : 'Look for optimization opportunities'
          ],
          confidence_score: 0.75,
          dismissed: false,
          created_at: new Date().toISOString()
        });
      }
    });

    // Specific subcategory insights
    this.generateSpecificSubcategoryInsights(subcategorySpending).forEach(insight => {
      insights.push(insight);
    });

    return insights;
  }

  /**
   * NEW: Generate specific insights for certain subcategories
   */
  private generateSpecificSubcategoryInsights(subcategorySpending: { [key: string]: { amount: number; count: number; category: string } }): PersonalizedInsight[] {
    const insights: PersonalizedInsight[] = [];

    // Coffee & Tea spending analysis
    const coffeeSpending = subcategorySpending['Food & Drink > Coffee & Tea'];
    if (coffeeSpending && coffeeSpending.amount > 60) { // $30/month threshold
      const monthlyAverage = coffeeSpending.amount / 2;
      const annualProjection = monthlyAverage * 12;
      
      insights.push({
        id: `coffee_analysis_${Date.now()}`,
        type: 'saving_opportunity',
        title: 'Coffee & Tea Spending Analysis ☕',
        message: `You're spending about $${monthlyAverage.toFixed(2)}/month on coffee & tea ($${annualProjection.toFixed(2)}/year projected).`,
        actionable_advice: [
          'Consider making coffee at home some days',
          `Making coffee at home 2 days/week could save ~$${(monthlyAverage * 0.3).toFixed(2)}/month`,
          'Look for loyalty programs at your favorite coffee shops'
        ],
        confidence_score: 0.8,
        dismissed: false,
        created_at: new Date().toISOString()
      });
    }

    // Fast Food vs Groceries comparison
    const fastFoodSpending = subcategorySpending['Food & Drink > Fast Food'];
    const grocerySpending = subcategorySpending['Food & Drink > Groceries & Supermarkets'];
    
    if (fastFoodSpending && grocerySpending) {
      const fastFoodMonthly = fastFoodSpending.amount / 2;
      const groceryMonthly = grocerySpending.amount / 2;
      
      if (fastFoodMonthly > groceryMonthly * 0.5) { // Fast food is more than 50% of grocery spending
        insights.push({
          id: `fastfood_vs_grocery_${Date.now()}`,
          type: 'saving_opportunity',
          title: 'Fast Food vs Grocery Analysis 🍔📊',
          message: `Fast food spending ($${fastFoodMonthly.toFixed(2)}/month) is ${((fastFoodMonthly / groceryMonthly) * 100).toFixed(0)}% of your grocery spending ($${groceryMonthly.toFixed(2)}/month).`,
          actionable_advice: [
            'Consider meal prep to reduce fast food dependency',
            `Reducing fast food by 30% could save $${(fastFoodMonthly * 0.3).toFixed(2)}/month`,
            'Try cooking 1-2 more meals at home per week'
          ],
          confidence_score: 0.85,
          dismissed: false,
          created_at: new Date().toISOString()
        });
      }
    }

    // Subscription services analysis
    const streamingSpending = subcategorySpending['Entertainment > Streaming Services'];
    if (streamingSpending && streamingSpending.count > 3) { // Multiple subscriptions
      const monthlyAverage = streamingSpending.amount / 2;
      
      insights.push({
        id: `streaming_analysis_${Date.now()}`,
        type: 'saving_opportunity',
        title: 'Multiple Streaming Subscriptions 📺',
        message: `You have ${streamingSpending.count} streaming-related transactions totaling $${monthlyAverage.toFixed(2)}/month.`,
        actionable_advice: [
          'Review which streaming services you actively use',
          'Consider rotating subscriptions based on content you want to watch',
          `Could potentially save $${(monthlyAverage * 0.3).toFixed(2)}/month by consolidating`
        ],
        confidence_score: 0.7,
        dismissed: false,
        created_at: new Date().toISOString()
      });
    }

    return insights;
  }

  /**
   * Enhanced spending pattern analysis with tag awareness
   */
  private analyzeSpendingPatterns(): PersonalizedInsight[] {
    const insights: PersonalizedInsight[] = [];
    const monthlySpending = this.getMonthlySpendingByCategory();
    
    // Detect increasing spending trends (now with tag awareness)
    for (const [category, spending] of Object.entries(monthlySpending)) {
      if (spending.length >= 3) {
        const recentAvg = spending.slice(-2).reduce((a, b) => a + b, 0) / 2;
        const olderAvg = spending.slice(0, -2).reduce((a, b) => a + b, 0) / (spending.length - 2);
        
        if (recentAvg > olderAvg * 1.25) {
          const isEssentialCategory = this.isEssentialCategory(category);
          const urgencyLevel = isEssentialCategory ? 'monitor' : 'consider reducing';
          
          insights.push({
            id: `pattern_${category}_${Date.now()}`,
            type: 'spending_pattern',
            title: `${category} Spending Trending Up`,
            message: `Your ${category.toLowerCase()} spending has increased by ${Math.round(((recentAvg - olderAvg) / olderAvg) * 100)}% recently.${isEssentialCategory ? ' This appears to be essential spending.' : ' This is discretionary spending.'}`,
            actionable_advice: [
              `${urgencyLevel === 'monitor' ? 'Monitor' : 'Review'} your recent ${category.toLowerCase()} purchases`,
              `Set a monthly budget limit for ${category.toLowerCase()}`,
              isEssentialCategory ? 'Look for more cost-effective alternatives' : 'Consider reducing this discretionary spending'
            ],
            confidence_score: isEssentialCategory ? 0.7 : 0.8,
            dismissed: false,
            created_at: new Date().toISOString()
          });
        }
      }
    }

    return insights;
  }

  /**
   * Helper method to determine if a category is typically essential
   */
  private isEssentialCategory(category: string): boolean {
    const essentialCategories = [
      'Bills & Utilities',
      'Health & Medical', 
      'Transportation', // Partially essential
      'Income' // Not spending, but essential
    ];
    return essentialCategories.includes(category);
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
   * Generates behavioral nudges based on spending habits
   */
  private generateBehavioralNudges(): PersonalizedInsight[] {
    const insights: PersonalizedInsight[] = [];
    const weeklySpending = this.getWeeklySpendingPattern();

    // Weekend spending pattern
    if (weeklySpending.weekend > weeklySpending.weekday * 1.5) {
      insights.push({
        id: `behavioral_weekend_${Date.now()}`,
        type: 'behavioral_insight',
        title: 'Weekend Spending Pattern',
        message: `You tend to spend significantly more on weekends ($${weeklySpending.weekend.toFixed(2)}) compared to weekdays ($${weeklySpending.weekday.toFixed(2)}).`,
        actionable_advice: [
          'Set a weekend spending budget',
          'Plan weekend activities in advance',
          'Consider free or low-cost weekend alternatives'
        ],
        confidence_score: 0.7,
        dismissed: false,
        created_at: new Date().toISOString()
      });
    }

    return insights;
  }

  /**
   * Suggests goal optimizations based on current financial patterns
   */
  private suggestGoalOptimizations(): PersonalizedInsight[] {
    const insights: PersonalizedInsight[] = [];
    
    // This would integrate with existing goals if available
    // For now, provide general optimization suggestions

    return insights;
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

  /**
   * NEW: Missing method referenced in behavioral nudges
   */
  getWeeklySpendingPattern(): { [week: string]: number } {
    const weeklySpending: { [week: string]: number } = {};
    
    this.transactions.forEach(t => {
      if (t.amount < 0) { // Only expenses
        const weekKey = moment(t.posted_date).format('YYYY-WW');
        weeklySpending[weekKey] = (weeklySpending[weekKey] || 0) + Math.abs(t.amount);
      }
    });

    return weeklySpending;
  }

  /**
   * NEW: Initialize learning data from user's historical behavior
   */
  private initializeLearningData() {
    // This would typically load from database
    // For now, we'll build behavior patterns from transaction data
    this.behaviorPattern = this.analyzeBehaviorPatterns();
  }

  /**
   * NEW: Analyze user behavior patterns for learning
   */
  private analyzeBehaviorPatterns(): UserBehaviorPattern {
    const recentTransactions = this.transactions.filter(t => 
      moment(t.posted_date).isAfter(moment().subtract(90, 'days'))
    );

    // Calculate spending velocity
    const dayCount = Math.max(1, moment().diff(moment(recentTransactions[0]?.posted_date), 'days'));
    const spending_velocity = recentTransactions.length / dayCount;

    // Find preferred categories
    const categoryCount: { [key: string]: number } = {};
    recentTransactions.forEach(t => {
      if (t.category) {
        categoryCount[t.category] = (categoryCount[t.category] || 0) + 1;
      }
    });
    const preferred_categories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category]) => category);

    // Analyze spending timing
    const dayActivity = new Array(7).fill(0);
    const hourActivity = new Array(24).fill(0);
    
    recentTransactions.forEach(t => {
      const date = moment(t.posted_date);
      dayActivity[date.day()] += 1;
      hourActivity[date.hour()] += 1;
    });

    const most_active_days = dayActivity
      .map((count, day) => ({ day, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => item.day);

    const most_active_hours = hourActivity
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => item.hour);

    // Calculate financial discipline metrics
    const essentialTransactions = recentTransactions.filter(t => t.tag === 'essential');
    const discretionaryTransactions = recentTransactions.filter(t => t.tag === 'discretionary');
    const totalSpending = recentTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const discretionarySpending = discretionaryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const impulse_spending_score = Math.min(10, Math.max(1, (discretionarySpending / totalSpending) * 10));
    
    return {
      spending_velocity,
      preferred_categories,
      spending_timing: {
        most_active_days,
        most_active_hours
      },
      decision_patterns: {
        accepts_ai_suggestions: 0.5, // Default, will be learned over time
        changes_categories: 0.1, // Default, will be learned over time
        uses_tags: (essentialTransactions.length + discretionaryTransactions.length) > 0
      },
      financial_discipline: {
        budget_adherence: 0.7, // Default, will be learned over time
        impulse_spending_score,
        planning_consistency: 0.6 // Default, will be learned over time
      }
    };
  }

  /**
   * NEW: Learn from user corrections and understand their "why"
   */
  learnFromUserBehavior(correction: {
    original_category: string;
    corrected_category: string;
    original_subcategory?: string;
    corrected_subcategory?: string;
    merchant: string;
    amount: number;
    reasoning?: string;
  }) {
    // Store the correction with context
    this.learningData.user_corrections.push({
      ...correction,
      timestamp: new Date().toISOString()
    });

    // Update behavior patterns based on correction
    if (this.behaviorPattern) {
      this.behaviorPattern.decision_patterns.changes_categories += 0.1;
      
      // If user provides reasoning, categorize their motivation
      if (correction.reasoning) {
        const motivation = this.inferSpendingMotivation(correction.reasoning);
        this.learningData.spending_motivations.push({
          category: correction.corrected_category,
          subcategory: correction.corrected_subcategory,
          motivation,
          context: correction.reasoning,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  /**
   * NEW: Infer spending motivation from user's reasoning
   */
  private inferSpendingMotivation(reasoning: string): 'necessity' | 'convenience' | 'pleasure' | 'social' | 'investment' {
    const lowerReasoning = reasoning.toLowerCase();
    
    if (lowerReasoning.includes('need') || lowerReasoning.includes('essential') || lowerReasoning.includes('required')) {
      return 'necessity';
    } else if (lowerReasoning.includes('convenient') || lowerReasoning.includes('save time') || lowerReasoning.includes('easier')) {
      return 'convenience';
    } else if (lowerReasoning.includes('enjoy') || lowerReasoning.includes('like') || lowerReasoning.includes('fun')) {
      return 'pleasure';
    } else if (lowerReasoning.includes('friend') || lowerReasoning.includes('social') || lowerReasoning.includes('together')) {
      return 'social';
    } else if (lowerReasoning.includes('future') || lowerReasoning.includes('invest') || lowerReasoning.includes('long-term')) {
      return 'investment';
    }
    
    return 'necessity'; // Default
  }

  /**
   * NEW: Track suggestion feedback to improve AI recommendations
   */
  trackSuggestionFeedback(suggestionId: string, action: 'accepted' | 'dismissed' | 'modified', userModification?: string) {
    this.learningData.suggestion_feedback.push({
      suggestion_id: suggestionId,
      action,
      user_modification: userModification,
      timestamp: new Date().toISOString()
    });

    // Update behavior patterns
    if (this.behaviorPattern) {
      if (action === 'accepted') {
        this.behaviorPattern.decision_patterns.accepts_ai_suggestions += 0.05;
      } else if (action === 'dismissed') {
        this.behaviorPattern.decision_patterns.accepts_ai_suggestions -= 0.02;
      }
      
      // Keep in reasonable bounds
      this.behaviorPattern.decision_patterns.accepts_ai_suggestions = Math.max(0, Math.min(1, this.behaviorPattern.decision_patterns.accepts_ai_suggestions));
    }
  }

  /**
   * NEW: Generate personalized insights based on learned user behavior
   */
  generatePersonalizedInsightsWithLearning(): PersonalizedInsight[] {
    const insights = this.generatePersonalizedInsights();
    
    // Enhance insights with learned behavior patterns
    const enhancedInsights = insights.map(insight => {
      // Adjust confidence based on user's historical acceptance rate
      if (this.behaviorPattern) {
        const acceptanceRate = this.behaviorPattern.decision_patterns.accepts_ai_suggestions;
        insight.confidence_score = insight.confidence_score * (0.5 + acceptanceRate * 0.5);
      }
      
      return insight;
    });

    // Add behavior-based insights
    if (this.behaviorPattern) {
      enhancedInsights.push(...this.generateBehaviorBasedInsights());
    }

    return enhancedInsights.filter(insight => insight.confidence_score > 0.6);
  }

  /**
   * NEW: Generate insights based on learned user behavior
   */
  private generateBehaviorBasedInsights(): PersonalizedInsight[] {
    const insights: PersonalizedInsight[] = [];
    
    if (!this.behaviorPattern) return insights;

    // Insight about spending timing patterns
    const mostActiveDay = this.behaviorPattern.spending_timing.most_active_days[0];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    if (mostActiveDay !== undefined) {
      insights.push({
        id: `spending_timing_${Date.now()}`,
        type: 'behavioral_insight',
        title: `You spend most on ${dayNames[mostActiveDay]}s`,
        message: `Your spending pattern shows you're most active on ${dayNames[mostActiveDay]}s. This might be a good day to review your budget.`,
        actionable_advice: [
          `Consider planning purchases on ${dayNames[mostActiveDay]}s`,
          'Use this day to review your weekly spending',
          'Set spending limits for your most active day'
        ],
        confidence_score: 0.7,
        dismissed: false,
        created_at: new Date().toISOString()
      });
    }

    // Insight about user's motivation patterns
    const motivationCounts = this.learningData.spending_motivations.reduce((acc, motivation) => {
      acc[motivation.motivation] = (acc[motivation.motivation] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const topMotivation = Object.entries(motivationCounts)
      .sort(([,a], [,b]) => b - a)[0];

    if (topMotivation) {
      const [motivation, count] = topMotivation;
      insights.push({
        id: `motivation_pattern_${Date.now()}`,
        type: 'behavioral_insight',
        title: `Your spending is primarily driven by ${motivation}`,
        message: `Based on your corrections and explanations, most of your spending is motivated by ${motivation}. Understanding this helps create better budgets.`,
        actionable_advice: [
          `Allocate budget specifically for ${motivation}-based purchases`,
          'Track if this motivation aligns with your financial goals',
          'Consider if this spending pattern supports your long-term objectives'
        ],
        confidence_score: 0.8,
        dismissed: false,
        created_at: new Date().toISOString()
      });
    }

    return insights;
  }

  /**
   * NEW: Get learning statistics for debugging/improvement
   */
  getLearningStatistics() {
    return {
      total_corrections: this.learningData.user_corrections.length,
      suggestion_acceptance_rate: this.behaviorPattern?.decision_patterns.accepts_ai_suggestions || 0,
      spending_motivations: this.learningData.spending_motivations.length,
      behavior_pattern: this.behaviorPattern
    };
  }
} 