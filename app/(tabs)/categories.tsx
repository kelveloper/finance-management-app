import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Utensils, 
  ShoppingBag, 
  Car, 
  Coffee, 
  DollarSign, 
  Heart, 
  Briefcase,
  Home as HomeIcon, 
  X, 
  CircleHelp as HelpCircle, 
  TrendingUp, 
  CircleAlert as AlertCircle 
} from 'lucide-react-native';
import { getApiUrl, getDevUserId } from '../../utils/environment';
import { useSession } from '../../hooks/useSession';
import moment from 'moment';

// Icon mapping for categories
const categoryIcons: { [key: string]: any } = {
  'Food & Drink': Utensils,
  'Shopping': ShoppingBag,
  'Transportation': Car,
  'Entertainment': Coffee,
  'Bills & Utilities': HomeIcon,
  'Financial & Transfers': DollarSign,
  'Health & Medical': Heart,
  'Personal Care': Heart,
  'Income': Briefcase,
};

// Color mapping for categories
const categoryColors: { [key: string]: string } = {
  'Food & Drink': '#EF4444',
  'Shopping': '#10B981',
  'Transportation': '#3B82F6',
  'Entertainment': '#8B5CF6',
  'Bills & Utilities': '#F59E0B',
  'Financial & Transfers': '#06B6D4',
  'Health & Medical': '#EC4899',
  'Personal Care': '#84CC16',
  'Income': '#22C55E',
};

interface Transaction {
  id: string;
  description: string;
  amount: number;
  posted_date: string;
  category?: string;
  subcategory?: string;
}

interface CategoryData {
  name: string;
  amount: number;
  transactions: number;
  percentage: number;
  color: string;
  icon: any;
  recentTransactions: Transaction[];
}

export default function CategoriesScreen() {
  const { userId } = useSession();
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch transaction data
  const { 
    data, 
    isLoading, 
    error,
    refetch 
  } = useQuery<{
    transactions: Transaction[];
  }>({
    queryKey: ['financialData'],
    queryFn: async () => {
      const response = await fetch(`${getApiUrl()}/api/data`, {
        headers: {
          'x-user-id': userId || getDevUserId(),
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch financial data from the server.');
      }
      return response.json();
    }
  });

  const transactions = data?.transactions ?? [];

  // Process transactions into category data
  const categoryData = useMemo(() => {
    // Filter out income and positive transactions for spending analysis
    const spendingTransactions = transactions.filter(t => 
      t.amount < 0 && 
      t.category && 
      t.category !== 'Income'
    );

    // Group by main category only (not subcategory)
    const categoryGroups: { [key: string]: Transaction[] } = {};
    spendingTransactions.forEach(transaction => {
      const category = transaction.category || 'Uncategorized';
      if (!categoryGroups[category]) {
        categoryGroups[category] = [];
      }
      categoryGroups[category].push(transaction);
    });

    // Calculate totals and create category data
    const totalSpending = spendingTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const categories: CategoryData[] = Object.entries(categoryGroups).map(([categoryName, categoryTransactions]) => {
      const totalAmount = categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const percentage = totalSpending > 0 ? Math.round((totalAmount / totalSpending) * 100) : 0;
      
      // Get recent transactions (last 5)
      const recentTransactions = categoryTransactions
        .sort((a, b) => new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime())
        .slice(0, 5);

      return {
        name: categoryName,
        amount: totalAmount,
        transactions: categoryTransactions.length,
        percentage,
        color: categoryColors[categoryName] || '#64748B',
        icon: categoryIcons[categoryName] || ShoppingBag,
        recentTransactions
      };
    });

    // Sort by spending amount (highest to lowest)
    return categories.sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return moment(dateString).format('MMM D');
  };

  const handleCategoryPress = (category: CategoryData) => {
    setSelectedCategory(category);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0F172A', '#1E293B']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Spending Categories</Text>
          <Text style={styles.headerSubtitle}>Loading...</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#34D399" />
          <Text style={styles.loadingText}>Loading your spending data...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0F172A', '#1E293B']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Spending Categories</Text>
          <Text style={styles.headerSubtitle}>Error loading data</Text>
        </LinearGradient>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load spending data</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const totalSpending = categoryData.reduce((sum, cat) => sum + cat.amount, 0);
  const currentMonth = moment().format('MMMM YYYY');

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#0F172A', '#1E293B']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Spending Categories</Text>
        <Text style={styles.headerSubtitle}>{currentMonth}</Text>
        <Text style={styles.totalSpending}>Total: {formatCurrency(totalSpending)}</Text>
      </LinearGradient>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Categories List */}
        <View style={styles.categoriesList}>
          {categoryData.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No spending data available</Text>
              <Text style={styles.emptyStateSubtext}>
                Start making transactions to see your spending breakdown
              </Text>
            </View>
          ) : (
            categoryData.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <TouchableOpacity
                  key={category.name}
                  style={styles.categoryCard}
                onPress={() => handleCategoryPress(category)}
                activeOpacity={0.8}
              >
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryLeft}>
                    <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                      <IconComponent size={20} color={category.color} />
                    </View>
                    <View>
                      <View style={styles.categoryTitleRow}>
                        <Text style={styles.categoryName}>{category.name}</Text>
                          <View style={styles.rankBadge}>
                            <Text style={styles.rankText}>#{index + 1}</Text>
                          </View>
                      </View>
                      <Text style={styles.categoryTransactions}>
                        {category.transactions} transactions
                      </Text>
                    </View>
                  </View>
                  <View style={styles.categoryRight}>
                    <Text style={styles.categoryAmount}>{formatCurrency(category.amount)}</Text>
                      <Text style={styles.percentageText}>{category.percentage}% of spending</Text>
                    </View>
                  </View>

                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <View style={[
                      styles.progressFill,
                      { width: `${category.percentage}%`, backgroundColor: category.color }
                    ]} />
                  </View>
                </View>
              </TouchableOpacity>
            );
            })
          )}
        </View>
      </ScrollView>

      {/* Category Detail Modal */}
      {selectedCategory && (
        <Modal
          visible={!!selectedCategory}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedCategory.name} Details</Text>
              <TouchableOpacity
                onPress={() => setSelectedCategory(null)}
                style={styles.closeButton}
              >
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.modalStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{formatCurrency(selectedCategory.amount)}</Text>
                  <Text style={styles.statLabel}>Total Spent</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{selectedCategory.transactions}</Text>
                  <Text style={styles.statLabel}>Transactions</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{selectedCategory.percentage}%</Text>
                  <Text style={styles.statLabel}>of Total Spending</Text>
                </View>
              </View>

              <View style={styles.recentTransactionsSection}>
                <Text style={styles.sectionTitle}>Recent Transactions</Text>
                {selectedCategory.recentTransactions.map((transaction) => (
                  <View key={transaction.id} style={styles.transactionItem}>
                    <View style={styles.transactionLeft}>
                      <Text style={styles.transactionDescription} numberOfLines={1}>
                        {transaction.description}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {formatDate(transaction.posted_date)}
                      </Text>
                    </View>
                    <Text style={styles.transactionAmount}>
                      {formatCurrency(Math.abs(transaction.amount))}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  totalSpending: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34D399',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9CA3AF',
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#34D399',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#111827',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  categoriesList: {
    marginBottom: 20,
  },
  categoryCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
    marginRight: 8,
  },
  rankBadge: {
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  categoryTransactions: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  percentageText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#111827',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F9FAFB',
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  recentTransactionsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  transactionLeft: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    color: '#F9FAFB',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F9FAFB',
  },
});