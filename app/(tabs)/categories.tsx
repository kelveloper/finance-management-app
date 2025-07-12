import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Utensils, ShoppingBag, Car, Coffee, Chrome as HomeIcon, X, CircleHelp as HelpCircle, TrendingUp, CircleAlert as AlertCircle } from 'lucide-react-native';

const mockCategories = [
  {
    id: 1,
    name: 'Dining Out',
    amount: 287.50,
    transactions: 12,
    percentage: 22,
    trend: 35,
    color: '#EF4444',
    icon: Utensils,
    weeklyAverage: 65.00,
    isSpike: true,
    spikeReason: null,
    recentTransactions: [
      { merchant: 'The Cheesecake Factory', amount: 45.67, date: '2025-01-14' },
      { merchant: 'McDonald\'s', amount: 12.34, date: '2025-01-13' },
      { merchant: 'Olive Garden', amount: 67.89, date: '2025-01-12' },
      { merchant: 'Starbucks', amount: 8.50, date: '2025-01-11' },
      { merchant: 'Chipotle', amount: 15.25, date: '2025-01-10' },
    ]
  },
  {
    id: 2,
    name: 'Groceries',
    amount: 195.30,
    transactions: 8,
    percentage: 15,
    trend: -8,
    color: '#10B981',
    icon: ShoppingBag,
    weeklyAverage: 85.00,
    isSpike: false,
    spikeReason: null,
    recentTransactions: [
      { merchant: 'Whole Foods', amount: 67.32, date: '2025-01-15' },
      { merchant: 'Safeway', amount: 45.21, date: '2025-01-12' },
      { merchant: 'Target', amount: 82.77, date: '2025-01-09' },
    ]
  },
  {
    id: 3,
    name: 'Transportation',
    amount: 145.00,
    transactions: 15,
    percentage: 11,
    trend: 12,
    color: '#3B82F6',
    icon: Car,
    weeklyAverage: 32.00,
    isSpike: false,
    spikeReason: null,
    recentTransactions: [
      { merchant: 'Shell Gas Station', amount: 38.00, date: '2025-01-13' },
      { merchant: 'Uber', amount: 12.50, date: '2025-01-14' },
      { merchant: 'Metro Transit', amount: 2.50, date: '2025-01-15' },
    ]
  },
];

