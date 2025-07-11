import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { Target, Plus, Calendar, DollarSign, TrendingUp, X, TrendingDown, Zap, BarChart3, Award, Clock } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { Transaction } from '../../../common/types';

const API_HOST = 'http://127.0.0.1:8000';

const mockGoals = [
  {
    id: 1,
    name: 'Emergency Fund',
    target: 10000,
    current: 6500,
    progress: 65,
    targetDate: '2025-12-31',
    monthlyContribution: 250,
    priority: 'high',
    category: 'safety'
  },
  {
    id: 2,
    name: 'Vacation to Europe',
    target: 3000,
    current: 1200,
    progress: 40,
    targetDate: '2025-07-15',
    monthlyContribution: 300,
    priority: 'medium',
    category: 'lifestyle'
  },
  {
    id: 3,
    name: 'New Laptop',
    target: 2500,
    current: 800,
    progress: 32,
    targetDate: '2025-05-01',
    monthlyContribution: 425,
    priority: 'low',
    category: 'technology'
  }
];

const mockDebts = [
  {
    id: 1,
    name: 'Credit Card',
    balance: 4200,
    minPayment: 105,
    interestRate: 18.9,
    payoffDate: '2027-03-15',
    extraPayment: 0
  },
  {
    id: 2,
    name: 'Student Loan',
    balance: 12500,
    minPayment: 180,
    interestRate: 4.5,
    payoffDate: '2030-08-20',
    extraPayment: 0
  }
];

