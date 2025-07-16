import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Target, Plus, Calendar, DollarSign, Trophy, X, ChevronRight } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { Transaction, SmartGoalSuggestion } from '../../common/types';
import { useSession } from '../../hooks/useSession';
import { getApiUrl, getDevUserId } from '../../utils/environment';
import moment from 'moment';

// Mock Goal interface for now
interface Goal {
  goal_id: string;
  name: string;
  target_amount: number;
  current_amount_saved: number;
  target_date: string;
  status: 'ACTIVE' | 'COMPLETED';
  priority: 'high' | 'medium' | 'low';
  monthly_contribution: number;
}

export default function GoalNavigatorScreen() {
  const { userId } = useSession();
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');

  // Mock goals data
  const [goals] = useState<Goal[]>([
    {
      goal_id: '1',
      name: 'Emergency Fund',
      target_amount: 10000,
      current_amount_saved: 6500,
      target_date: '2025-12-31',
      status: 'ACTIVE',
      priority: 'high',
      monthly_contribution: 250
    },
    {
      goal_id: '2',
      name: 'Europe Trip',
      target_amount: 5000,
      current_amount_saved: 1200,
      target_date: '2025-07-15',
      status: 'ACTIVE',
      priority: 'medium',
      monthly_contribution: 300
    }
  ]);

  // Fetch smart goal suggestions
  const { data: transactionData } = useQuery<{
    transactions: Transaction[];
    insights: { 
      smartGoals: SmartGoalSuggestion[]
    };
  }>({
    queryKey: ['financialData'],
    queryFn: async () => {
      const response = await fetch(`${getApiUrl()}/api/data`, {
        headers: {
          'x-user-id': userId || getDevUserId(),
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch financial data');
      }
      return response.json();
    }
  });

  const smartGoals = transactionData?.insights?.smartGoals ?? [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return moment(dateString).format('MMM D, YYYY');
  };

  const getProgressPercentage = (goal: Goal) => {
    return Math.round((goal.current_amount_saved / goal.target_amount) * 100);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#64748B';
    }
  };

  const activeGoal = goals.find(g => g.status === 'ACTIVE');

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#0F172A', '#1E293B']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Goal Navigator</Text>
        <Text style={styles.headerSubtitle}>AI-powered financial goal achievement</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Active Goal Dashboard */}
        {activeGoal && (
          <View style={styles.section}>
            <View style={styles.activeGoalCard}>
              <View style={styles.goalHeader}>
                <View style={styles.goalLeft}>
                  <Text style={styles.activeGoalName}>{activeGoal.name}</Text>
                  <View style={styles.goalMeta}>
                    <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(activeGoal.priority) }]} />
                    <Text style={styles.goalMetaText}>{activeGoal.priority} priority</Text>
                    <Calendar size={12} color="#94A3B8" />
                    <Text style={styles.goalMetaText}>{formatDate(activeGoal.target_date)}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressAmount}>
                    {formatCurrency(activeGoal.current_amount_saved)} / {formatCurrency(activeGoal.target_amount)}
                  </Text>
                  <Text style={styles.progressPercentage}>{getProgressPercentage(activeGoal)}%</Text>
                </View>
                
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <View style={[
                      styles.progressFill, 
                      { width: `${getProgressPercentage(activeGoal)}%` }
                    ]} />
                  </View>
                </View>

                <View style={styles.progressFooter}>
                  <Text style={styles.remainingAmount}>
                    {formatCurrency(activeGoal.target_amount - activeGoal.current_amount_saved)} remaining
                  </Text>
                  <Text style={styles.monthlyContribution}>
                    {formatCurrency(activeGoal.monthly_contribution)}/month
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Weekly Challenge */}
        <View style={styles.section}>
          <View style={styles.challengeCard}>
            <View style={styles.challengeHeader}>
              <View style={styles.challengeLeft}>
                <Trophy size={20} color="#F59E0B" />
                <Text style={styles.challengeTitle}>This Week's Challenge</Text>
              </View>
              <View style={[styles.challengeStatus, { backgroundColor: '#F59E0B20' }]}>
                <Text style={[styles.challengeStatusText, { color: '#F59E0B' }]}>ACTIVE</Text>
              </View>
            </View>

            <Text style={styles.challengeDescription}>
              Spend less than $50 on food & drink this week to accelerate your Emergency Fund goal
            </Text>

            <View style={styles.challengeProgress}>
              <View style={styles.challengeProgressHeader}>
                <Text style={styles.challengeSpent}>Spent: $23.50</Text>
                <Text style={styles.challengeLimit}>Limit: $50.00</Text>
              </View>
              
              <View style={styles.challengeProgressBar}>
                <View style={[
                  styles.challengeProgressFill,
                  { width: '47%', backgroundColor: '#10B981' }
                ]} />
              </View>

              <Text style={styles.challengeRemaining}>$26.50 remaining</Text>
            </View>
          </View>
        </View>

        {/* Smart Goal Suggestions */}
        {smartGoals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Smart Goal Suggestions</Text>
            <Text style={styles.sectionSubtitle}>
              Based on your spending patterns
            </Text>
            
            <View style={styles.smartGoalsList}>
              {smartGoals.map((goal) => (
                <View key={goal.id} style={styles.smartGoalCard}>
                  <Text style={styles.smartGoalTitle}>{goal.title}</Text>
                  <Text style={styles.smartGoalDescription}>{goal.description}</Text>
                  <View style={styles.smartGoalDetails}>
                    <Text style={styles.smartGoalAmount}>
                      {formatCurrency(goal.suggested_amount)}
                    </Text>
                    <Text style={styles.smartGoalTimeframe}>
                      {goal.timeframe_months} months
                    </Text>
                  </View>
                  <Text style={styles.smartGoalReasoning}>{goal.reasoning}</Text>
                  <TouchableOpacity style={styles.createGoalButton}>
                    <Plus size={16} color="#10B981" />
                    <Text style={styles.createGoalButtonText}>Create Goal</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* All Goals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Goals</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowNewGoalModal(true)}
            >
              <Plus size={16} color="#10B981" />
              <Text style={styles.addButtonText}>New Goal</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.goalsList}>
            {goals.map((goal) => (
              <View key={goal.goal_id} style={styles.goalCard}>
                <View style={styles.goalCardHeader}>
                  <View style={styles.goalCardLeft}>
                    <Text style={styles.goalCardName}>{goal.name}</Text>
                    <View style={styles.goalCardMeta}>
                      <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(goal.priority) }]} />
                      <Text style={styles.goalCardMetaText}>{goal.priority}</Text>
                      <Text style={styles.goalCardMetaText}>•</Text>
                      <Text style={styles.goalCardMetaText}>{formatDate(goal.target_date)}</Text>
                    </View>
                  </View>
                  <View style={styles.goalCardRight}>
                    <Text style={styles.goalCardProgress}>{getProgressPercentage(goal)}%</Text>
                    <Text style={styles.goalCardAmount}>
                      {formatCurrency(goal.current_amount_saved)} / {formatCurrency(goal.target_amount)}
                    </Text>
                  </View>
                </View>

                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <View style={[
                      styles.progressFill, 
                      { width: `${getProgressPercentage(goal)}%` }
                    ]} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Simple New Goal Modal */}
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
                value={goalName}
                onChangeText={setGoalName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Target Amount</Text>
              <TextInput
                style={styles.textInput}
                placeholder="10000"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                value={targetAmount}
                onChangeText={setTargetAmount}
              />
            </View>

            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => {
                Alert.alert('Success', 'Goal creation feature coming soon!');
                setShowNewGoalModal(false);
              }}
            >
              <Text style={styles.createButtonText}>Create Goal</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}const
 styles = StyleSheet.create({
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
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },

  // Active Goal Dashboard
  activeGoalCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  goalLeft: {
    flex: 1,
  },
  activeGoalName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F9FAFB',
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
    color: '#9CA3AF',
    marginRight: 8,
  },
  progressSection: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  remainingAmount: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  monthlyContribution: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10B981',
  },

  // Weekly Challenge
  challengeCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
    marginLeft: 8,
  },
  challengeStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  challengeStatusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  challengeDescription: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 16,
  },
  challengeProgress: {
    marginBottom: 12,
  },
  challengeProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  challengeSpent: {
    fontSize: 14,
    color: '#F9FAFB',
  },
  challengeLimit: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  challengeProgressBar: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  challengeProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  challengeRemaining: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },

  // Smart Goals
  smartGoalsList: {
    gap: 12,
  },
  smartGoalCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  smartGoalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 8,
  },
  smartGoalDescription: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 12,
  },
  smartGoalDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  smartGoalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  smartGoalTimeframe: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  smartGoalReasoning: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  createGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#10B981' + '20',
  },
  createGoalButtonText: {
    fontSize: 14,
    color: '#10B981',
    marginLeft: 4,
  },

  // Goals List
  goalsList: {
    gap: 12,
  },
  goalCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  goalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  goalCardLeft: {
    flex: 1,
  },
  goalCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  goalCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalCardMetaText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginRight: 6,
  },
  goalCardRight: {
    alignItems: 'flex-end',
  },
  goalCardProgress: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  goalCardAmount: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  // Modals
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

  // Form
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F9FAFB',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#F9FAFB',
  },
  createButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});