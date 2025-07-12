import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Brain, Target, TrendingUp, AlertCircle } from 'lucide-react-native';
import { useSession } from '@/hooks/useSession';
import { getApiUrl, envLog } from '@/utils/environment';

const API_URL = getApiUrl();

// Question data structure
interface Question {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  allowMultiple?: boolean;
  options: {
    id: string;
    label: string;
    description: string;
    emoji: string;
  }[];
}

const questions: Question[] = [
  {
    id: 'financial_personality',
    title: 'What\'s your approach to money?',
    subtitle: 'This helps us understand your spending style',
    icon: Brain,
    options: [
      { id: 'planner', label: 'Planner', description: 'I budget carefully and track everything', emoji: '📊' },
      { id: 'goal_focused', label: 'Goal-focused', description: 'I save for specific things I want', emoji: '🎯' },
      { id: 'go_with_flow', label: 'Go-with-flow', description: 'I spend what feels right in the moment', emoji: '🌊' },
      { id: 'stressed', label: 'Money-anxious', description: 'Money makes me anxious, I avoid thinking about it', emoji: '😰' }
    ]
  },
  {
    id: 'primary_goal',
    title: 'What\'s your main financial goal?',
    subtitle: 'We\'ll focus our insights around this priority',
    icon: Target,
    options: [
      { id: 'emergency_fund', label: 'Emergency Fund', description: 'Build a safety net for unexpected expenses', emoji: '💰' },
      { id: 'major_purchase', label: 'Major Purchase', description: 'Save for house, car, or big expense', emoji: '🏠' },
      { id: 'wealth_growth', label: 'Grow Wealth', description: 'Invest and build long-term wealth', emoji: '📈' },
      { id: 'debt_payoff', label: 'Pay Off Debt', description: 'Eliminate credit cards, loans, etc.', emoji: '💳' },
      { id: 'understanding', label: 'Understand Spending', description: 'Just want to see where my money goes', emoji: '🔍' }
    ]
  },
  {
    id: 'coaching_style',
    title: 'How should your AI coach help you?',
    subtitle: 'Select all that apply - we\'ll adjust our communication style to match',
    icon: TrendingUp,
    allowMultiple: true,
    options: [
      { id: 'proactive_alerts', label: 'Proactive Alerts', description: 'Alert me about overspending immediately', emoji: '🚨' },
      { id: 'show_patterns', label: 'Show Patterns', description: 'Show me insights and let me decide', emoji: '📊' },
      { id: 'suggest_optimizations', label: 'Smart Suggestions', description: 'Suggest improvements when you see opportunities', emoji: '💡' },
      { id: 'goal_focused', label: 'Goal-Focused', description: 'Focus on helping me reach my specific goals', emoji: '🎯' }
    ]
  }
];

export default function PersonalizationScreen() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [loading, setLoading] = useState(false);
  const { accessToken, userId } = useSession();

  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const canProceed = question.allowMultiple 
    ? Array.isArray(answers[question.id]) && (answers[question.id] as string[]).length > 0
    : !!answers[question.id];

  const selectOption = (optionId: string) => {
    if (question.allowMultiple) {
      setAnswers(prev => {
        const currentSelections = Array.isArray(prev[question.id]) ? prev[question.id] as string[] : [];
        const isSelected = currentSelections.includes(optionId);
        
        if (isSelected) {
          // Remove from selection
          return {
            ...prev,
            [question.id]: currentSelections.filter(id => id !== optionId)
          };
        } else {
          // Add to selection
          return {
            ...prev,
            [question.id]: [...currentSelections, optionId]
          };
        }
      });
    } else {
      setAnswers(prev => ({
        ...prev,
        [question.id]: optionId
      }));
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!accessToken || !userId) {
      envLog('No access token or user ID found');
      return;
    }

    setLoading(true);

    try {
      envLog('Submitting personalization answers:', answers);

      const response = await fetch(`${API_URL}/api/user/personalization`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          userId,
          answers
        }),
      });

      const data = await response.json();
      envLog('Personalization response:', data);

      if (response.ok) {
        // Continue to bank linking
        router.push('/onboarding/bank-linking');
      } else {
        envLog('Error saving personalization:', data.error);
        // Continue anyway - don't block user flow
        router.push('/onboarding/bank-linking');
      }
    } catch (error) {
      envLog('Personalization error:', error);
      // Continue anyway - don't block user flow
      router.push('/onboarding/bank-linking');
    } finally {
      setLoading(false);
    }
  };

  const IconComponent = question.icon;

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${((currentQuestion + 1) / questions.length) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {currentQuestion + 1} of {questions.length}
            </Text>
          </View>

          {/* Question Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <IconComponent size={32} color="#10B981" />
            </View>
            <Text style={styles.title}>
              {question.id === 'primary_goal' ? (
                <>
                  What's your <Text style={styles.titleBold}>main</Text> financial goal?
                </>
              ) : (
                question.title
              )}
            </Text>
            <Text style={styles.subtitle}>{question.subtitle}</Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {question.options.map((option) => {
              const isSelected = question.allowMultiple 
                ? Array.isArray(answers[question.id]) && (answers[question.id] as string[]).includes(option.id)
                : answers[question.id] === option.id;
              
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.option,
                    isSelected && styles.optionSelected
                  ]}
                  onPress={() => selectOption(option.id)}
                >
                  <View style={styles.optionContent}>
                    <Text style={styles.optionEmoji}>{option.emoji}</Text>
                    <View style={styles.optionText}>
                      <Text style={[
                        styles.optionLabel,
                        isSelected && styles.optionLabelSelected
                      ]}>
                        {option.label}
                      </Text>
                      <Text style={[
                        styles.optionDescription,
                        isSelected && styles.optionDescriptionSelected
                      ]}>
                        {option.description}
                      </Text>
                    </View>
                    {question.allowMultiple && (
                      <View style={[
                        styles.checkbox,
                        isSelected && styles.checkboxSelected
                      ]}>
                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Navigation */}
          <View style={styles.navigation}>
            {currentQuestion > 0 && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[
                styles.nextButton,
                !canProceed && styles.nextButtonDisabled,
                currentQuestion === 0 && styles.nextButtonFull
              ]}
              onPress={handleNext}
              disabled={!canProceed || loading}
            >
              <Text style={[
                styles.nextButtonText,
                !canProceed && styles.nextButtonTextDisabled
              ]}>
                {loading ? 'Saving...' : isLastQuestion ? 'Get Started' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  titleBold: {
    fontWeight: '900',
    color: '#10B981',
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
  },
  optionsContainer: {
    marginBottom: 32,
  },
  option: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  optionLabelSelected: {
    color: '#10B981',
  },
  optionDescription: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  optionDescriptionSelected: {
    color: '#D1FAE5',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#64748B',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  backButtonText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    flex: 1,
    marginLeft: 16,
    alignItems: 'center',
  },
  nextButtonFull: {
    marginLeft: 0,
  },
  nextButtonDisabled: {
    backgroundColor: '#374151',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonTextDisabled: {
    color: '#6B7280',
  },
}); 