export default function CategoriesScreen() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showWhyModal, setShowWhyModal] = useState(false);
  const [spikeReason, setSpikeReason] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
    if (category.isSpike && !category.spikeReason) {
      setShowWhyModal(true);
    }
  };

  const handleSpikeReasonSubmit = (reason: string) => {
    setSpikeReason(reason);
    setShowWhyModal(false);
    // In real app, save this to backend
  };

  const spikeReasons = [
    'Work stress',
    'Celebration',
    'Social events',
    'Impulse buying',
    'Travel/vacation',
    'Other'
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#0F172A', '#1E293B']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Spending Categories</Text>
        <Text style={styles.headerSubtitle}>January 2025</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Categories List */}
        <View style={styles.categoriesList}>
          {mockCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  category.isSpike && styles.categoryCardAlert
                ]}
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
                        {category.isSpike && (
                          <AlertCircle size={16} color="#F59E0B" />
                        )}
                      </View>
                      <Text style={styles.categoryTransactions}>
                        {category.transactions} transactions
                      </Text>
                    </View>
                  </View>
                  <View style={styles.categoryRight}>
                    <Text style={styles.categoryAmount}>{formatCurrency(category.amount)}</Text>
                    <View style={styles.trendContainer}>
                      <TrendingUp size={12} color={category.trend > 0 ? '#EF4444' : '#10B981'} />
                      <Text style={[
                        styles.trendText,
                        { color: category.trend > 0 ? '#EF4444' : '#10B981' }
                      ]}>
                        {category.trend > 0 ? '+' : ''}{category.trend}%
                      </Text>
                    </View>
                  </View>
                </View>

                {category.isSpike && (
                  <View style={styles.spikeAlert}>
                    <Text style={styles.spikeAlertText}>
                      Above weekly average of {formatCurrency(category.weeklyAverage)}
                    </Text>
                    <TouchableOpacity
                      style={styles.whyButton}
                      onPress={() => setShowWhyModal(true)}
                    >
                      <HelpCircle size={14} color="#F59E0B" />
                      <Text style={styles.whyButtonText}>Why the spike?</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <View style={[
                      styles.progressFill,
                      { width: `${category.percentage}%`, backgroundColor: category.color }
                    ]} />
                  </View>
                  <Text style={styles.progressText}>{category.percentage}% of spending</Text>
                </View>
              </TouchableOpacity>
            );
          })}
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
                  <Text style={[
                    styles.statValue,
                    { color: selectedCategory.trend > 0 ? '#EF4444' : '#10B981' }
                  ]}>
                    {selectedCategory.trend > 0 ? '+' : ''}{selectedCategory.trend}%
                  </Text>
                  <Text style={styles.statLabel}>vs Last Month</Text>
                </View>
              </View>

              <View style={styles.transactionsList}>
                <Text style={styles.transactionsTitle}>Recent Transactions</Text>
                {selectedCategory.recentTransactions.map((transaction, index) => (
                  <View key={index} style={styles.transactionItem}>
                    <View>
                      <Text style={styles.transactionMerchant}>{transaction.merchant}</Text>
                      <Text style={styles.transactionDate}>{formatDate(transaction.date)}</Text>
                    </View>
                    <Text style={styles.transactionAmount}>
                      {formatCurrency(transaction.amount)}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </Modal>
      )}

      {/* Why Spike Modal */}
      <Modal
        visible={showWhyModal}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.overlayContainer}>
          <View style={styles.whyModal}>
            <Text style={styles.whyModalTitle}>Why did you spend more on dining out this week?</Text>
            <Text style={styles.whyModalSubtitle}>
              Help us understand your spending patterns to provide better insights.
            </Text>

            <View style={styles.reasonsList}>
              {spikeReasons.map((reason, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.reasonButton}
                  onPress={() => handleSpikeReasonSubmit(reason)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.reasonText}>{reason}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.skipReasonButton}
              onPress={() => setShowWhyModal(false)}
            >
              <Text style={styles.skipReasonText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827', // Dark background
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: '#1F2937', // Slightly lighter dark shade for header
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F9FAFB', // Light text
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#9CA3AF', // Lighter grey
  },
  content: {
    flex: 1,
    padding: 20,
  },
  categoriesList: {
    marginBottom: 20,
  },
  categoryCard: {
    backgroundColor: '#1F2937', // Dark card background
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  categoryCardAlert: {
    borderColor: 'rgba(245, 158, 11, 0.5)',
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
    color: '#F9FAFB', // Light text
    marginRight: 8,
  },
  categoryTransactions: {
    fontSize: 14,
    color: '#9CA3AF', // Lighter grey
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F9FAFB', // Light text
    marginBottom: 4,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  spikeAlert: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spikeAlertText: {
    fontSize: 12,
    color: '#FBBF24', // Brighter yellow
    flex: 1,
  },
  whyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  whyButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FBBF24', // Brighter yellow
    marginLeft: 4,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#374151', // Darker grey for progress bar background
    borderRadius: 3,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#9CA3AF', // Lighter grey
    minWidth: 80,
    textAlign: 'right',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#111827', // Dark background for modal
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F9FAFB', // Light text
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
    backgroundColor: '#1F2937', // Darker card
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F9FAFB', // Light text
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF', // Lighter grey
  },
  transactionsList: {
    backgroundColor: '#1F2937', // Darker card
    borderRadius: 12,
    padding: 16,
  },
  transactionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB', // Light text
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
  transactionMerchant: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F9FAFB', // Light text
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#9CA3AF', // Lighter grey
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F9FAFB', // Light text
  },
  overlayContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  whyModal: {
    backgroundColor: '#1F2937', // Dark modal
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  whyModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB', // Light text
    marginBottom: 8,
    textAlign: 'center',
  },
  whyModalSubtitle: {
    fontSize: 14,
    color: '#9CA3AF', // Lighter grey
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  reasonsList: {
    marginBottom: 20,
  },
  reasonButton: {
    backgroundColor: '#374151', // Darker button
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  reasonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F9FAFB', // Light text
    textAlign: 'center',
  },
  skipReasonButton: {
    padding: 12,
    alignItems: 'center',
  },
  skipReasonText: {
    fontSize: 14,
    color: '#6B7280', // Darker grey
  },
});