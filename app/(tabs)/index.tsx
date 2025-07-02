import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DollarSign, TrendingUp, TriangleAlert as AlertTriangle, Coffee, Car, ShoppingBag, Utensils, Chrome as HomeIcon, ChevronRight, Target, Calendar } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const mockData = {
  spendableMoney: 2847.50,
  monthlyIncome: 5200.00,
  essentialBills: 1850.00,
  savings: 502.50,
  insights: [
    {
      type: 'warning',
      title: 'Dining Out Alert',
      message: 'Your dining out is up 35% this week. Consider packing lunch tomorrow to stay on track.',
      action: 'View Dining Category',
      amount: 87.50
    },
    {
      type: 'info',
      title: 'Upcoming Bill',
      message: 'Car insurance payment of $127 is due in 5 days.',
      action: 'Add to Calendar',
      amount: 127.00
    }
  ],
  categories: [
    { name: 'Dining Out', amount: 287.50, percentage: 22, color: '#EF4444', icon: Utensils },
    { name: 'Groceries', amount: 195.30, percentage: 15, color: '#10B981', icon: ShoppingBag },
    { name: 'Transportation', amount: 145.00, percentage: 11, color: '#3B82F6', icon: Car },
    { name: 'Coffee', amount: 89.75, percentage: 7, color: '#F59E0B', icon: Coffee },
    { name: 'Housing', amount: 1200.00, percentage: 45, color: '#8B5CF6', icon: HomeIcon },
  ],
  recentTransactions: [
    { id: 1, merchant: 'Starbucks', amount: -4.85, category: 'Coffee', date: '2025-01-15', essential: false },
    { id: 2, merchant: 'Whole Foods', amount: -67.32, category: 'Groceries', date: '2025-01-15', essential: true },
    { id: 3, merchant: 'Uber', amount: -12.50, category: 'Transportation', date: '2025-01-14', essential: false },
    { id: 4, merchant: 'The Cheesecake Factory', amount: -45.67, category: 'Dining Out', date: '2025-01-14', essential: false },
    { id: 5, merchant: 'Shell Gas Station', amount: -38.00, category: 'Transportation', date: '2025-01-13', essential: true },
  ],
  goals: [
    { name: 'Emergency Fund', progress: 65, target: 10000, current: 6500 },
    { name: 'Vacation', progress: 40, target: 3000, current: 1200 }
  ]
};

export default function DashboardScreen() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#0F172A', '#1E293B']}
        style={styles.header}
      >
        <Text style={styles.greeting}>Good morning!</Text>
        <Text style={styles.headerTitle}>Financial Overview</Text>
        
        {/* Spendable Money Card */}
        <View style={styles.spendableCard}>
          <Text style={styles.spendableLabel}>Money Available to Spend</Text>
          <Text style={styles.spendableAmount}>{formatCurrency(mockData.spendableMoney)}</Text>
          <Text style={styles.spendableBreakdown}>
            Income {formatCurrency(mockData.monthlyIncome)} - Bills {formatCurrency(mockData.essentialBills)} - Saved {formatCurrency(mockData.savings)}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* AI Insights/Nudges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Your Co-pilot Says</Text>
          {mockData.insights.map((insight, index) => (
            <TouchableOpacity key={index} style={styles.insightCard} activeOpacity={0.8}>
              <View style={styles.insightHeader}>
                {insight.type === 'warning' ? (
                  <AlertTriangle size={20} color="#F59E0B" />
                ) : (
                  <Calendar size={20} color="#3B82F6" />
                )}
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightAmount}>{formatCurrency(insight.amount)}</Text>
              </View>
              <Text style={styles.insightMessage}>{insight.message}</Text>
              <View style={styles.insightAction}>
                <Text style={styles.insightActionText}>{insight.action}</Text>
                <ChevronRight size={16} color="#10B981" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Spending Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 This Month's Spending</Text>
          <View style={styles.spendingChart}>
            {mockData.categories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <TouchableOpacity key={index} style={styles.categoryItem} activeOpacity={0.8}>
                  <View style={styles.categoryLeft}>
                    <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                      <IconComponent size={16} color={category.color} />
                    </View>
                    <View>
                      <Text style={styles.categoryName}>{category.name}</Text>
                      <Text style={styles.categoryPercentage}>{category.percentage}% of spending</Text>
                    </View>
                  </View>
                  <Text style={styles.categoryAmount}>{formatCurrency(category.amount)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💳 Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.transactionsList}>
            {mockData.recentTransactions.map((transaction) => (
              <TouchableOpacity key={transaction.id} style={styles.transactionItem} activeOpacity={0.8}>
                <View style={styles.transactionLeft}>
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionMerchant}>{transaction.merchant}</Text>
                    <Text style={styles.transactionCategory}>{transaction.category} • {formatDate(transaction.date)}</Text>
                  </View>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={[styles.transactionAmount, { color: transaction.amount < 0 ? '#EF4444' : '#10B981' }]}>
                    {formatCurrency(transaction.amount)}
                  </Text>
                  <View style={[styles.essentialTag, { 
                    backgroundColor: transaction.essential ? '#10B981' : '#64748B' 
                  }]}>
                    <Text style={styles.essentialTagText}>
                      {transaction.essential ? 'Essential' : 'Discretionary'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Goals Progress */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎯 Goals Progress</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>Manage</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.goalsList}>
            {mockData.goals.map((goal, index) => (
              <View key={index} style={styles.goalItem}>
                <View style={styles.goalHeader}>
                  <Text style={styles.goalName}>{goal.name}</Text>
                  <Text style={styles.goalProgress}>{goal.progress}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${goal.progress}%` }]} />
                </View>
                <Text style={styles.goalAmount}>
                  {formatCurrency(goal.current)} of {formatCurrency(goal.target)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  spendableCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  spendableLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#10B981',
    marginBottom: 8,
  },
  spendableAmount: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  spendableBreakdown: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#10B981',
  },
  insightCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
  },
  insightAmount: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#F59E0B',
  },
  insightMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#E2E8F0',
    marginBottom: 12,
    lineHeight: 20,
  },
  insightAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightActionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#10B981',
    marginRight: 4,
  },
  spendingChart: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  categoryPercentage: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
  },
  categoryAmount: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  transactionsList: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  transactionLeft: {
    flex: 1,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionMerchant: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  essentialTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  essentialTagText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  goalsList: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 16,
  },
  goalItem: {
    marginBottom: 20,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalName: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  goalProgress: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#10B981',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  goalAmount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
  },
});