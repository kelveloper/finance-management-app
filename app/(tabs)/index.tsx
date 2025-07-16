import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Alert,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import React, { useState, useMemo, useEffect } from 'react';
import moment from 'moment';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Transaction,
  Insight,
  RecurringTransaction,
  PersonalizedInsight,
} from '../../common/types';
import { useSession } from '../../hooks/useSession';
import { Ionicons } from '@expo/vector-icons';
import { getApiUrl, getDevUserId } from '../../utils/environment';

// Function to get time-based greeting in Eastern Time
const getTimeBasedGreeting = (
  firstName: string | null
): { greeting: string; name: string } => {
  if (!firstName) return { greeting: 'Good Morning', name: '' };

  const easternTime = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
  });
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
  return (
    <View style={styles.greetingContainer}>
      <Text style={styles.greetingText}>Good Evening Crypto Bro, </Text>
      <Text style={styles.greetingName}>Kelvin</Text>
      <Text style={styles.greetingName}>! :)</Text>
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
  categories,
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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScrollView}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedCategory === 'All' && styles.filterChipActive,
          ]}
          onPress={() => setSelectedCategory('All')}
        >
          <Text
            style={[
              styles.filterChipText,
              selectedCategory === 'All' && styles.filterChipTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.filterChip,
              selectedCategory === category && styles.filterChipActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedCategory === category && styles.filterChipTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortBy === 'date' && styles.sortButtonActive,
          ]}
          onPress={() => setSortBy('date')}
        >
          <Text
            style={[
              styles.sortButtonText,
              sortBy === 'date' && styles.sortButtonTextActive,
            ]}
          >
            Date
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortBy === 'amount' && styles.sortButtonActive,
          ]}
          onPress={() => setSortBy('amount')}
        >
          <Text
            style={[
              styles.sortButtonText,
              sortBy === 'amount' && styles.sortButtonTextActive,
            ]}
          >
            Amount
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Monthly Summary Component
const MonthlySummary = ({
  transactions,
  monthKey,
}: {
  transactions: Transaction[];
  monthKey: string;
}) => {
  const totalSpent = transactions.reduce(
    (sum, t) => sum + (t.amount < 0 ? Math.abs(t.amount) : 0),
    0
  );
  const totalIncome = transactions.reduce(
    (sum, t) => sum + (t.amount > 0 ? t.amount : 0),
    0
  );
  const transactionCount = transactions.length;

  return (
    <View style={styles.monthlySummaryContainer}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Spent</Text>
        <Text style={styles.summaryAmount}>-${totalSpent.toFixed(2)}</Text>
      </View>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Income</Text>
        <Text style={styles.summaryAmountPositive}>
          +${totalIncome.toFixed(2)}
        </Text>
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
  onUpdateTag,
  loadingTags,
}: {
  monthKey: string;
  transactions: Transaction[];
  isExpanded: boolean;
  onToggle: () => void;
  onUpdateCategory: (transaction: Transaction) => void;
  onUpdateTag: (
    transactionId: string,
    newTag: 'essential' | 'discretionary'
  ) => void;
  loadingTags: Set<string>;
}) => {
  const monthDisplay = moment(monthKey, 'YYYY-MM').format('MMMM YYYY');

  return (
    <View style={styles.monthlyGroupContainer}>
      <TouchableOpacity
        style={styles.monthlyHeader}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.monthlyHeaderLeft}>
          <Text style={styles.monthlyHeaderText}>{monthDisplay}</Text>
          <Text style={styles.monthlyHeaderCount}>
            {transactions.length} transactions
          </Text>
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
                loadingTags={loadingTags}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
};

