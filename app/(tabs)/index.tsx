import { StyleSheet, View, Text, FlatList, ActivityIndicator, TouchableOpacity, Platform, Alert } from 'react-native';
import React from 'react';
import moment from 'moment';
import { useQuery } from '@tanstack/react-query';
import { Transaction, Insight, RecurringTransaction, PersonalizedInsight, SmartGoalSuggestion } from '../../../common/types';
import { useSession } from '../../hooks/useSession';

const API_HOST = 'http://127.0.0.1:8000'; // Assuming backend runs locally on port 8000

// Function to get time-based greeting in Eastern Time
const getTimeBasedGreeting = (firstName: string | null): string => {
  if (!firstName) return 'Good morning!';
  
  // Get current time in Eastern Time
  const easternTime = new Date().toLocaleString("en-US", {timeZone: "America/New_York"});
  const currentHour = new Date(easternTime).getHours();
  
  let greeting = '';
  if (currentHour >= 5 && currentHour < 12) {
    greeting = 'Good morning';
  } else if (currentHour >= 12 && currentHour < 17) {
    greeting = 'Good afternoon';
  } else if (currentHour >= 17 && currentHour < 21) {
    greeting = 'Good evening';
  } else {
    greeting = 'Good night';
  }
  
  return `${greeting}, ${firstName}!`;
};

