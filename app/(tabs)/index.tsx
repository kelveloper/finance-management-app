import { StyleSheet, View, Text, FlatList, ActivityIndicator, TouchableOpacity, Platform, Alert, ScrollView, TextInput, Modal } from 'react-native';
import React, { useState, useMemo } from 'react';
import moment from 'moment';
import { useQuery } from '@tanstack/react-query';
import { Transaction, Insight, RecurringTransaction, PersonalizedInsight } from '../../common/types';
import { useSession } from '../../hooks/useSession';

const API_HOST = 'http://127.0.0.1:8000';

// Function to get time-based greeting in Eastern Time
const getTimeBasedGreeting = (firstName: string | null): { greeting: string; name: string } => {
  if (!firstName) return { greeting: 'Good Morning', name: '' };
  
  const easternTime = new Date().toLocaleString("en-US", {timeZone: "America/New_York"});
  const currentHour = new Date(easternTime).getHours();
  
  let greeting = '';
  if (currentHour >= 5 && currentHour < 12) {
    greeting = 'Good Morning';
  } else if (currentHour >= 12 && currentHour < 17) {
    greeting = 'Good Afternoon';
  } else if (currentHour >= 17 && currentHour < 21) {
    greeting = 'Good Evening';
  } else {
    greeting = 'Good Night';
  }
  
  return { greeting, name: firstName };
};

const GreetingComponent = ({ firstName }: { firstName: string | null }) => {
  const { greeting, name } = getTimeBasedGreeting(firstName);
  
  return (
    <View style={styles.greetingContainer}>
      <Text style={styles.greetingText}>{greeting}, </Text>
      <Text style={styles.greetingName}>{name}</Text>
      <Text style={styles.greetingName}>!</Text>
    </View>
  );
};

// Modern Filter Component
const FilterBar = ({ 
  searchQuery, 
  setSearchQuery, 
  selectedCategory, 
  setSelectedCategory, 
  sortBy, 
  setSortBy,
  categories 
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  categories: string[];
}) => {
  return (
    <View style={styles.filterContainer}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          placeholderTextColor="#6B7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
        <TouchableOpacity
          style={[styles.filterChip, selectedCategory === 'All' && styles.filterChipActive]}
          onPress={() => setSelectedCategory('All')}
        >
          <Text style={[styles.filterChipText, selectedCategory === 'All' && styles.filterChipTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[styles.filterChip, selectedCategory === category && styles.filterChipActive]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[styles.filterChipText, selectedCategory === category && styles.filterChipTextActive]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'date' && styles.sortButtonActive]}
          onPress={() => setSortBy('date')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'date' && styles.sortButtonTextActive]}>Date</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'amount' && styles.sortButtonActive]}
          onPress={() => setSortBy('amount')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'amount' && styles.sortButtonTextActive]}>Amount</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Monthly Summary Component
const MonthlySummary = ({ transactions, monthKey }: { transactions: Transaction[]; monthKey: string }) => {
  const totalSpent = transactions.reduce((sum, t) => sum + (t.amount < 0 ? Math.abs(t.amount) : 0), 0);
  const totalIncome = transactions.reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0);
  const transactionCount = transactions.length;

  return (
    <View style={styles.monthlySummaryContainer}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Spent</Text>
        <Text style={styles.summaryAmount}>-${totalSpent.toFixed(2)}</Text>
      </View>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Income</Text>
        <Text style={styles.summaryAmountPositive}>+${totalIncome.toFixed(2)}</Text>
      </View>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Transactions</Text>
        <Text style={styles.summaryCount}>{transactionCount}</Text>
      </View>
    </View>
  );
};