// Category Selection Modal Component
const CategorySelectionModal = ({
  visible,
  onClose,
  onSelectCategory,
  currentCategory,
  currentSubcategory,
}: {
  visible: boolean;
  onClose: () => void;
  onSelectCategory: (category: string, subcategory?: string) => void;
  currentCategory?: string;
  currentSubcategory?: string;
}) => {
  const [categories, setCategories] = useState<any>({});
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>(
    currentCategory || ''
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(
    currentSubcategory || ''
  );
  const [showSubcategories, setShowSubcategories] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/api/categories`);
      const data = await response.json();
      setCategories(data.subcategories || {});
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleMainCategorySelect = (category: string) => {
    console.log('🎯 DEBUG: Main category clicked:', category);
    console.log('📊 DEBUG: Current category selection state:', {
      selectedMainCategory: selectedMainCategory,
      selectedSubcategory: selectedSubcategory,
      showSubcategories: showSubcategories,
    });

    setSelectedMainCategory(category);
    setShowSubcategories(true);

    console.log('✅ DEBUG: Updated to show subcategories for:', category);
  };

  const handleSubcategorySelect = (subcategory: string) => {
    console.log('🎯 DEBUG: Subcategory clicked:', subcategory);
    console.log('📊 DEBUG: Full selection:', {
      mainCategory: selectedMainCategory,
      subcategory: subcategory,
    });

    setSelectedSubcategory(subcategory);
    onSelectCategory(selectedMainCategory, subcategory);

    console.log(
      '✅ DEBUG: Calling onSelectCategory with:',
      selectedMainCategory,
      subcategory
    );

    handleClose();
  };

  const handleSkipSubcategory = () => {
    console.log('⏭️ DEBUG: Skip subcategory clicked');
    console.log('📊 DEBUG: Using main category only:', selectedMainCategory);

    onSelectCategory(selectedMainCategory);

    console.log(
      '✅ DEBUG: Calling onSelectCategory with main category only:',
      selectedMainCategory
    );

    handleClose();
  };

  const handleClose = () => {
    console.log('❌ DEBUG: Category modal closing');
    console.log('📊 DEBUG: Resetting modal state');

    setShowSubcategories(false);
    setSelectedMainCategory(currentCategory || '');
    setSelectedSubcategory(currentSubcategory || '');
    onClose();

    console.log('✅ DEBUG: Category modal closed and reset');
  };

  useEffect(() => {
    console.log(
      '🔄 MODAL DEBUG: CategorySelectionModal useEffect - visible changed to:',
      visible
    );
    if (visible) {
      console.log('✅ MODAL DEBUG: Modal is visible, fetching categories...');
      fetchCategories();
    }
  }, [visible]);

  console.log(
    '🎭 MODAL DEBUG: CategorySelectionModal render - visible:',
    visible,
    'returning early?',
    !visible
  );

  if (!visible) {
    console.log('⏹️ MODAL DEBUG: Modal not visible, returning null');
    return null;
  }

  console.log('✅ MODAL DEBUG: Modal is visible, rendering modal content');

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {showSubcategories ? 'Choose Subcategory' : 'Choose Category'}
          </Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#F9FAFB" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.categoryList}
          showsVerticalScrollIndicator={false}
        >
          {!showSubcategories ? (
            // Main categories
            Object.keys(categories).map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryItem,
                  currentCategory === category && styles.selectedCategoryItem,
                ]}
                onPress={() => handleMainCategorySelect(category)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    currentCategory === category && styles.selectedCategoryText,
                  ]}
                >
                  {category}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </TouchableOpacity>
            ))
          ) : (
            // Subcategories
            <>
              <View style={styles.subcategoryHeader}>
                <TouchableOpacity
                  onPress={() => setShowSubcategories(false)}
                  style={styles.backButton}
                >
                  <Ionicons name="chevron-back" size={20} color="#34D399" />
                  <Text style={styles.backButtonText}>Back to Categories</Text>
                </TouchableOpacity>
                <Text style={styles.selectedCategoryLabel}>
                  {selectedMainCategory}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkipSubcategory}
              >
                <Text style={styles.skipButtonText}>
                  Skip - Use "{selectedMainCategory}" only
                </Text>
              </TouchableOpacity>

              {categories[selectedMainCategory] &&
                Object.keys(categories[selectedMainCategory]).map(
                  (subcategory) => (
                    <TouchableOpacity
                      key={subcategory}
                      style={[
                        styles.subcategoryItem,
                        currentSubcategory === subcategory &&
                          styles.selectedSubcategoryItem,
                      ]}
                      onPress={() => handleSubcategorySelect(subcategory)}
                    >
                      <Text
                        style={[
                          styles.subcategoryText,
                          currentSubcategory === subcategory &&
                            styles.selectedSubcategoryText,
                        ]}
                      >
                        {subcategory}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

// NEW: Preview Modal for Similar Transactions
const SimilarTransactionsPreviewModal = ({
  visible,
  onClose,
  transactionId,
  category,
  subcategory,
  onConfirmUpdates,
}: {
  visible: boolean;
  onClose: () => void;
  transactionId: string;
  category: string;
  subcategory?: string;
  onConfirmUpdates: (selectedIds: string[]) => void;
}) => {
  const [previewData, setPreviewData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(
    new Set()
  );
  const [selectAll, setSelectAll] = useState(true);

  const fetchPreview = async () => {
    console.log('🔍 DEBUG: fetchPreview called');
    console.log('📊 DEBUG: Preview params:', {
      transactionId,
      category,
      subcategory,
    });

    if (!transactionId || !category) {
      console.log('❌ DEBUG: Missing required params for preview');
      return;
    }

    setLoading(true);
    console.log('⏳ DEBUG: Starting preview fetch...');

    try {
      const queryParams = new URLSearchParams({
        category: category,
        ...(subcategory && { subcategory: subcategory }),
      });

      const response = await fetch(
        `${getApiUrl()}/api/transactions/${transactionId}/preview-similar?${queryParams}`,
        {
          headers: {
            'x-user-id': getDevUserId(),
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch preview');
      }

      const data = await response.json();
      console.log('📊 DEBUG: Preview data received:', {
        totalCount: data.totalCount,
        patterns: data.patterns,
        proposedCategory: data.proposedCategory,
        proposedSubcategory: data.proposedSubcategory,
      });

      setPreviewData(data);

      // Pre-select all similar transactions
      const allIds = new Set<string>(
        data.similarTransactions.map((t: any) => t.id)
      );
      setSelectedTransactions(allIds);
      setSelectAll(allIds.size === data.similarTransactions.length);

      console.log(
        '✅ DEBUG: Preview loaded successfully with',
        data.totalCount,
        'similar transactions'
      );
    } catch (error) {
      console.error('❌ DEBUG: Error fetching preview:', error);
      Alert.alert('Error', 'Failed to preview similar transactions');
    } finally {
      setLoading(false);
      console.log('🔚 DEBUG: Preview fetch completed');
    }
  };

  const toggleTransaction = (transactionId: string) => {
    console.log('🔄 DEBUG: toggleTransaction called for ID:', transactionId);

    const newSelected = new Set(selectedTransactions);
    const wasSelected = newSelected.has(transactionId);

    if (wasSelected) {
      newSelected.delete(transactionId);
      console.log('➖ DEBUG: Deselected transaction:', transactionId);
    } else {
      newSelected.add(transactionId);
      console.log('➕ DEBUG: Selected transaction:', transactionId);
    }

    setSelectedTransactions(newSelected);
    setSelectAll(newSelected.size === previewData?.similarTransactions.length);

    console.log('📊 DEBUG: Transaction selection updated:', {
      totalSelected: newSelected.size,
      totalAvailable: previewData?.similarTransactions.length,
      isAllSelected:
        newSelected.size === previewData?.similarTransactions.length,
    });
  };

  const toggleSelectAll = () => {
    console.log('🔄 DEBUG: toggleSelectAll called, current state:', selectAll);

    if (selectAll) {
      console.log('➖ DEBUG: Deselecting all transactions');
      setSelectedTransactions(new Set());
    } else {
      const allIds = new Set<string>(
        previewData?.similarTransactions.map((t: any) => t.id)
      );
      console.log('➕ DEBUG: Selecting all transactions, count:', allIds.size);
      setSelectedTransactions(allIds);
    }

    setSelectAll(!selectAll);

    console.log('✅ DEBUG: Select all toggled to:', !selectAll);
  };

  const handleConfirm = async () => {
    const selectedIds = Array.from(selectedTransactions);
    const allTransactionIds =
      previewData?.similarTransactions.map((t: any) => t.id) || [];
    const deselectedIds = allTransactionIds.filter(
      (id: string) => !selectedIds.includes(id)
    );

    // Always include the original transaction that was selected for category change
    const finalTransactionIds = [...new Set([transactionId, ...selectedIds])];

    console.log('🧠 NEGATIVE LEARNING DEBUG:', {
      originalTransactionId: transactionId,
      selectedFromPreview: selectedIds.length,
      deselectedCount: deselectedIds.length,
      finalUpdateCount: finalTransactionIds.length,
      category: category,
      subcategory: subcategory,
    });

    // Learn from negative feedback if there are deselected transactions
    if (deselectedIds.length > 0) {
      try {
        console.log('🔄 Calling negative learning API...');
        const response = await fetch(
          `${getApiUrl()}/api/transactions/learn-negative`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': getDevUserId(),
            },
            body: JSON.stringify({
              selectedTransactionId: transactionId,
              deselectedTransactionIds: deselectedIds,
              category: category,
              subcategory: subcategory,
            }),
          }
        );

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Negative learning completed:', result);
        } else {
          console.error('❌ Negative learning failed:', await response.text());
        }
      } catch (error) {
        console.error('❌ Error calling negative learning API:', error);
      }
    }

    // Proceed with the normal update, always including the original transaction
    onConfirmUpdates(finalTransactionIds);
  };

  const handleClose = () => {
    setPreviewData(null);
    setSelectedTransactions(new Set());
    setSelectAll(true);
    onClose();
  };

  useEffect(() => {
    if (visible && transactionId && category) {
      fetchPreview();
    }
  }, [visible, transactionId, category, subcategory]);

  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <View style={[styles.modalContent, styles.previewModalContent]}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Update Similar Transactions</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#F9FAFB" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#34D399" />
            <Text style={styles.loadingText}>
              Finding similar transactions...
            </Text>
          </View>
        ) : previewData ? (
          <View style={styles.previewContainer}>
            <ScrollView
              style={styles.previewContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.previewHeader}>
                <Text style={styles.previewTitle}>
                  Found {previewData.totalCount} similar transactions
                </Text>
                <Text style={styles.previewSubtitle}>
                  Based on patterns: {previewData.patterns.join(', ')}
                </Text>
                <Text style={styles.previewCategory}>
                  Will be categorized as: {category}
                  {subcategory ? ` > ${subcategory}` : ''}
                </Text>
              </View>

              {previewData.totalCount > 0 ? (
                <>
                  <View style={styles.selectAllContainer}>
                    <TouchableOpacity
                      style={styles.selectAllButton}
                      onPress={toggleSelectAll}
                    >
                      <Ionicons
                        name={selectAll ? 'checkbox' : 'checkbox-outline'}
                        size={24}
                        color="#34D399"
                      />
                      <Text style={styles.selectAllText}>
                        {selectAll ? 'Deselect All' : 'Select All'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {previewData.similarTransactions.map((transaction: any) => (
                    <TouchableOpacity
                      key={transaction.id}
                      style={[
                        styles.previewTransactionItem,
                        selectedTransactions.has(transaction.id) &&
                          styles.selectedTransactionItem,
                      ]}
                      onPress={() => toggleTransaction(transaction.id)}
                    >
                      <View style={styles.transactionCheckbox}>
                        <Ionicons
                          name={
                            selectedTransactions.has(transaction.id)
                              ? 'checkbox'
                              : 'checkbox-outline'
                          }
                          size={20}
                          color="#34D399"
                        />
                      </View>
                      <View style={styles.transactionDetails}>
                        <Text
                          style={styles.transactionDescription}
                          numberOfLines={2}
                        >
                          {transaction.description}
                        </Text>
                        <View style={styles.transactionMeta}>
                          <Text style={styles.transactionDate}>
                            {moment(transaction.posted_date).format(
                              'MMM DD, YYYY'
                            )}
                          </Text>
                          <Text style={styles.transactionAmount}>
                            ${Math.abs(transaction.amount).toFixed(2)}
                          </Text>
                        </View>
                        <View style={styles.transactionCurrentCategory}>
                          <Text style={styles.currentCategoryLabel}>
                            Current: {transaction.category || 'Uncategorized'}
                            {transaction.subcategory &&
                              ` > ${transaction.subcategory}`}
                          </Text>
                        </View>
                        <View style={styles.matchingPatterns}>
                          <Text style={styles.patternsLabel}>
                            Matches: {transaction.matchingPatterns.join(', ')}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </>
              ) : (
                <View style={styles.noDataContainer}>
                  <Ionicons name="checkmark-circle" size={48} color="#34D399" />
                  <Text style={styles.noDataText}>
                    All similar transactions are already correctly categorized!
                  </Text>
                  <Text style={styles.noDataSubtext}>
                    Found {previewData.patterns.length} matching patterns, but
                    all similar transactions are already in "{category}
                    {subcategory ? ` > ${subcategory}` : ''}"
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Action buttons always visible at bottom */}
            <View style={styles.previewActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  previewData.totalCount === 0 && styles.updateOnlyButton,
                ]}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmButtonText}>
                  {previewData.totalCount === 0
                    ? 'Update Original Transaction'
                    : `Update ${selectedTransactions.size + 1} Transaction${
                        selectedTransactions.size !== 0 ? 's' : ''
                      }`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No preview data available</Text>
          </View>
        )}
      </View>
    </View>
  );
};

// Modern Transaction Card Component
const ModernTransactionCard = ({
  transaction,
  onUpdateCategory,
  onUpdateTag,
  loadingTags,
}: {
  transaction: Transaction;
  onUpdateCategory: (transaction: Transaction) => void;
  onUpdateTag: (
    transactionId: string,
    newTag: 'essential' | 'discretionary'
  ) => void;
  loadingTags: Set<string>;
}) => {
  const isNegative = transaction.amount < 0;
  const displayAmount = Math.abs(transaction.amount);
  const isLoading = loadingTags.has(transaction.id);

  return (
    <View style={styles.modernTransactionCard}>
      <View style={styles.transactionInfo}>
        <Text style={styles.modernTransactionName} numberOfLines={1}>
          {transaction.description}
        </Text>
        <TouchableOpacity
          style={styles.compactCategoryButton}
          onPress={() => onUpdateCategory(transaction)}
          activeOpacity={0.7}
        >
          <Text style={styles.compactCategoryText}>
            {transaction.category || 'General'}
          </Text>
          {transaction.subcategory && (
            <Text style={styles.compactSubcategoryText}>
              {transaction.subcategory}
            </Text>
          )}
        </TouchableOpacity>
        <Text style={styles.modernTransactionDate}>
          {moment(transaction.posted_date, 'YYYY-MM-DD').format('MMM D, YYYY')}
        </Text>
      </View>

      <View style={styles.transactionRight}>
        <Text
          style={[
            styles.modernTransactionAmount,
            isNegative ? styles.expenseAmount : styles.incomeAmount,
          ]}
        >
          ${displayAmount.toFixed(2)}
        </Text>

        {isLoading ? (
          <View style={styles.tagLoadingContainer}>
            <ActivityIndicator size="small" color="#34D399" />
            <Text style={styles.tagLoadingText}>Updating...</Text>
          </View>
        ) : transaction.tag ? (
          <View
            style={[
              styles.modernTag,
              transaction.tag === 'essential'
                ? styles.essentialTag
                : styles.discretionaryTag,
            ]}
          >
            <Text style={styles.modernTagText}>{transaction.tag}</Text>
          </View>
        ) : null}

        <View style={styles.modernActionButtons}>
          <TouchableOpacity
            style={[
              styles.modernTagButton,
              styles.modernEssentialButton,
              transaction.tag === 'essential' && styles.activeTagButton,
              isLoading && styles.disabledTagButton,
            ]}
            onPress={() =>
              !isLoading && onUpdateTag(transaction.id, 'essential')
            }
            disabled={isLoading}
          >
            <Text
              style={[
                styles.modernTagButtonText,
                transaction.tag === 'essential' && styles.activeTagButtonText,
              ]}
            >
              Essential
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modernTagButton,
              styles.modernDiscretionaryButton,
              transaction.tag === 'discretionary' && styles.activeTagButton,
              isLoading && styles.disabledTagButton,
            ]}
            onPress={() =>
              !isLoading && onUpdateTag(transaction.id, 'discretionary')
            }
            disabled={isLoading}
          >
            <Text
              style={[
                styles.modernTagButtonText,
                transaction.tag === 'discretionary' &&
                  styles.activeTagButtonText,
              ]}
            >
              Optional
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const { userId, firstName } = useSession();
  const queryClient = useQueryClient();

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  // Track loading state for individual transaction tags
  const [loadingTags, setLoadingTags] = useState<Set<string>>(new Set());

  // NEW: Preview Modal State
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewTransactionId, setPreviewTransactionId] = useState<string>('');
  const [previewCategory, setPreviewCategory] = useState<string>('');
  const [previewSubcategory, setPreviewSubcategory] = useState<string>('');

  const { data, isLoading, error } = useQuery<{
    transactions: Transaction[];
    insights: {
      anomalies: Insight[];
      recurring: RecurringTransaction[];
      personalized: PersonalizedInsight[];
    };
  }>({
    queryKey: ['financialData'],
    queryFn: async () => {
      const response = await fetch(`${getApiUrl()}/api/data`, {
        headers: {
          'x-user-id': userId || getDevUserId(),
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch financial data from the server.');
      }
      return response.json();
    },
  });

  const transactions = data?.transactions ?? [];
  const recurring = data?.insights?.recurring ?? [];

  // Process and group transactions
  const { groupedTransactions, categories } = useMemo(() => {
    let filteredTransactions = transactions;

    // Apply search filter
    if (searchQuery) {
      filteredTransactions = filteredTransactions.filter(
        (t) =>
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (t.category &&
            t.category.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply category filter
    if (selectedCategory !== 'All') {
      filteredTransactions = filteredTransactions.filter(
        (t) => t.category === selectedCategory
      );
    }

    // Sort transactions
    filteredTransactions.sort((a, b) => {
      if (sortBy === 'date') {
        return (
          new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime()
        );
      } else {
        return Math.abs(b.amount) - Math.abs(a.amount);
      }
    });

    // Group by month
    const grouped = filteredTransactions.reduce((acc, transaction) => {
      const monthKey = moment(transaction.posted_date, 'YYYY-MM-DD').format(
        'YYYY-MM'
      );
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(transaction);
      return acc;
    }, {} as Record<string, Transaction[]>);

    // Get unique categories
    const uniqueCategories = Array.from(
      new Set(
        transactions
          .map((t) => t.category)
          .filter((category): category is string => Boolean(category))
      )
    ).sort();

    return { groupedTransactions: grouped, categories: uniqueCategories };
  }, [transactions, searchQuery, selectedCategory, sortBy]);

  // Auto-expand current month
  React.useEffect(() => {
    const currentMonth = moment().format('YYYY-MM');
    if (
      groupedTransactions[currentMonth] &&
      !expandedMonths.has(currentMonth)
    ) {
      setExpandedMonths(new Set([currentMonth]));
    }
  }, [groupedTransactions]);

  const toggleMonthExpansion = (monthKey: string) => {
    setExpandedMonths((prev) => {
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
    console.log('🔧 DEBUG: handleUpdateCategory called');
    console.log('📝 Transaction:', {
      id: transaction.id,
      description: transaction.description.substring(0, 50) + '...',
      currentCategory: transaction.category,
      currentSubcategory: transaction.subcategory,
    });

    setSelectedTransaction(transaction);
    setCategoryModalVisible(true);

    console.log('✅ DEBUG: Category modal should be visible now');
  };

  const handleCategorySelect = async (
    category: string,
    subcategory?: string
  ) => {
    console.log('🎯 DEBUG: handleCategorySelect called');
    console.log('📊 Selected category:', category);
    console.log('📊 Selected subcategory:', subcategory || 'none');

    if (!selectedTransaction) {
      console.log('❌ DEBUG: No transaction selected!');
      return;
    }

    console.log('🔄 DEBUG: Processing transaction:', {
      id: selectedTransaction.id,
      description: selectedTransaction.description.substring(0, 50) + '...',
      fromCategory: selectedTransaction.category,
      toCategory: category,
      fromSubcategory: selectedTransaction.subcategory,
      toSubcategory: subcategory,
    });

    // Store the selection for preview
    setPreviewTransactionId(selectedTransaction.id);
    setPreviewCategory(category);
    setPreviewSubcategory(subcategory || '');

    console.log('💾 DEBUG: Stored preview data:', {
      transactionId: selectedTransaction.id,
      category: category,
      subcategory: subcategory || '',
    });

    // Close category modal and show preview modal
    setCategoryModalVisible(false);
    setPreviewModalVisible(true);

    console.log(
      '🔄 DEBUG: Modals switched - category modal closed, preview modal opened'
    );
  };

  const handleConfirmUpdates = async (selectedIds: string[]) => {
    console.log('✅ DEBUG: handleConfirmUpdates called');
    console.log('📝 Selected transaction IDs:', selectedIds);
    console.log('🎯 Category to apply:', previewCategory);
    console.log('🎯 Subcategory to apply:', previewSubcategory || 'none');

    if (selectedIds.length === 0) {
      console.log('⚠️ DEBUG: No transactions selected, closing preview modal');
      setPreviewModalVisible(false);
      return;
    }

    try {
      console.log('🌐 DEBUG: Making API call to update transactions...');

      const requestBody = {
        transactionIds: selectedIds,
        category: previewCategory,
        subcategory: previewSubcategory || null,
      };

      console.log('📤 DEBUG: Request body:', requestBody);

      const response = await fetch(
        `${getApiUrl()}/api/transactions-bulk/update-selected`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId || getDevUserId(),
          },
          body: JSON.stringify(requestBody),
        }
      );

      console.log(
        '📡 DEBUG: Response status:',
        response.status,
        response.statusText
      );

      if (!response.ok) {
        throw new Error('Failed to update transactions');
      }

      const result = await response.json();
      console.log('📊 DEBUG: API response:', result);

      // Invalidate the financial data query to refresh all screens
      queryClient.invalidateQueries({ queryKey: ['financialData'] });

      console.log('🔄 DEBUG: Query cache invalidated');
      console.log(
        `✅ DEBUG: Updated ${
          result.updatedCount
        } transactions to ${previewCategory}${
          previewSubcategory ? ` > ${previewSubcategory}` : ''
        }`
      );

      Alert.alert(
        'Success!',
        `Updated ${result.updatedCount} transaction${
          result.updatedCount !== 1 ? 's' : ''
        } to ${previewCategory}${
          previewSubcategory ? ` > ${previewSubcategory}` : ''
        }`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.log('❌ DEBUG: Error updating transactions:', error);
      console.log('❌ DEBUG: Error message:', error.message);
      Alert.alert('Error', error.message || 'Failed to update transactions');
    } finally {
      console.log('🔚 DEBUG: Closing preview modal');
      setPreviewModalVisible(false);
    }
  };

  const handleUpdateTag = async (
    transactionId: string,
    newTag: 'essential' | 'discretionary'
  ) => {
    try {
      // Add this transaction to loading state
      setLoadingTags((prev) => new Set(prev).add(transactionId));

      console.log(
        `🏷️ Updating tag for transaction ${transactionId} to ${newTag}`
      );

      const response = await fetch(
        `${getApiUrl()}/api/transactions/${transactionId}/tag`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId || getDevUserId(),
          },
          body: JSON.stringify({ tag: newTag }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update tag');
      }

      // Update was successful, invalidate the query to refresh data
      await queryClient.invalidateQueries(['financialData']);

      console.log(
        `✅ Successfully updated tag for transaction ${transactionId}`
      );
    } catch (error: any) {
      console.error(
        `❌ Error updating tag for transaction ${transactionId}:`,
        error
      );
      Alert.alert('Error', error.message || 'Could not update tag.');
    } finally {
      // Remove this transaction from loading state
      setLoadingTags((prev) => {
        const newSet = new Set(prev);
        newSet.delete(transactionId);
        return newSet;
      });
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

  // DEBUG: Modal state logging
  console.log('🔍 RENDER DEBUG: categoryModalVisible =', categoryModalVisible);
  console.log(
    '🔍 RENDER DEBUG: selectedTransaction =',
    selectedTransaction?.id
  );
  console.log('🔍 RENDER DEBUG: previewModalVisible =', previewModalVisible);
  console.log(
    '🎯 MODAL DEBUG: About to render CategorySelectionModal with visible =',
    categoryModalVisible
  );
  console.log(
    '🎯 PREVIEW DEBUG: About to render SimilarTransactionsPreviewModal with visible =',
    previewModalVisible
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <GreetingComponent firstName={firstName} />

        {recurring.length > 0 && (
          <View style={styles.recurringContainer}>
            <Text style={styles.insightsTitle}>Upcoming Bills</Text>
            {recurring.map((item) => (
              <View
                key={`${item.name}-${item.nextDate}`}
                style={styles.recurringItem}
              >
                <Text style={styles.recurringName}>{item.name}</Text>
                <Text style={styles.recurringAmount}>
                  ~${item.amount.toFixed(2)} on{' '}
                  {moment(item.nextDate, 'YYYY-MM-DD').format('MMM D')}
                </Text>
              </View>
            ))}
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
              loadingTags={loadingTags}
            />
          ))
        )}
      </ScrollView>

      <CategorySelectionModal
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        onSelectCategory={handleCategorySelect}
        currentCategory={selectedTransaction?.category}
        currentSubcategory={selectedTransaction?.subcategory}
      />

      <SimilarTransactionsPreviewModal
        visible={previewModalVisible}
        onClose={() => setPreviewModalVisible(false)}
        transactionId={previewTransactionId}
        category={previewCategory}
        subcategory={previewSubcategory}
        onConfirmUpdates={handleConfirmUpdates}
      />
    </View>
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
  scrollContainer: {
    flex: 1,
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
    marginRight: 12,
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
  activeTagButton: {
    borderWidth: 1,
    borderColor: '#34D399',
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
  },
  activeTagButtonText: {
    color: '#34D399',
    fontWeight: '600',
  },
  disabledTagButton: {
    opacity: 0.5,
  },
  tagLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  tagLoadingText: {
    fontSize: 12,
    color: '#34D399',
    marginLeft: 4,
  },
  modernEssentialButton: {
    backgroundColor: '#3B82F6',
  },
  modernDiscretionaryButton: {
    backgroundColor: '#EF4444',
  },
  compactCategoryButton: {
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
    marginBottom: 2,
    alignSelf: 'flex-start',
  },
  compactCategoryText: {
    fontSize: 12,
    color: '#34D399',
    fontWeight: '600',
  },
  compactSubcategoryText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '500',
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

  essentialTag: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    color: '#60A5FA',
  },
  discretionaryTag: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    color: '#F87171',
  },

  // Modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#374151',
    zIndex: 1001,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F9FAFB',
  },
  closeButton: {
    padding: 5,
  },
  categoryList: {
    paddingBottom: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F9FAFB',
  },
  selectedCategoryItem: {
    backgroundColor: '#34D399',
    borderColor: '#34D399',
  },
  selectedCategoryText: {
    color: '#111827',
    fontWeight: 'bold',
  },
  subcategoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 14,
    color: '#34D399',
    marginLeft: 5,
  },
  selectedCategoryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F9FAFB',
  },
  skipButton: {
    backgroundColor: '#1F2937',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  skipButtonText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  subcategoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  subcategoryText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F9FAFB',
  },
  selectedSubcategoryItem: {
    backgroundColor: '#34D399',
    borderColor: '#34D399',
  },
  selectedSubcategoryText: {
    color: '#111827',
    fontWeight: 'bold',
  },
  previewModalContent: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#374151',
  },
  previewContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  previewContent: {
    flex: 1,
    padding: 20,
  },
  previewHeader: {
    backgroundColor: '#1F2937',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#374151',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 5,
  },
  previewSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 10,
  },
  previewCategory: {
    fontSize: 14,
    color: '#34D399',
    fontWeight: '500',
  },
  selectAllContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  selectAllText: {
    fontSize: 14,
    color: '#F9FAFB',
    marginLeft: 5,
  },
  previewTransactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  selectedTransactionItem: {
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    borderColor: '#34D399',
    borderWidth: 2,
  },
  transactionCheckbox: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionDetails: {
    flex: 1,
    marginLeft: 10,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#34D399',
  },
  transactionCurrentCategory: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#374151',
    marginTop: 4,
  },
  currentCategoryLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  matchingPatterns: {
    marginTop: 4,
  },
  patternsLabel: {
    fontSize: 12,
    color: '#C4B5FD',
    fontWeight: '500',
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#1F2937',
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  cancelButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#F9FAFB',
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#34D399',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#34D399',
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#374151',
    borderColor: '#374151',
    opacity: 0.7,
  },
  updateOnlyButton: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  okButton: {
    backgroundColor: '#34D399',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  okButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 10,
  },
});