export default function HomeScreen() {
  const { userId, firstName } = useSession();
  const { 
    data, 
    isLoading, 
    error 
  } = useQuery<{
    transactions: Transaction[];
    insights: { 
      anomalies: Insight[], 
      recurring: RecurringTransaction[],
      personalized: PersonalizedInsight[],
      smartGoals: SmartGoalSuggestion[]
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
  const insights = data?.insights?.anomalies ?? [];
  const recurring = data?.insights?.recurring ?? [];
  const personalizedInsights = data?.insights?.personalized ?? [];
  const smartGoals = data?.insights?.smartGoals ?? [];

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
                            // We can add a query invalidation here to refetch data if needed
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
                            // We can add a query invalidation here to refetch data if needed
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
        // Add query invalidation here to refetch and see the change
    } catch (error: any) {
        Alert.alert('Error', error.message || 'Could not update tag.');
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionName}>{item.description}</Text>
        <Text style={styles.transactionCategory}>
          {item.category || 'General'}
        </Text>
        <Text style={styles.transactionDate}>{moment(item.posted_date, 'YYYY-MM-DD').format('MM/DD/YYYY')}</Text>
        {item.tag && (
            <Text style={[styles.tag, styles[`${item.tag}Tag`]]}>
                {item.tag}
            </Text>
        )}
      </View>
      <View style={styles.transactionActions}>
         <Text style={styles.transactionAmount}>
            {item.amount < 0 ? `-$${Math.abs(item.amount).toFixed(2)}` : `$${item.amount.toFixed(2)}`}
        </Text>
        {item.balance && (
            <Text style={styles.transactionBalance}>
                Balance: ${item.balance.toFixed(2)}
            </Text>
        )}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleUpdateCategory(item)}
        >
          <Text style={styles.editButtonText}>Edit Cat</Text>
        </TouchableOpacity>
        <View style={styles.tagButtonsContainer}>
          <TouchableOpacity
            style={[styles.tagButton, styles.essentialButton]}
            onPress={() => handleUpdateTag(item.id, 'essential')}
          >
            <Text style={styles.tagButtonText}>E</Text>
          </TouchableOpacity>
           <TouchableOpacity
            style={[styles.tagButton, styles.discretionaryButton]}
            onPress={() => handleUpdateTag(item.id, 'discretionary')}
          >
            <Text style={styles.tagButtonText}>D</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

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

  return (
    <FlatList
      style={styles.container}
      data={transactions}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={() => (
        <>
          <Text style={styles.greetingText}>{getTimeBasedGreeting(firstName)}</Text>
          {insights.length > 0 && (
            <View style={styles.insightsContainer}>
              <Text style={styles.insightsTitle}>AI Insights</Text>
              {insights.map((insight) => (
                <View key={insight.category} style={styles.insightCard}>
                  <Text style={styles.insightText}>{insight.insight}</Text>
                  {insight.advice && (
                      <Text style={styles.adviceText}>{insight.advice}</Text>
                  )}
                </View>
              ))}
            </View>
          )}

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
              {personalizedInsights.map((insight) => (
                <View key={insight.id} style={[styles.insightCard, styles.personalizedCard]}>
                  <View style={styles.personalizedHeader}>
                    <Text style={styles.personalizedTitle}>{insight.title}</Text>
                    <Text style={styles.confidenceScore}>
                      {Math.round(insight.confidence_score * 100)}% confident
                    </Text>
                  </View>
                  <Text style={styles.personalizedMessage}>{insight.message}</Text>
                  {insight.actionable_advice.length > 0 && (
                    <View style={styles.adviceContainer}>
                      <Text style={styles.adviceTitle}>💡 Actions you can take:</Text>
                      {insight.actionable_advice.map((advice, index) => (
                        <Text key={index} style={styles.adviceItem}>• {advice}</Text>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {smartGoals.length > 0 && (
            <View style={styles.smartGoalsContainer}>
              <Text style={styles.insightsTitle}>🎯 Smart Goal Suggestions</Text>
              {smartGoals.map((goal) => (
                <View key={goal.id} style={[styles.insightCard, styles.smartGoalCard]}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <Text style={styles.goalDescription}>{goal.description}</Text>
                  <View style={styles.goalDetails}>
                    <Text style={styles.goalAmount}>${goal.suggested_amount.toFixed(2)}</Text>
                    <Text style={styles.goalTimeframe}>{goal.timeframe_months} months</Text>
                  </View>
                  <Text style={styles.goalReasoning}>{goal.reasoning}</Text>
                </View>
              ))}
            </View>
          )}
          <Text style={styles.title}>Transactions</Text>
        </>
      )}
      renderItem={renderTransaction}
      ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 20}}>No transactions found.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827', // Dark background
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#111827', // Dark background
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 16,
    textAlign: 'center',
    color: '#F9FAFB', // Light text
  },
  errorText: {
    color: '#FCA5A5', // Light red for errors
    fontSize: 16,
  },
  transactionItem: {
    backgroundColor: '#1F2937', // Darker card background
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  transactionName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#F9FAFB', // Light text
  },
  transactionCategory: {
    fontSize: 14,
    color: '#9CA3AF', // Lighter grey
    fontStyle: 'italic',
    marginTop: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: '#9CA3AF', // Lighter grey
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34D399', // Green for positive amounts
  },
  transactionBalance: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  editButton: {
    marginTop: 8,
    backgroundColor: '#374151', // Darker button
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 5,
    marginBottom: 8,
  },
  editButtonText: {
    fontSize: 12,
    color: '#E5E7EB', // Light text
  },
  tagButtonsContainer: {
    flexDirection: 'row',
  },
  tagButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 5,
    marginLeft: 4,
  },
  tagButtonText: {
      fontSize: 12,
      color: 'white',
      fontWeight: 'bold',
  },
  essentialButton: {
      backgroundColor: '#3B82F6', // Blue
  },
  discretionaryButton: {
      backgroundColor: '#EF4444', // Red
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 'bold',
    overflow: 'hidden',
    marginTop: 4,
    alignSelf: 'flex-start',
    textTransform: 'uppercase',
  },
  essentialTag: {
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      color: '#60A5FA',
  },
  discretionaryTag: {
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
      color: '#F87171',
  },
  insightsContainer: {
    marginBottom: 20,
    marginTop: 20,
  },
  insightsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#F9FAFB', // Light text
  },
  insightCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)', // Translucent green
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  insightText: {
    fontSize: 15,
    color: '#A7F3D0', // Light green text
    marginBottom: 8,
  },
  recurringContainer: {
      marginBottom: 20,
  },
  recurringItem: {
      backgroundColor: '#1F2937', // Darker card
      padding: 12,
      borderRadius: 8,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: '#374151',
  },
  recurringName: {
      fontSize: 15,
      fontWeight: '500',
      color: '#F9FAFB', // Light text
  },
  recurringAmount: {
      fontSize: 14,
      color: '#9CA3AF', // Lighter grey
      marginTop: 4,
  },
  adviceText: {
      fontSize: 14,
      color: '#6EE7B7', // Brighter green text
      fontStyle: 'italic',
      marginTop: 8,
      borderTopWidth: 1,
      borderTopColor: 'rgba(16, 185, 129, 0.3)',
      paddingTop: 8,
  },
  // Personalized AI Insights styles
  personalizedContainer: {
    marginBottom: 20,
  },
  personalizedCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)', // Purple tint
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
    color: '#C4B5FD', // Light purple
    flex: 1,
  },
  confidenceScore: {
    fontSize: 12,
    color: '#A78BFA',
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
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
  // Smart Goals styles
  smartGoalsContainer: {
    marginBottom: 20,
  },
  smartGoalCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)', // Amber tint
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FCD34D',
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
    color: '#FEF3C7',
    marginBottom: 8,
  },
  goalDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderRadius: 6,
  },
  goalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  goalTimeframe: {
    fontSize: 14,
    color: '#FCD34D',
  },
  goalReasoning: {
    fontSize: 13,
    color: '#FEF3C7',
    fontStyle: 'italic',
  },
  greetingText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#34D399', // Bright green color to stand out
    textAlign: 'left',
    marginTop: 20,
    marginBottom: 20,
    paddingLeft: 8,
  },
});