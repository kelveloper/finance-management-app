import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Calculator, TrendingUp, TrendingDown, DollarSign, Percent, Calendar, BarChart3 } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';

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

  // Cash flow projection for next 6 months
  const generateCashFlowProjection = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const monthlyIncome = 5000; // Estimated monthly income
    const baseExpenses = 2152.50; // Current - spendable = base expenses
    const scenarioImpact = result.amount || 0;

    const incomeData = months.map(() => monthlyIncome);
    const expenseData = months.map(() => baseExpenses + (result.isPositive ? 0 : scenarioImpact));
    const netCashFlow = months.map((_, index) => incomeData[index] - expenseData[index]);

    return {
      labels: months,
      datasets: [
        {
          data: incomeData,
          color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Green for income
          strokeWidth: 3,
        },
        {
          data: expenseData,
          color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // Red for expenses
          strokeWidth: 3,
        },
        {
          data: netCashFlow,
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Blue for net flow
          strokeWidth: 3,
        }
      ],
      legend: ['Income', 'Expenses', 'Net Cash Flow']
    };
  };

  const cashFlowData = generateCashFlowProjection();
  const screenWidth = Dimensions.get('window').width;

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

        {/* Cash Flow Projection */}
        <View style={styles.section}>
          <View style={styles.chartHeader}>
            <BarChart3 size={24} color="#34D399" />
            <Text style={styles.sectionTitle}>6-Month Cash Flow Projection</Text>
          </View>
          
          <View style={styles.chartCard}>
            <Text style={styles.chartDescription}>
              {result.amount > 0 
                ? `Including your scenario, here's how your finances would look over the next 6 months:`
                : `See how your current scenario affects your projected cash flow:`
              }
            </Text>
            
            <View style={styles.chartContainer}>
              <LineChart
                data={cashFlowData}
                width={screenWidth - 80}
                height={220}
                yAxisLabel="$"
                yAxisSuffix=""
                yAxisInterval={1}
                chartConfig={{
                  backgroundColor: '#1F2937',
                  backgroundGradientFrom: '#1F2937',
                  backgroundGradientTo: '#111827',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '4',
                    strokeWidth: '2',
                  },
                  propsForBackgroundLines: {
                    strokeDasharray: '',
                    stroke: 'rgba(55, 65, 81, 0.3)',
                  },
                }}
                bezier
                style={styles.chart}
              />
            </View>

            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.legendText}>Monthly Income</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                <Text style={styles.legendText}>Monthly Expenses</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
                <Text style={styles.legendText}>Net Cash Flow</Text>
              </View>
            </View>

            <View style={styles.projectionNote}>
              <Text style={styles.projectionNoteText}>
                💡 This projection is based on your current spending patterns and includes the impact of your selected scenario.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  currentStateCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.2)',
  },
  currentStateTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#34D399', // Bright green
    marginBottom: 8,
  },
  currentStateAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F9FAFB', // Light text
    marginBottom: 4,
  },
  currentStateSubtitle: {
    fontSize: 12,
    color: '#9CA3AF', // Lighter grey
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB', // Light text
    marginBottom: 16,
  },
  scenarioGrid: {
    gap: 12,
  },
  scenarioCard: {
    backgroundColor: '#1F2937', // Dark card
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#374151', // Dark border
  },
  scenarioCardSelected: {
    borderColor: '#34D399', // Bright green border
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
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
    fontWeight: '600',
    color: '#F9FAFB', // Light text
    marginBottom: 4,
  },
  scenarioDescription: {
    fontSize: 14,
    color: '#9CA3AF', // Lighter grey
    lineHeight: 20,
  },
  inputCard: {
    backgroundColor: '#1F2937', // Dark card
    borderRadius: 12,
    padding: 20,
  },
  inputCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB', // Light text
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F9FAFB', // Light text
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827', // Darker input background
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 8,
    fontSize: 16,
    color: '#F9FAFB', // Light text
  },
  textInputFull: {
    backgroundColor: '#111827', // Darker input background
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#F9FAFB', // Light text
    borderWidth: 1,
    borderColor: '#374151',
  },
  taxNote: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  taxNoteText: {
    fontSize: 12,
    color: '#60A5FA', // Light blue
  },
  resultCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
  },
  positiveResult: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(52, 211, 153, 0.3)',
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
    fontWeight: '600',
    color: '#F9FAFB', // Light text
  },
  resultAmount: {
    fontSize: 20,
    fontWeight: 'bold',
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
    color: '#9CA3AF', // Lighter grey
    marginBottom: 4,
  },
  comparisonValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F9FAFB', // Light text
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
    color: '#E5E7EB', // Off-white
    textAlign: 'center',
    lineHeight: 20,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  chartCard: {
    backgroundColor: '#1F2937', // Dark card
    borderRadius: 16,
    padding: 20,
  },
  chartDescription: {
    fontSize: 14,
    color: '#9CA3AF', // Lighter grey
    marginBottom: 16,
    lineHeight: 20,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#9CA3AF', // Lighter grey
  },
  projectionNote: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
    padding: 12,
  },
  projectionNoteText: {
    fontSize: 12,
    color: '#60A5FA', // Light blue
    textAlign: 'center',
    lineHeight: 16,
  },
});