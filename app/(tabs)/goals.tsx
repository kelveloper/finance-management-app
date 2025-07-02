import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Target, Plus, Calendar, DollarSign, TrendingUp, X } from 'lucide-react-native';

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
  const [extraPayment, setExtraPayment] = useState('');

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
                <Text style={styles.modalTitle}>{selectedDebt.name} Calculator</Text>
                <TouchableOpacity
                  onPress={() => setShowDebtCalculator(false)}
                  style={styles.closeButton}
                >
                  <X size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent}>
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
                    )}
                  </View>
                </View>
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
    backgroundColor: '#0F172A',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
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
    color: '#FFFFFF',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#10B981',
    marginLeft: 4,
  },
  goalsList: {
    marginBottom: 16,
  },
  goalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
    color: '#FFFFFF',
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
    color: '#94A3B8',
    marginRight: 12,
  },
  goalRight: {
    alignItems: 'flex-end',
  },
  goalProgress: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#10B981',
    marginBottom: 4,
  },
  goalAmount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
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
    color: '#10B981',
    marginLeft: 4,
  },
  remainingText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
  },
  debtsList: {
    marginBottom: 16,
  },
  debtCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
    color: '#FFFFFF',
  },
  debtBalance: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#EF4444',
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
    color: '#94A3B8',
    marginBottom: 4,
  },
  debtDetailValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
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
    color: '#3B82F6',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
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
    color: '#FFFFFF',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  createButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  debtSummary: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
    color: '#94A3B8',
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  calculatorSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 16,
  },
  calculatorTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
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
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  resultLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
  },
  resultValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});