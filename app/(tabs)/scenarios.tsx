import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Calculator, TrendingUp, TrendingDown, DollarSign, Percent, Calendar } from 'lucide-react-native';

const scenarioTypes = [
  {
    id: 'loan',
    title: 'New Loan Impact',
    description: 'See how a new loan affects your monthly budget',
    icon: Calculator,
    color: '#3B82F6'
  },
  {
    id: 'raise',
    title: 'Salary Increase',
    description: 'Calculate the impact of a raise on your finances',
    icon: TrendingUp,
    color: '#10B981'
  },
  {
    id: 'expense',
    title: 'New Monthly Expense',
    description: 'Understand how new recurring costs affect your budget',
    icon: TrendingDown,
    color: '#EF4444'
  }
];

export default function ScenariosScreen() {
  const [selectedScenario, setSelectedScenario] = useState('loan');
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [loanTerm, setLoanTerm] = useState('');
  const [raiseAmount, setRaiseAmount] = useState('');
  const [newExpense, setNewExpense] = useState('');
  const [expenseName, setExpenseName] = useState('');

  const currentSpendableMoney = 2847.50;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const calculateLoanPayment = () => {
    const principal = parseFloat(loanAmount);
    const rate = parseFloat(interestRate) / 100 / 12;
    const term = parseFloat(loanTerm) * 12;

    if (!principal || !rate || !term) return 0;

    const monthlyPayment = (principal * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
    return monthlyPayment;
  };

  const calculateRaiseImpact = () => {
    const grossRaise = parseFloat(raiseAmount);
    if (!grossRaise) return 0;
    
    // Assuming ~30% tax rate
    const netRaise = grossRaise * 0.7;
    return netRaise / 12; // Monthly impact
  };

  const getScenarioResult = () => {
    switch (selectedScenario) {
      case 'loan':
        const monthlyPayment = calculateLoanPayment();
        return {
          title: 'Monthly Payment Impact',
          amount: monthlyPayment,
          newSpendable: currentSpendableMoney - monthlyPayment,
          isPositive: false
        };
      case 'raise':
        const monthlyIncrease = calculateRaiseImpact();
        return {
          title: 'Monthly Income Increase',
          amount: monthlyIncrease,
          newSpendable: currentSpendableMoney + monthlyIncrease,
          isPositive: true
        };
      case 'expense':
        const expenseAmount = parseFloat(newExpense);
        return {
          title: 'Monthly Expense Impact',
          amount: expenseAmount || 0,
          newSpendable: currentSpendableMoney - (expenseAmount || 0),
          isPositive: false
        };
      default:
        return { title: '', amount: 0, newSpendable: currentSpendableMoney, isPositive: true };
    }
  };

  const result = getScenarioResult();

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#0F172A', '#1E293B']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>What-If Scenarios</Text>
        <Text style={styles.headerSubtitle}>Plan your financial decisions</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Financial State */}
        <View style={styles.currentStateCard}>
          <Text style={styles.currentStateTitle}>Current Monthly Spendable</Text>
          <Text style={styles.currentStateAmount}>{formatCurrency(currentSpendableMoney)}</Text>
          <Text style={styles.currentStateSubtitle}>Available after bills and savings</Text>
        </View>

        {/* Scenario Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose a Scenario</Text>
          <View style={styles.scenarioGrid}>
            {scenarioTypes.map((scenario) => {
              const IconComponent = scenario.icon;
              return (
                <TouchableOpacity
                  key={scenario.id}
                  style={[
                    styles.scenarioCard,
                    selectedScenario === scenario.id && styles.scenarioCardSelected
                  ]}
                  onPress={() => setSelectedScenario(scenario.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.scenarioIcon, { backgroundColor: scenario.color + '20' }]}>
                    <IconComponent size={24} color={scenario.color} />
                  </View>
                  <Text style={styles.scenarioTitle}>{scenario.title}</Text>
                  <Text style={styles.scenarioDescription}>{scenario.description}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Input Forms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scenario Details</Text>
          
          {selectedScenario === 'loan' && (
            <View style={styles.inputCard}>
              <Text style={styles.inputCardTitle}>New Car Loan Calculator</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Loan Amount</Text>
                <View style={styles.inputContainer}>
                  <DollarSign size={16} color="#94A3B8" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="25,000"
                    placeholderTextColor="#64748B"
                    keyboardType="numeric"
                    value={loanAmount}
                    onChangeText={setLoanAmount}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Interest Rate (Annual)</Text>
                <View style={styles.inputContainer}>
                  <Percent size={16} color="#94A3B8" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="5.5"
                    placeholderTextColor="#64748B"
                    keyboardType="numeric"
                    value={interestRate}
                    onChangeText={setInterestRate}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Loan Term (Years)</Text>
                <View style={styles.inputContainer}>
                  <Calendar size={16} color="#94A3B8" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="5"
                    placeholderTextColor="#64748B"
                    keyboardType="numeric"
                    value={loanTerm}
                    onChangeText={setLoanTerm}
                  />
                </View>
              </View>
            </View>
          )}

          {selectedScenario === 'raise' && (
            <View style={styles.inputCard}>
              <Text style={styles.inputCardTitle}>Salary Increase Calculator</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Annual Raise Amount</Text>
                <View style={styles.inputContainer}>
                  <DollarSign size={16} color="#94A3B8" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="5,000"
                    placeholderTextColor="#64748B"
                    keyboardType="numeric"
                    value={raiseAmount}
                    onChangeText={setRaiseAmount}
                  />
                </View>
              </View>

              <View style={styles.taxNote}>
                <Text style={styles.taxNoteText}>
                  * Calculation assumes ~30% effective tax rate
                </Text>
              </View>
            </View>
          )}

          {selectedScenario === 'expense' && (
            <View style={styles.inputCard}>
              <Text style={styles.inputCardTitle}>New Monthly Expense</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Expense Name</Text>
                <TextInput
                  style={styles.textInputFull}
                  placeholder="Gym membership, Streaming service, etc."
                  placeholderTextColor="#64748B"
                  value={expenseName}
                  onChangeText={setExpenseName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Monthly Cost</Text>
                <View style={styles.inputContainer}>
                  <DollarSign size={16} color="#94A3B8" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="50"
                    placeholderTextColor="#64748B"
                    keyboardType="numeric"
                    value={newExpense}
                    onChangeText={setNewExpense}
                  />
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Results */}
        {result.amount > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Impact Analysis</Text>
            
            <View style={[styles.resultCard, result.isPositive ? styles.positiveResult : styles.negativeResult]}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>{result.title}</Text>
                <Text style={[
                  styles.resultAmount,
                  { color: result.isPositive ? '#10B981' : '#EF4444' }
                ]}>
                  {result.isPositive ? '+' : '-'}{formatCurrency(Math.abs(result.amount))}
                </Text>
              </View>

              <View style={styles.spendableComparison}>
                <View style={styles.comparisonItem}>
                  <Text style={styles.comparisonLabel}>Current Spendable</Text>
                  <Text style={styles.comparisonValue}>{formatCurrency(currentSpendableMoney)}</Text>
                </View>
                
                <View style={styles.comparisonArrow}>
                  {result.isPositive ? (
                    <TrendingUp size={20} color="#10B981" />
                  ) : (
                    <TrendingDown size={20} color="#EF4444" />
                  )}
                </View>

                <View style={styles.comparisonItem}>
                  <Text style={styles.comparisonLabel}>New Spendable</Text>
                  <Text style={[
                    styles.comparisonValue,
                    { 
                      color: result.newSpendable > currentSpendableMoney ? '#10B981' : 
                             result.newSpendable < currentSpendableMoney ? '#EF4444' : '#FFFFFF'
                    }
                  ]}>
                    {formatCurrency(result.newSpendable)}
                  </Text>
                </View>
              </View>

              <View style={styles.impactSummary}>
                <Text style={styles.impactSummaryText}>
                  {result.isPositive 
                    ? `This would increase your monthly spending power by ${formatCurrency(result.amount)}.`
                    : result.newSpendable < 0 
                      ? `⚠️ This would put you over budget by ${formatCurrency(Math.abs(result.newSpendable))}.`
                      : `This would reduce your monthly spending power by ${formatCurrency(result.amount)}.`
                  }
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
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
  currentStateCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  currentStateTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#10B981',
    marginBottom: 8,
  },
  currentStateAmount: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  currentStateSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  scenarioGrid: {
    gap: 12,
  },
  scenarioCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  scenarioCardSelected: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  scenarioIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  scenarioTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  scenarioDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    lineHeight: 20,
  },
  inputCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
  },
  inputCardTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
  },
  textInputFull: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  taxNote: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  taxNoteText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#3B82F6',
  },
  resultCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
  },
  positiveResult: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  negativeResult: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  resultAmount: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  spendableComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  comparisonItem: {
    alignItems: 'center',
    flex: 1,
  },
  comparisonLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    marginBottom: 4,
  },
  comparisonValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  comparisonArrow: {
    marginHorizontal: 16,
  },
  impactSummary: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
  },
  impactSummaryText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 20,
  },
});