// Monthly Group Component
const MonthlyGroup = ({ 
  monthKey, 
  transactions, 
  isExpanded, 
  onToggle,
  onUpdateCategory,
  onUpdateTag 
}: {
  monthKey: string;
  transactions: Transaction[];
  isExpanded: boolean;
  onToggle: () => void;
  onUpdateCategory: (transaction: Transaction) => void;
  onUpdateTag: (transactionId: string, newTag: 'essential' | 'discretionary') => void;
}) => {
  const monthDisplay = moment(monthKey, 'YYYY-MM').format('MMMM YYYY');
  
  return (
    <View style={styles.monthlyGroupContainer}>
      <TouchableOpacity style={styles.monthlyHeader} onPress={onToggle} activeOpacity={0.7}>
        <View style={styles.monthlyHeaderLeft}>
          <Text style={styles.monthlyHeaderText}>{monthDisplay}</Text>
          <Text style={styles.monthlyHeaderCount}>{transactions.length} transactions</Text>
        </View>
        <Text style={styles.monthlyHeaderIcon}>{isExpanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>
      
      {isExpanded && (
        <>
          <MonthlySummary transactions={transactions} monthKey={monthKey} />
          <View style={styles.transactionsList}>
            {transactions.map((transaction) => (
              <ModernTransactionCard
                key={transaction.id}
                transaction={transaction}
                onUpdateCategory={onUpdateCategory}
                onUpdateTag={onUpdateTag}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
};

// Modern Transaction Card Component
const ModernTransactionCard = ({ 
  transaction, 
  onUpdateCategory, 
  onUpdateTag 
}: {
  transaction: Transaction;
  onUpdateCategory: (transaction: Transaction) => void;
  onUpdateTag: (transactionId: string, newTag: 'essential' | 'discretionary') => void;
}) => {
  const isNegative = transaction.amount < 0;
  const displayAmount = Math.abs(transaction.amount);
  
  return (
    <View style={styles.modernTransactionCard}>
      <View style={styles.transactionLeft}>
        <View style={[styles.transactionIcon, isNegative ? styles.expenseIcon : styles.incomeIcon]}>
          <Text style={styles.transactionIconText}>{isNegative ? '−' : '+'}</Text>
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.modernTransactionName} numberOfLines={1}>
            {transaction.description}
          </Text>
          <TouchableOpacity 
            style={styles.categoryButton}
            onPress={() => onUpdateCategory(transaction)}
            activeOpacity={0.7}
          >
            <Text style={styles.modernTransactionCategory}>
              {transaction.category || 'General'}
            </Text>
            {transaction.subcategory && (
              <Text style={styles.modernTransactionSubcategory}>
                {' > '}{transaction.subcategory}
              </Text>
            )}
            <Text style={styles.categoryEditIcon}>✎</Text>
          </TouchableOpacity>
          <Text style={styles.modernTransactionDate}>
            {moment(transaction.posted_date, 'YYYY-MM-DD').format('MMM D, YYYY')}
          </Text>
        </View>
      </View>
      
      <View style={styles.transactionRight}>
        <Text style={[styles.modernTransactionAmount, isNegative ? styles.expenseAmount : styles.incomeAmount]}>
          {isNegative ? '-' : '+'}${displayAmount.toFixed(2)}
        </Text>
        {transaction.tag && (
          <View style={[styles.modernTag, transaction.tag === 'essential' ? styles.essentialTag : styles.discretionaryTag]}>
            <Text style={styles.modernTagText}>{transaction.tag}</Text>
          </View>
        )}
        <View style={styles.modernActionButtons}>
          <TouchableOpacity
            style={[styles.modernTagButton, styles.modernEssentialButton]}
            onPress={() => onUpdateTag(transaction.id, 'essential')}
          >
            <Text style={styles.modernTagButtonText}>Essential</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modernTagButton, styles.modernDiscretionaryButton]}
            onPress={() => onUpdateTag(transaction.id, 'discretionary')}
          >
            <Text style={styles.modernTagButtonText}>Optional</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};



export default function HomeScreen() {
  const { userId, firstName } = useSession();
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  
  const { 
    data, 
    isLoading, 
    error 
  } = useQuery<{
    transactions: Transaction[];
    insights: { 
      anomalies: Insight[], 
      recurring: RecurringTransaction[],
      personalized: PersonalizedInsight[]
    };
  }>({
    queryKey: ['financialData'],
    queryFn: async () => {
      const response = await fetch(`${API_HOST}/api/data`, {
        headers: {
          'x-user-id': userId || 'mock_user_123',
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch financial data from the server.');
      }
      return response.json();
    }
  });

  const transactions = data?.transactions ?? [];
  const recurring = data?.insights?.recurring ?? [];
  const personalizedInsights = data?.insights?.personalized ?? [];

  // Process and group transactions
  const { groupedTransactions, categories } = useMemo(() => {
    let filteredTransactions = transactions;
    
    // Apply search filter
    if (searchQuery) {
      filteredTransactions = filteredTransactions.filter(t => 
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.category && t.category.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply category filter
    if (selectedCategory !== 'All') {
      filteredTransactions = filteredTransactions.filter(t => t.category === selectedCategory);
    }
    
    // Sort transactions
    filteredTransactions.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime();
      } else {
        return Math.abs(b.amount) - Math.abs(a.amount);
      }
    });
    
    // Group by month
    const grouped = filteredTransactions.reduce((acc, transaction) => {
      const monthKey = moment(transaction.posted_date, 'YYYY-MM-DD').format('YYYY-MM');
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(transaction);
      return acc;
    }, {} as Record<string, Transaction[]>);
    
    // Get unique categories
    const uniqueCategories = Array.from(new Set(
      transactions.map(t => t.category).filter((category): category is string => Boolean(category))
    )).sort();
    
    return { groupedTransactions: grouped, categories: uniqueCategories };
  }, [transactions, searchQuery, selectedCategory, sortBy]);

  // Auto-expand current month
  React.useEffect(() => {
    const currentMonth = moment().format('YYYY-MM');
    if (groupedTransactions[currentMonth] && !expandedMonths.has(currentMonth)) {
      setExpandedMonths(new Set([currentMonth]));
    }
  }, [groupedTransactions]);

  const toggleInsightExpansion = (insightId: string) => {
    setExpandedInsights(prev => {
      const newSet = new Set(prev);
      if (newSet.has(insightId)) {
        newSet.delete(insightId);
      } else {
        newSet.add(insightId);
      }
      return newSet;
    });
  };

  const toggleMonthExpansion = (monthKey: string) => {
    setExpandedMonths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(monthKey)) {
        newSet.delete(monthKey);
      } else {
        newSet.add(monthKey);
      }
      return newSet;
    });
  };

  const handleUpdateCategory = (transaction: Transaction) => {
    const onConfirm = (newCategory?: string) => {
        if (!newCategory || newCategory === transaction.category) {
            return;
        }

        const keyword = transaction.description.split(' ')[0].split('*')[0];

        Alert.alert(
            `Create a rule for '${keyword}'?`,
            `Do you want to categorize all past and future transactions containing "${keyword}" as "${newCategory}"?`,
            [
                {
                    text: 'Just This Once',
                    onPress: async () => {
                        try {
                            const response = await fetch(`${API_HOST}/api/transactions/${transaction.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ category: newCategory }),
                            });
                            if (!response.ok) throw new Error('Failed to update category');
                        } catch (error: any) {
                            Alert.alert('Error', error.message);
                        }
                    },
                    style: 'cancel'
                },
                {
                    text: 'Create Rule',
                    onPress: async () => {
                         try {
                            const response = await fetch(`${API_HOST}/api/rules/apply`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ keyword, category: newCategory }),
                            });
                            const result = await response.json();
                            if (!response.ok) throw new Error(result.error || 'Failed to apply rule');
                            Alert.alert('Success', result.message);
                        } catch (error: any) {
                            Alert.alert('Error', error.message);
                        }
                    }
                }
            ]
        );
    };

    if (Platform.OS === 'web') {
        const newCategory = prompt('Enter new category:', transaction.category || 'General');
        if (newCategory !== null) {
            onConfirm(newCategory);
        }
    } else {
        Alert.prompt(
          'Update Category',
          'Enter the new category:',
          onConfirm,
          'plain-text',
          transaction.category || 'General'
        );
    }
  };

  const handleUpdateTag = async (transactionId: string, newTag: 'essential' | 'discretionary') => {
    try {
        const response = await fetch(`${API_HOST}/api/transactions/${transactionId}/tag`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tag: newTag }),
        });
        if (!response.ok) {
            throw new Error('Failed to update tag');
        }
    } catch (error: any) {
        Alert.alert('Error', error.message || 'Could not update tag.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#34D399" />
        <Text style={styles.errorText}>Loading transactions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error.message}</Text>
      </View>
    );
  }

  const monthKeys = Object.keys(groupedTransactions).sort().reverse();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <GreetingComponent firstName={firstName} />
      
      {recurring.length > 0 && (
        <View style={styles.recurringContainer}>
          <Text style={styles.insightsTitle}>Upcoming Bills</Text>
          {recurring.map((item) => (
            <View key={`${item.name}-${item.nextDate}`} style={styles.recurringItem}>
              <Text style={styles.recurringName}>{item.name}</Text>
              <Text style={styles.recurringAmount}>~${item.amount.toFixed(2)} on {moment(item.nextDate, 'YYYY-MM-DD').format('MMM D')}</Text>
            </View>
          ))}
        </View>
      )}

      {personalizedInsights.length > 0 && (
        <View style={styles.personalizedContainer}>
          <Text style={styles.insightsTitle}>🧠 Personal AI Insights</Text>
          {personalizedInsights.map((insight) => {
            const isExpanded = expandedInsights.has(insight.id);
            return (
              <TouchableOpacity
                key={insight.id}
                style={[styles.insightCard, styles.personalizedCard]}
                onPress={() => toggleInsightExpansion(insight.id)}
                activeOpacity={0.8}
              >
                <View style={styles.personalizedHeader}>
                  <Text style={styles.personalizedTitle}>{insight.title}</Text>
                  <View style={styles.headerRight}>
                    <Text style={styles.expandIcon}>
                      {isExpanded ? '▼' : '▶'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.personalizedMessage}>{insight.message}</Text>
                {insight.actionable_advice.length > 0 && (
                  <Text style={styles.tapToExpand}>
                    {isExpanded ? 'Tap to hide actions' : 'Tap to see actions you can take'}
                  </Text>
                )}
                {isExpanded && insight.actionable_advice.length > 0 && (
                  <View style={styles.adviceContainer}>
                    <Text style={styles.adviceTitle}>💡 Actions you can take:</Text>
                    {insight.actionable_advice.map((advice, index) => (
                      <Text key={index} style={styles.adviceItem}>• {advice}</Text>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <Text style={styles.title}>Transactions</Text>
      
      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        sortBy={sortBy}
        setSortBy={setSortBy}
        categories={categories}
      />

      {monthKeys.length === 0 ? (
        <Text style={styles.noTransactionsText}>No transactions found.</Text>
      ) : (
        monthKeys.map((monthKey) => (
          <MonthlyGroup
            key={monthKey}
            monthKey={monthKey}
            transactions={groupedTransactions[monthKey]}
            isExpanded={expandedMonths.has(monthKey)}
            onToggle={() => toggleMonthExpansion(monthKey)}
            onUpdateCategory={handleUpdateCategory}
            onUpdateTag={handleUpdateTag}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 20,
    marginHorizontal: 20,
    color: '#F9FAFB',
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 16,
  },
  noTransactionsText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#6B7280',
    fontSize: 16,
  },
  
  // Greeting styles
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  greetingText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#F9FAFB',
  },
  greetingName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#34D399',
  },

  // Filter styles
  filterContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#374151',
  },
  filterScrollView: {
    marginBottom: 15,
  },
  filterChip: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#374151',
  },
  filterChipActive: {
    backgroundColor: '#34D399',
    borderColor: '#34D399',
  },
  filterChipText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#111827',
    fontWeight: 'bold',
  },
  sortContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  sortButton: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  sortButtonActive: {
    backgroundColor: '#374151',
    borderColor: '#6B7280',
  },
  sortButtonText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: '#F9FAFB',
    fontWeight: 'bold',
  },

  // Monthly group styles
  monthlyGroupContainer: {
    marginBottom: 20,
    marginHorizontal: 20,
    backgroundColor: '#1F2937',
    borderRadius: 16,
    overflow: 'hidden',
  },
  monthlyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#374151',
  },
  monthlyHeaderLeft: {
    flex: 1,
  },
  monthlyHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  monthlyHeaderCount: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  monthlyHeaderIcon: {
    fontSize: 18,
    color: '#34D399',
    fontWeight: 'bold',
  },

  // Monthly summary styles
  monthlySummaryContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  summaryAmountPositive: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34D399',
  },
  summaryCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#60A5FA',
  },

  // Modern transaction card styles
  transactionsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modernTransactionCard: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  transactionLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseIcon: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  incomeIcon: {
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
  },
  transactionIconText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F9FAFB',
  },
  transactionInfo: {
    flex: 1,
  },
  modernTransactionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  modernTransactionCategory: {
    fontSize: 13,
    color: '#34D399',
    fontWeight: '600',
  },
  modernTransactionSubcategory: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  categoryEditIcon: {
    fontSize: 12,
    color: '#34D399',
    marginLeft: 4,
    opacity: 0.7,
  },
  modernTransactionDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  transactionRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  modernTransactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  expenseAmount: {
    color: '#EF4444',
  },
  incomeAmount: {
    color: '#34D399',
  },
  modernTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 8,
  },
  modernTagText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  modernActionButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  modernEditButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  modernEditButtonText: {
    fontSize: 11,
    color: '#E5E7EB',
    fontWeight: '500',
  },
  modernTagButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  modernTagButtonText: {
    fontSize: 11,
    color: 'white',
    fontWeight: 'bold',
  },
  modernEssentialButton: {
    backgroundColor: '#3B82F6',
  },
  modernDiscretionaryButton: {
    backgroundColor: '#EF4444',
  },

  // Legacy styles for insights
  insightsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#F9FAFB',
  },
  recurringContainer: {
    marginBottom: 20,
    marginHorizontal: 20,
  },
  recurringItem: {
    backgroundColor: '#1F2937',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#374151',
  },
  recurringName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#F9FAFB',
  },
  recurringAmount: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  personalizedContainer: {
    marginBottom: 20,
    marginHorizontal: 20,
  },
  insightCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  personalizedCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  personalizedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  personalizedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C4B5FD',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandIcon: {
    fontSize: 14,
    color: '#C4B5FD',
    fontWeight: 'bold',
  },
  tapToExpand: {
    fontSize: 12,
    color: '#A78BFA',
    fontStyle: 'italic',
    marginTop: 4,
    textAlign: 'center',
  },
  personalizedMessage: {
    fontSize: 14,
    color: '#E0E7FF',
    marginBottom: 10,
  },
  adviceContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(99, 102, 241, 0.3)',
  },
  adviceTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#C4B5FD',
    marginBottom: 4,
  },
  adviceItem: {
    fontSize: 13,
    color: '#DDD6FE',
    marginBottom: 2,
    paddingLeft: 8,
  },
  essentialTag: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    color: '#60A5FA',
  },
  discretionaryTag: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    color: '#F87171',
  },
});