export default function GoalsScreen() {
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [showDebtCalculator, setShowDebtCalculator] = useState(false);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributionGoal, setContributionGoal] = useState(null);
  const [extraPayment, setExtraPayment] = useState('');
  const [spendingImpacts, setSpendingImpacts] = useState([]);
  const [debtStrategy, setDebtStrategy] = useState('current'); // 'current', 'snowball', 'avalanche'
  const [showStrategyComparison, setShowStrategyComparison] = useState(false);
  const [availableExtraPayment, setAvailableExtraPayment] = useState('');

  // Fetch transaction data for spending impact analysis
  const { data: transactionData } = useQuery<{
    transactions: Transaction[];
  }>({
    queryKey: ['financialData'],
    queryFn: async () => {
      const response = await fetch(`${API_HOST}/api/data`);
      if (!response.ok) {
        throw new Error('Failed to fetch financial data');
      }
      return response.json();
    }
  });

  // Calculate spending impact on goals
  useEffect(() => {
    if (!transactionData?.transactions) return;

    const transactions = transactionData.transactions;
    const currentWeekStart = new Date();
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
    const lastWeekStart = new Date(currentWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    // Calculate weekly spending by category
    const getWeeklySpending = (weekStart: Date) => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      return transactions
        .filter(t => {
          const transactionDate = new Date(t.posted_date);
          return transactionDate >= weekStart && transactionDate <= weekEnd && t.amount < 0 && t.tag === 'discretionary';
        })
        .reduce((total, t) => total + Math.abs(t.amount), 0);
    };

    const currentWeekSpending = getWeeklySpending(currentWeekStart);
    const lastWeekSpending = getWeeklySpending(lastWeekStart);
    const savingsFromReduction = lastWeekSpending - currentWeekSpending;

    if (savingsFromReduction > 0) {
      const impacts = mockGoals.map(goal => ({
        goalId: goal.id,
        goalName: goal.name,
        savingsAmount: savingsFromReduction / mockGoals.length, // Distribute savings equally
        timeReduction: calculateTimeReduction(goal, savingsFromReduction / mockGoals.length),
      }));
      setSpendingImpacts(impacts);
    } else {
      setSpendingImpacts([]);
    }
  }, [transactionData]);

  const calculateTimeReduction = (goal: any, extraContribution: number) => {
    const remaining = goal.target - goal.current;
    const monthsAtCurrentRate = remaining / goal.monthlyContribution;
    const monthsWithExtra = remaining / (goal.monthlyContribution + extraContribution);
    const timeSaved = monthsAtCurrentRate - monthsWithExtra;
    
    if (timeSaved < 1) {
      return `${Math.round(timeSaved * 30)} days`;
    }
    return `${Math.round(timeSaved)} months`;
  };

  const handleContribution = async () => {
    if (!contributionAmount || !contributionGoal) return;

    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid contribution amount');
      return;
    }

    try {
      // Update goal progress (in a real app, this would be an API call)
      const updatedGoals = mockGoals.map(goal => {
        if (goal.id === contributionGoal.id) {
          const newCurrent = goal.current + amount;
          return {
            ...goal,
            current: newCurrent,
            progress: Math.round((newCurrent / goal.target) * 100)
          };
        }
        return goal;
      });

      Alert.alert(
        'Contribution Added!',
        `Successfully added ${formatCurrency(amount)} to ${contributionGoal.name}`,
        [{ text: 'OK', onPress: () => {
          setShowContributionModal(false);
          setContributionAmount('');
          setContributionGoal(null);
        }}]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add contribution');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateDebtPayoff = (balance: number, payment: number, rate: number) => {
    if (payment <= (balance * rate / 100 / 12)) return 'Never';
    
    const monthlyRate = rate / 100 / 12;
    const months = Math.log(1 + (balance * monthlyRate) / payment) / Math.log(1 + monthlyRate);
    const years = Math.floor(months / 12);
    const remainingMonths = Math.ceil(months % 12);
    
    if (years === 0) return `${remainingMonths} months`;
    return `${years} years, ${remainingMonths} months`;
  };

  const calculateDebtPayoffMonths = (balance: number, payment: number, rate: number) => {
    if (payment <= (balance * rate / 100 / 12)) return 999; // Never pays off
    
    const monthlyRate = rate / 100 / 12;
    return Math.log(1 + (balance * monthlyRate) / payment) / Math.log(1 + monthlyRate);
  };

  const calculateTotalInterest = (balance: number, payment: number, rate: number) => {
    const months = calculateDebtPayoffMonths(balance, payment, rate);
    if (months >= 999) return balance * 10; // Arbitrary high number for "never"
    
    return (payment * months) - balance;
  };

  const calculateStrategyResults = (extraAmount: number) => {
    const totalExtraPayment = extraAmount || 0;
    
    // Current strategy (maintain current payments + distribute extra equally)
    const currentResults = mockDebts.map(debt => ({
      ...debt,
      payment: debt.minPayment + (totalExtraPayment / mockDebts.length),
      months: calculateDebtPayoffMonths(debt.balance, debt.minPayment + (totalExtraPayment / mockDebts.length), debt.interestRate),
      totalInterest: calculateTotalInterest(debt.balance, debt.minPayment + (totalExtraPayment / mockDebts.length), debt.interestRate)
    }));

    // Debt Snowball (lowest balance first)
    const snowballDebts = [...mockDebts].sort((a, b) => a.balance - b.balance);
    const snowballResults = calculateDebtSequence(snowballDebts, totalExtraPayment);

    // Debt Avalanche (highest interest rate first)  
    const avalancheDebts = [...mockDebts].sort((a, b) => b.interestRate - a.interestRate);
    const avalancheResults = calculateDebtSequence(avalancheDebts, totalExtraPayment);

    const calculateTotals = (results: any[]) => ({
      totalMonths: Math.max(...results.map(d => d.months)),
      totalInterest: results.reduce((sum, d) => sum + d.totalInterest, 0),
      totalPaid: results.reduce((sum, d) => sum + (d.payment * d.months), 0)
    });

    return {
      current: {
        debts: currentResults,
        totals: calculateTotals(currentResults)
      },
      snowball: {
        debts: snowballResults,
        totals: calculateTotals(snowballResults)
      },
      avalanche: {
        debts: avalancheResults,
        totals: calculateTotals(avalancheResults)
      }
    };
  };

  const calculateDebtSequence = (sortedDebts: typeof mockDebts, extraAmount: number) => {
    let remainingExtra = extraAmount;
    const results = [];
    let cumulativeMonths = 0;

    for (let i = 0; i < sortedDebts.length; i++) {
      const debt = sortedDebts[i];
      const payment = debt.minPayment + (i === 0 ? remainingExtra : 0);
      const months = calculateDebtPayoffMonths(debt.balance, payment, debt.interestRate);
      
      results.push({
        ...debt,
        payment,
        months: cumulativeMonths + months,
        totalInterest: calculateTotalInterest(debt.balance, payment, debt.interestRate)
      });

      // After paying off this debt, add its minimum payment to the extra for the next debt
      if (i < sortedDebts.length - 1) {
        remainingExtra += debt.minPayment;
      }
      
      cumulativeMonths += months;
    }

    return results;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#64748B';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#0F172A', '#1E293B']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Goals & Debt</Text>
        <Text style={styles.headerSubtitle}>Track progress and plan your future</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Spending Impact Insights */}
        {spendingImpacts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.impactHeader}>
              <Zap size={20} color="#34D399" />
              <Text style={styles.impactTitle}>Great Job! Spending Impact</Text>
            </View>
            <Text style={styles.impactSubtitle}>
              Your reduced discretionary spending this week can accelerate your goals!
            </Text>
            
            <View style={styles.impactsList}>
              {spendingImpacts.map((impact) => (
                <View key={impact.goalId} style={styles.impactCard}>
                  <View style={styles.impactLeft}>
                    <Text style={styles.impactGoalName}>{impact.goalName}</Text>
                    <Text style={styles.impactSavings}>
                      +{formatCurrency(impact.savingsAmount)} available
                    </Text>
                  </View>
                  <View style={styles.impactRight}>
                    <Text style={styles.impactTimeReduction}>
                      -{impact.timeReduction}
                    </Text>
                    <Text style={styles.impactTimeLabel}>faster</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.contributeButton}
                    onPress={() => {
                      setContributionGoal(mockGoals.find(g => g.id === impact.goalId));
                      setContributionAmount(impact.savingsAmount.toFixed(2));
                      setShowContributionModal(true);
                    }}
                  >
                    <Text style={styles.contributeButtonText}>Contribute Now</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Goals Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎯 Savings Goals</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowNewGoalModal(true)}
            >
              <Plus size={16} color="#10B981" />
              <Text style={styles.addButtonText}>Add Goal</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.goalsList}>
            {mockGoals.map((goal) => (
              <TouchableOpacity
                key={goal.id}
                style={styles.goalCard}
                onPress={() => setSelectedGoal(goal)}
                activeOpacity={0.8}
              >
                <View style={styles.goalHeader}>
                  <View style={styles.goalLeft}>
                    <Text style={styles.goalName}>{goal.name}</Text>
                    <View style={styles.goalMeta}>
                      <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(goal.priority) }]} />
                      <Text style={styles.goalMetaText}>{goal.priority} priority</Text>
                      <Calendar size={12} color="#94A3B8" />
                      <Text style={styles.goalMetaText}>{formatDate(goal.targetDate)}</Text>
                    </View>
                  </View>
                  <View style={styles.goalRight}>
                    <Text style={styles.goalProgress}>{goal.progress}%</Text>
                    <Text style={styles.goalAmount}>
                      {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
                    </Text>
                  </View>
                </View>

                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${goal.progress}%` }]} />
                  </View>
                </View>

                <View style={styles.goalFooter}>
                  <View style={styles.contributionInfo}>
                    <DollarSign size={14} color="#10B981" />
                    <Text style={styles.contributionText}>
                      {formatCurrency(goal.monthlyContribution)}/month
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.quickContributeButton}
                    onPress={() => {
                      setContributionGoal(goal);
                      setShowContributionModal(true);
                    }}
                  >
                    <Plus size={14} color="#34D399" />
                    <Text style={styles.quickContributeText}>Add Money</Text>
                  </TouchableOpacity>
                  <Text style={styles.remainingText}>
                    {formatCurrency(goal.target - goal.current)} remaining
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Debt Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Debt Overview</Text>
          
          <View style={styles.debtsList}>
            {mockDebts.map((debt) => (
              <TouchableOpacity
                key={debt.id}
                style={styles.debtCard}
                onPress={() => {
                  setSelectedDebt(debt);
                  setShowDebtCalculator(true);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.debtHeader}>
                  <Text style={styles.debtName}>{debt.name}</Text>
                  <Text style={styles.debtBalance}>{formatCurrency(debt.balance)}</Text>
                </View>

                <View style={styles.debtDetails}>
                  <View style={styles.debtDetail}>
                    <Text style={styles.debtDetailLabel}>Min Payment</Text>
                    <Text style={styles.debtDetailValue}>{formatCurrency(debt.minPayment)}</Text>
                  </View>
                  <View style={styles.debtDetail}>
                    <Text style={styles.debtDetailLabel}>Interest Rate</Text>
                    <Text style={styles.debtDetailValue}>{debt.interestRate}%</Text>
                  </View>
                  <View style={styles.debtDetail}>
                    <Text style={styles.debtDetailLabel}>Payoff Date</Text>
                    <Text style={styles.debtDetailValue}>{formatDate(debt.payoffDate)}</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.calculateButton}>
                  <Text style={styles.calculateButtonText}>What if I pay more?</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* New Goal Modal */}
      <Modal
        visible={showNewGoalModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Goal</Text>
            <TouchableOpacity
              onPress={() => setShowNewGoalModal(false)}
              style={styles.closeButton}
            >
              <X size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Goal Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Emergency Fund"
                placeholderTextColor="#64748B"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Target Amount</Text>
              <TextInput
                style={styles.textInput}
                placeholder="$10,000"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Target Date</Text>
              <TextInput
                style={styles.textInput}
                placeholder="MM/DD/YYYY"
                placeholderTextColor="#64748B"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Monthly Contribution</Text>
              <TextInput
                style={styles.textInput}
                placeholder="$250"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity style={styles.createButton}>
              <Text style={styles.createButtonText}>Create Goal</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Manual Contribution Modal */}
      <Modal
        visible={showContributionModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {contributionGoal ? `Contribute to ${contributionGoal.name}` : 'Add Contribution'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowContributionModal(false);
                setContributionAmount('');
                setContributionGoal(null);
              }}
              style={styles.closeButton}
            >
              <X size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {contributionGoal && (
              <View style={styles.goalSummary}>
                <Text style={styles.goalSummaryTitle}>{contributionGoal.name}</Text>
                <Text style={styles.goalSummaryProgress}>
                  {formatCurrency(contributionGoal.current)} of {formatCurrency(contributionGoal.target)} ({contributionGoal.progress}%)
                </Text>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${contributionGoal.progress}%` }]} />
                  </View>
                </View>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Contribution Amount</Text>
              <TextInput
                style={styles.textInput}
                placeholder="$100"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                value={contributionAmount}
                onChangeText={setContributionAmount}
              />
            </View>

            {contributionAmount && (
              <View style={styles.contributionPreview}>
                <Text style={styles.previewTitle}>Impact Preview</Text>
                <View style={styles.previewItem}>
                  <Text style={styles.previewLabel}>New Progress</Text>
                  <Text style={styles.previewValue}>
                    {contributionGoal ? Math.round(((contributionGoal.current + parseFloat(contributionAmount || '0')) / contributionGoal.target) * 100) : 0}%
                  </Text>
                </View>
                <View style={styles.previewItem}>
                  <Text style={styles.previewLabel}>Remaining</Text>
                  <Text style={styles.previewValue}>
                    {contributionGoal ? formatCurrency(contributionGoal.target - contributionGoal.current - parseFloat(contributionAmount || '0')) : '$0'}
                  </Text>
                </View>
              </View>
            )}

            <TouchableOpacity style={styles.createButton} onPress={handleContribution}>
              <Text style={styles.createButtonText}>Add Contribution</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Debt Calculator Modal */}
      <Modal
        visible={showDebtCalculator}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          {selectedDebt && (
            <>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {showStrategyComparison ? 'Debt Strategy Comparison' : `${selectedDebt.name} Calculator`}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowDebtCalculator(false);
                    setShowStrategyComparison(false);
                    setDebtStrategy('current');
                  }}
                  style={styles.closeButton}
                >
                  <X size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent}>
                {!showStrategyComparison ? (
                  <>
                    {/* Individual Debt Calculator */}
                    <View style={styles.debtSummary}>
                      <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Current Balance</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(selectedDebt.balance)}</Text>
                      </View>
                      <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Minimum Payment</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(selectedDebt.minPayment)}</Text>
                      </View>
                      <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Interest Rate</Text>
                        <Text style={styles.summaryValue}>{selectedDebt.interestRate}%</Text>
                      </View>
                    </View>

                    <View style={styles.calculatorSection}>
                      <Text style={styles.calculatorTitle}>What if I pay extra?</Text>
                      
                      <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Extra Monthly Payment</Text>
                        <TextInput
                          style={styles.textInput}
                          placeholder="$100"
                          placeholderTextColor="#64748B"
                          keyboardType="numeric"
                          value={extraPayment}
                          onChangeText={setExtraPayment}
                        />
                      </View>

                      <View style={styles.calculatorResults}>
                        <View style={styles.resultItem}>
                          <Text style={styles.resultLabel}>Current Payoff Time</Text>
                          <Text style={styles.resultValue}>
                            {calculateDebtPayoff(selectedDebt.balance, selectedDebt.minPayment, selectedDebt.interestRate)}
                          </Text>
                        </View>
                        
                        {extraPayment && (
                          <>
                            <View style={styles.resultItem}>
                              <Text style={styles.resultLabel}>New Payoff Time</Text>
                              <Text style={[styles.resultValue, { color: '#10B981' }]}>
                                {calculateDebtPayoff(
                                  selectedDebt.balance, 
                                  selectedDebt.minPayment + parseFloat(extraPayment || '0'), 
                                  selectedDebt.interestRate
                                )}
                              </Text>
                            </View>

                            <View style={styles.resultItem}>
                              <Text style={styles.resultLabel}>Interest Saved</Text>
                              <Text style={[styles.resultValue, { color: '#10B981' }]}>
                                {formatCurrency(
                                  calculateTotalInterest(selectedDebt.balance, selectedDebt.minPayment, selectedDebt.interestRate) -
                                  calculateTotalInterest(selectedDebt.balance, selectedDebt.minPayment + parseFloat(extraPayment || '0'), selectedDebt.interestRate)
                                )}
                              </Text>
                            </View>
                          </>
                        )}
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.strategyButton}
                      onPress={() => setShowStrategyComparison(true)}
                    >
                      <BarChart3 size={20} color="#3B82F6" />
                      <Text style={styles.strategyButtonText}>Compare All Debt Strategies</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    {/* Strategy Comparison View */}
                    <View style={styles.strategyInputSection}>
                      <Text style={styles.calculatorTitle}>Available Extra Payment</Text>
                      <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Total Extra Monthly Payment</Text>
                        <TextInput
                          style={styles.textInput}
                          placeholder="$200"
                          placeholderTextColor="#64748B"
                          keyboardType="numeric"
                          value={availableExtraPayment}
                          onChangeText={setAvailableExtraPayment}
                        />
                      </View>
                    </View>

                    {availableExtraPayment && (
                      <>
                        <View style={styles.strategyComparison}>
                          {(() => {
                            const results = calculateStrategyResults(parseFloat(availableExtraPayment));
                            const formatMonths = (months: number) => {
                              const years = Math.floor(months / 12);
                              const remainingMonths = Math.ceil(months % 12);
                              if (years === 0) return `${remainingMonths}mo`;
                              return `${years}y ${remainingMonths}mo`;
                            };

                            return (
                              <>
                                {/* Strategy Cards */}
                                <View style={styles.strategyCards}>
                                  {/* Current Strategy */}
                                  <TouchableOpacity
                                    style={[styles.strategyCard, debtStrategy === 'current' && styles.strategyCardActive]}
                                    onPress={() => setDebtStrategy('current')}
                                  >
                                    <View style={styles.strategyCardHeader}>
                                      <DollarSign size={20} color="#64748B" />
                                      <Text style={styles.strategyCardTitle}>Current</Text>
                                    </View>
                                    <View style={styles.strategyMetrics}>
                                      <Text style={styles.strategyTime}>{formatMonths(results.current.totals.totalMonths)}</Text>
                                      <Text style={styles.strategyInterest}>{formatCurrency(results.current.totals.totalInterest)} interest</Text>
                                    </View>
                                  </TouchableOpacity>

                                  {/* Snowball Strategy */}
                                  <TouchableOpacity
                                    style={[styles.strategyCard, debtStrategy === 'snowball' && styles.strategyCardActive]}
                                    onPress={() => setDebtStrategy('snowball')}
                                  >
                                    <View style={styles.strategyCardHeader}>
                                      <Award size={20} color="#F59E0B" />
                                      <Text style={styles.strategyCardTitle}>Snowball</Text>
                                      <Text style={styles.strategySubtitle}>Lowest balance first</Text>
                                    </View>
                                    <View style={styles.strategyMetrics}>
                                      <Text style={styles.strategyTime}>{formatMonths(results.snowball.totals.totalMonths)}</Text>
                                      <Text style={styles.strategyInterest}>{formatCurrency(results.snowball.totals.totalInterest)} interest</Text>
                                      <Text style={styles.strategySavings}>
                                        Save {formatCurrency(results.current.totals.totalInterest - results.snowball.totals.totalInterest)}
                                      </Text>
                                    </View>
                                  </TouchableOpacity>

                                  {/* Avalanche Strategy */}
                                  <TouchableOpacity
                                    style={[styles.strategyCard, debtStrategy === 'avalanche' && styles.strategyCardActive]}
                                    onPress={() => setDebtStrategy('avalanche')}
                                  >
                                    <View style={styles.strategyCardHeader}>
                                      <TrendingDown size={20} color="#10B981" />
                                      <Text style={styles.strategyCardTitle}>Avalanche</Text>
                                      <Text style={styles.strategySubtitle}>Highest interest first</Text>
                                    </View>
                                    <View style={styles.strategyMetrics}>
                                      <Text style={styles.strategyTime}>{formatMonths(results.avalanche.totals.totalMonths)}</Text>
                                      <Text style={styles.strategyInterest}>{formatCurrency(results.avalanche.totals.totalInterest)} interest</Text>
                                      <Text style={styles.strategySavings}>
                                        Save {formatCurrency(results.current.totals.totalInterest - results.avalanche.totals.totalInterest)}
                                      </Text>
                                    </View>
                                  </TouchableOpacity>
                                </View>

                                {/* Best Strategy Recommendation */}
                                <View style={styles.recommendationCard}>
                                  <View style={styles.recommendationHeader}>
                                    <Award size={20} color="#10B981" />
                                    <Text style={styles.recommendationTitle}>💡 Recommendation</Text>
                                  </View>
                                  <Text style={styles.recommendationText}>
                                    {results.avalanche.totals.totalInterest <= results.snowball.totals.totalInterest
                                      ? `The Avalanche method saves you ${formatCurrency(results.snowball.totals.totalInterest - results.avalanche.totals.totalInterest)} more in interest vs Snowball, making it the most cost-effective approach.`
                                      : `The Snowball method provides psychological wins by paying off debts faster, which can help you stay motivated despite paying ${formatCurrency(results.avalanche.totals.totalInterest - results.snowball.totals.totalInterest)} more in interest.`
                                    }
                                  </Text>
                                </View>

                                {/* Detailed Timeline */}
                                {debtStrategy !== 'current' && (
                                  <View style={styles.timelineSection}>
                                    <Text style={styles.timelineTitle}>
                                      📅 {debtStrategy === 'snowball' ? 'Snowball' : 'Avalanche'} Payoff Timeline
                                    </Text>
                                    <View style={styles.timelineList}>
                                      {results[debtStrategy as keyof typeof results].debts.map((debt: any, index: number) => (
                                        <View key={debt.id} style={styles.timelineItem}>
                                          <View style={styles.timelineStep}>
                                            <Text style={styles.timelineStepNumber}>{index + 1}</Text>
                                          </View>
                                          <View style={styles.timelineContent}>
                                            <Text style={styles.timelineDebtName}>{debt.name}</Text>
                                            <Text style={styles.timelineDetails}>
                                              {formatCurrency(debt.payment)}/month • Paid off in {formatMonths(debt.months)}
                                            </Text>
                                            <Text style={styles.timelineInterest}>
                                              {formatCurrency(debt.totalInterest)} total interest
                                            </Text>
                                          </View>
                                        </View>
                                      ))}
                                    </View>
                                  </View>
                                )}
                              </>
                            );
                          })()}
                        </View>
                      </>
                    )}
                  </>
                )}
              </ScrollView>
            </>
          )}
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
    fontFamily: 'Inter-Bold',
    color: '#F9FAFB', // Light text
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF', // Lighter grey
  },
  content: {
    flex: 1,
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
    color: '#F9FAFB', // Light text
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#34D399', // Bright green
    marginLeft: 4,
  },
  goalsList: {
    marginBottom: 16,
  },
  goalCard: {
    backgroundColor: '#1F2937', // Darker card
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  goalLeft: {
    flex: 1,
  },
  goalName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#F9FAFB', // Light text
    marginBottom: 8,
  },
  goalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  goalMetaText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF', // Lighter grey
    marginRight: 12,
  },
  goalRight: {
    alignItems: 'flex-end',
  },
  goalProgress: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#34D399', // Bright green
    marginBottom: 4,
  },
  goalAmount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF', // Lighter grey
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34D399', // Bright green
    borderRadius: 4,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contributionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contributionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#34D399', // Bright green
    marginLeft: 4,
  },
  remainingText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF', // Lighter grey
  },
  debtsList: {
    marginBottom: 16,
  },
  debtCard: {
    backgroundColor: '#1F2937', // Darker card
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  debtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  debtName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#F9FAFB', // Light text
  },
  debtBalance: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FCA5A5', // Light red
  },
  debtDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  debtDetail: {
    alignItems: 'center',
  },
  debtDetailLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF', // Lighter grey
    marginBottom: 4,
  },
  debtDetailValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#F9FAFB', // Light text
  },
  calculateButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  calculateButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#60A5FA', // Light blue
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#111827', // Dark modal
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
    fontFamily: 'Inter-Bold',
    color: '#F9FAFB', // Light text
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#F9FAFB', // Light text
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#1F2937', // Darker input
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#F9FAFB', // Light text
    borderWidth: 1,
    borderColor: '#374151',
  },
  createButton: {
    backgroundColor: '#34D399', // Bright green
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827', // Dark text on button
  },
  debtSummary: {
    backgroundColor: '#1F2937', // Darker card
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF', // Lighter grey
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#F9FAFB', // Light text
  },
  calculatorSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 16,
  },
  calculatorTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#F9FAFB', // Light text
    marginBottom: 16,
  },
  calculatorResults: {
    marginTop: 20,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  resultLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF', // Lighter grey
  },
  resultValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#F9FAFB', // Light text
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  impactTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#F9FAFB', // Light text
    marginLeft: 8,
  },
  impactSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF', // Lighter grey
    marginBottom: 16,
  },
  impactsList: {
    marginTop: 16,
  },
  impactCard: {
    backgroundColor: '#1F2937', // Darker card
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  impactLeft: {
    flex: 1,
  },
  impactGoalName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#F9FAFB', // Light text
    marginBottom: 4,
  },
  impactSavings: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#34D399', // Bright green
  },
  impactRight: {
    alignItems: 'flex-end',
  },
  impactTimeReduction: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#10B981', // Bright green
  },
  impactTimeLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF', // Lighter grey
  },
  contributeButton: {
    backgroundColor: '#34D399', // Bright green
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  contributeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#111827', // Dark text on button
  },
  quickContributeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  quickContributeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#34D399', // Bright green
    marginLeft: 4,
  },
  goalSummary: {
    backgroundColor: '#1F2937', // Darker card
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  goalSummaryTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#F9FAFB', // Light text
    marginBottom: 8,
  },
  goalSummaryProgress: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF', // Lighter grey
    marginBottom: 8,
  },
  contributionPreview: {
    backgroundColor: '#1F2937', // Darker card
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#F9FAFB', // Light text
    marginBottom: 12,
  },
  previewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF', // Lighter grey
  },
  previewValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#F9FAFB', // Light text
  },
  strategyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  strategyButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#3B82F6',
    marginLeft: 8,
  },
  strategyInputSection: {
    marginBottom: 24,
  },
  strategyComparison: {
    gap: 20,
  },
  strategyCards: {
    gap: 16,
  },
  strategyCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#374151',
  },
  strategyCardActive: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  strategyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  strategyCardTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#F9FAFB',
    marginLeft: 8,
  },
  strategySubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginLeft: 8,
  },
  strategyMetrics: {
    gap: 4,
  },
  strategyTime: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#F9FAFB',
  },
  strategyInterest: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  strategySavings: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#10B981',
  },
  recommendationCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    marginTop: 16,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
    marginLeft: 8,
  },
  recommendationText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#E5E7EB',
    lineHeight: 20,
  },
  timelineSection: {
    marginTop: 24,
  },
  timelineTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#F9FAFB',
    marginBottom: 16,
  },
  timelineList: {
    gap: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  timelineStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineStepNumber: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  timelineContent: {
    flex: 1,
    paddingTop: 2,
  },
  timelineDebtName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  timelineDetails: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginBottom: 2,
  },
  timelineInterest: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
});