import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { Save, Plus, Minus, DollarSign, Calendar, CreditCard as Edit3, Trash2, Clock, Lightbulb, Star } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BudgetAdjustment {
  id: string;
  category: string;
  amount: number;
  duration: string;
  reason: string;
  isIncrease: boolean;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

interface NoteTemplate {
  id: string;
  title: string;
  content: string;
}

export default function ScratchpadScreen() {
  const [notes, setNotes] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [budgetAdjustments, setBudgetAdjustments] = useState<BudgetAdjustment[]>([]);

  const [showNewAdjustment, setShowNewAdjustment] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [newReason, setNewReason] = useState('');
  const [isIncrease, setIsIncrease] = useState(false);

  const noteTemplates: NoteTemplate[] = [
    {
      id: '1',
      title: 'Monthly Planning',
      content: 'Monthly financial planning notes:\n\n• Review expenses from last month\n• Set spending goals for this month\n• Check progress on savings goals\n• Plan for upcoming expenses\n\nPriorities:\n- [ ] \n- [ ] \n- [ ] '
    },
    {
      id: '2',
      title: 'Goal Setting',
      content: 'Financial Goals & Milestones:\n\nShort-term (1-3 months):\n• \n• \n• \n\nMedium-term (3-12 months):\n• \n• \n• \n\nLong-term (1+ years):\n• \n• \n• '
    },
    {
      id: '3',
      title: 'Expense Tracking',
      content: 'Expense Analysis:\n\nAreas to reduce spending:\n• \n• \n• \n\nAreas where spending is justified:\n• \n• \n• \n\nNext month adjustments:\n• \n• \n• '
    }
  ];

  const commonCategories = [
    'Dining Out', 'Entertainment', 'Shopping', 'Groceries', 
    'Transportation', 'Subscriptions', 'Hobbies', 'Personal Care'
  ];

  const durationSuggestions = [
    '1 week', '2 weeks', '1 month', '2 months', '3 months'
  ];

  // Load data from storage on mount
  useEffect(() => {
    loadStoredData();
  }, []);

  // Auto-save notes every 30 seconds
  useEffect(() => {
    if (notes && notes.length > 0) {
      const autoSaveTimer = setTimeout(() => {
        handleSaveNotes(true);
      }, 30000);

      return () => clearTimeout(autoSaveTimer);
    }
  }, [notes]);

  // Check for expired adjustments
  useEffect(() => {
    const checkExpiredAdjustments = () => {
      const now = new Date();
      setBudgetAdjustments(prev => 
        prev.map(adj => ({
          ...adj,
          isActive: new Date(adj.expiresAt) > now
        }))
      );
    };

    checkExpiredAdjustments();
    const interval = setInterval(checkExpiredAdjustments, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const loadStoredData = async () => {
    try {
      const storedNotes = await AsyncStorage.getItem('scratchpad_notes');
      const storedAdjustments = await AsyncStorage.getItem('budget_adjustments');
      const lastSavedTime = await AsyncStorage.getItem('notes_last_saved');

      if (storedNotes) {
        setNotes(storedNotes);
      } else {
        // Set default notes if none exist
        setNotes('Monthly financial planning notes:\n\n• Consider increasing emergency fund contribution by $100/month\n• Look into refinancing car loan for better rate\n• Research high-yield savings accounts\n• Plan for Q2 vacation budget (~$2000)\n\nGoals for next month:\n- Track dining out expenses more closely\n- Set up automatic transfer to savings\n- Review subscription services');
      }

      if (storedAdjustments) {
        const adjustments = JSON.parse(storedAdjustments);
        setBudgetAdjustments(adjustments.map((adj: any) => ({
          ...adj,
          createdAt: new Date(adj.createdAt),
          expiresAt: new Date(adj.expiresAt)
        })));
      } else {
        // Set default adjustment if none exist
        const defaultAdjustment: BudgetAdjustment = {
          id: '1',
          category: 'Dining Out',
          amount: 50,
          duration: '2 weeks',
          reason: 'Trying to save for vacation',
          isIncrease: false,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
          isActive: true
        };
        setBudgetAdjustments([defaultAdjustment]);
      }

      if (lastSavedTime) {
        setLastSaved(new Date(lastSavedTime));
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
    }
  };

  const handleSaveNotes = async (isAutoSave = false) => {
    if (!isAutoSave) setIsSaving(true);
    
    try {
      await AsyncStorage.setItem('scratchpad_notes', notes);
      const now = new Date();
      await AsyncStorage.setItem('notes_last_saved', now.toISOString());
      setLastSaved(now);
      
      if (!isAutoSave) {
        Alert.alert('Saved!', 'Your notes have been saved successfully.');
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      if (!isAutoSave) {
        Alert.alert('Error', 'Failed to save notes. Please try again.');
      }
    } finally {
      if (!isAutoSave) setIsSaving(false);
    }
  };

  const calculateExpirationDate = (duration: string): Date => {
    const now = new Date();
    const durationMap: Record<string, number> = {
      '1 week': 7,
      '2 weeks': 14,
      '1 month': 30,
      '2 months': 60,
      '3 months': 90
    };

    const days = durationMap[duration] || parseInt(duration) || 30;
    return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  };

  const handleAddAdjustment = async () => {
    if (!newCategory || !newAmount || !newDuration || !newReason) {
      Alert.alert('Missing Information', 'Please fill in all fields to create a budget adjustment.');
      return;
    }

    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive amount.');
      return;
    }

    const adjustment: BudgetAdjustment = {
      id: Date.now().toString(),
      category: newCategory,
      amount,
      duration: newDuration,
      reason: newReason,
      isIncrease,
      createdAt: new Date(),
      expiresAt: calculateExpirationDate(newDuration),
      isActive: true
    };

    const updatedAdjustments = [...budgetAdjustments, adjustment];
    setBudgetAdjustments(updatedAdjustments);
    
    try {
      await AsyncStorage.setItem('budget_adjustments', JSON.stringify(updatedAdjustments));
    } catch (error) {
      console.error('Error saving adjustments:', error);
    }
    
    // Reset form
    setNewCategory('');
    setNewAmount('');
    setNewDuration('');
    setNewReason('');
    setIsIncrease(false);
    setShowNewAdjustment(false);

    Alert.alert('Adjustment Created!', `Your ${isIncrease ? 'increase' : 'reduction'} of $${amount} for ${newCategory} has been created.`);
  };

  const handleDeleteAdjustment = async (id: string) => {
    const updatedAdjustments = budgetAdjustments.filter(adj => adj.id !== id);
    setBudgetAdjustments(updatedAdjustments);
    
    try {
      await AsyncStorage.setItem('budget_adjustments', JSON.stringify(updatedAdjustments));
    } catch (error) {
      console.error('Error saving adjustments:', error);
    }
  };

  const handleUseTemplate = (template: NoteTemplate) => {
    setNotes(template.content);
    setShowTemplates(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getActiveAdjustments = () => budgetAdjustments.filter(adj => adj.isActive);
  const getExpiredAdjustments = () => budgetAdjustments.filter(adj => !adj.isActive);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#0F172A', '#1E293B']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Scratch Pad</Text>
        <Text style={styles.headerSubtitle}>Your flexible financial planning space</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📝 Financial Notes</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.templateButton}
                onPress={() => setShowTemplates(!showTemplates)}
                activeOpacity={0.8}
              >
                <Star size={16} color="#F59E0B" />
                <Text style={styles.templateButtonText}>Templates</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                onPress={() => handleSaveNotes()}
                activeOpacity={0.8}
                disabled={isSaving}
              >
                <Save size={16} color={isSaving ? "#64748B" : "#10B981"} />
                <Text style={[styles.saveButtonText, isSaving && styles.saveButtonTextDisabled]}>
                  {isSaving ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {lastSaved && (
            <View style={styles.autoSaveInfo}>
              <Clock size={12} color="#64748B" />
              <Text style={styles.autoSaveText}>
                Last saved {formatRelativeTime(lastSaved)} • Auto-saves every 30 seconds
              </Text>
            </View>
          )}

          {/* Templates */}
          {showTemplates && (
            <View style={styles.templatesContainer}>
              <Text style={styles.templatesTitle}>Quick Start Templates</Text>
              <View style={styles.templatesList}>
                {noteTemplates.map((template) => (
                  <TouchableOpacity
                    key={template.id}
                    style={styles.templateCard}
                    onPress={() => handleUseTemplate(template)}
                  >
                    <Text style={styles.templateCardTitle}>{template.title}</Text>
                    <Text style={styles.templateCardPreview}>
                      {template.content.substring(0, 60)}...
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.notesContainer}>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              multiline
              placeholder="Write your financial thoughts, goals, and reminders here..."
              placeholderTextColor="#64748B"
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Budget Adjustments Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>⚡ Budget Adjustments</Text>
              <Text style={styles.sectionSubtitle}>
                {getActiveAdjustments().length} active • {getExpiredAdjustments().length} expired
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowNewAdjustment(!showNewAdjustment)}
              activeOpacity={0.8}
            >
              <Plus size={16} color="#3B82F6" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {/* Smart Suggestions */}
          {!showNewAdjustment && getActiveAdjustments().length === 0 && (
            <View style={styles.suggestionsContainer}>
              <View style={styles.suggestionHeader}>
                <Lightbulb size={16} color="#F59E0B" />
                <Text style={styles.suggestionTitle}>Smart Suggestions</Text>
              </View>
              <Text style={styles.suggestionText}>
                Try reducing dining out by $50-100 for 2 weeks to boost your savings goals, or temporarily increase your entertainment budget if you have a special event coming up.
              </Text>
            </View>
          )}

          {/* New Adjustment Form */}
          {showNewAdjustment && (
            <View style={styles.newAdjustmentForm}>
              <Text style={styles.formTitle}>New Budget Adjustment</Text>
              
              <View style={styles.adjustmentTypeToggle}>
                <TouchableOpacity
                  style={[styles.toggleButton, !isIncrease && styles.toggleButtonActive]}
                  onPress={() => setIsIncrease(false)}
                >
                  <Minus size={16} color={!isIncrease ? '#FFFFFF' : '#64748B'} />
                  <Text style={[styles.toggleText, !isIncrease && styles.toggleTextActive]}>
                    Reduce
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleButton, isIncrease && styles.toggleButtonActive]}
                  onPress={() => setIsIncrease(true)}
                >
                  <Plus size={16} color={isIncrease ? '#FFFFFF' : '#64748B'} />
                  <Text style={[styles.toggleText, isIncrease && styles.toggleTextActive]}>
                    Increase
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Category</Text>
                  <TextInput
                    style={styles.formInput}
                    value={newCategory}
                    onChangeText={setNewCategory}
                    placeholder="e.g., Dining Out"
                    placeholderTextColor="#64748B"
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Amount</Text>
                  <View style={styles.inputWithIcon}>
                    <DollarSign size={16} color="#94A3B8" />
                    <TextInput
                      style={styles.formInputWithIcon}
                      value={newAmount}
                      onChangeText={setNewAmount}
                      placeholder="50"
                      placeholderTextColor="#64748B"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Duration</Text>
                  <TextInput
                    style={styles.formInput}
                    value={newDuration}
                    onChangeText={setNewDuration}
                    placeholder="2 weeks"
                    placeholderTextColor="#64748B"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Reason</Text>
                <TextInput
                  style={styles.formInput}
                  value={newReason}
                  onChangeText={setNewReason}
                  placeholder="Why are you making this adjustment?"
                  placeholderTextColor="#64748B"
                />
              </View>

              <View style={styles.formActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowNewAdjustment(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addAdjustmentButton}
                  onPress={handleAddAdjustment}
                >
                  <Text style={styles.addAdjustmentButtonText}>Add Adjustment</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Active Adjustments */}
          {getActiveAdjustments().length > 0 && (
            <View style={styles.adjustmentsList}>
              <Text style={styles.adjustmentsListTitle}>Active Adjustments</Text>
              {getActiveAdjustments().map((adjustment) => (
                <View key={adjustment.id} style={styles.adjustmentCard}>
                  <View style={styles.adjustmentHeader}>
                    <View style={styles.adjustmentLeft}>
                      <View style={[
                        styles.adjustmentIcon,
                        { backgroundColor: adjustment.isIncrease ? '#10B981' : '#EF4444' }
                      ]}>
                        {adjustment.isIncrease ? (
                          <Plus size={16} color="#FFFFFF" />
                        ) : (
                          <Minus size={16} color="#FFFFFF" />
                        )}
                      </View>
                      <View>
                        <Text style={styles.adjustmentCategory}>{adjustment.category}</Text>
                        <Text style={styles.adjustmentDuration}>
                          {adjustment.isIncrease ? 'Increase' : 'Reduce'} by {formatCurrency(adjustment.amount)} for {adjustment.duration}
                        </Text>
                        <Text style={styles.adjustmentExpiry}>
                          Expires {formatRelativeTime(adjustment.expiresAt)}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteAdjustment(adjustment.id)}
                    >
                      <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.adjustmentReason}>
                    <Text style={styles.adjustmentReasonLabel}>Reason:</Text>
                    <Text style={styles.adjustmentReasonText}>{adjustment.reason}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Expired Adjustments */}
          {getExpiredAdjustments().length > 0 && (
            <View style={styles.adjustmentsList}>
              <Text style={styles.adjustmentsListTitle}>Recently Expired</Text>
              {getExpiredAdjustments().slice(0, 3).map((adjustment) => (
                <View key={adjustment.id} style={[styles.adjustmentCard, styles.expiredCard]}>
                  <View style={styles.adjustmentHeader}>
                    <View style={styles.adjustmentLeft}>
                      <View style={[
                        styles.adjustmentIcon,
                        { backgroundColor: '#64748B' }
                      ]}>
                        {adjustment.isIncrease ? (
                          <Plus size={16} color="#FFFFFF" />
                        ) : (
                          <Minus size={16} color="#FFFFFF" />
                        )}
                      </View>
                      <View>
                        <Text style={[styles.adjustmentCategory, styles.expiredText]}>{adjustment.category}</Text>
                        <Text style={[styles.adjustmentDuration, styles.expiredText]}>
                          {adjustment.isIncrease ? 'Increased' : 'Reduced'} by {formatCurrency(adjustment.amount)} for {adjustment.duration}
                        </Text>
                        <Text style={styles.adjustmentExpiry}>
                          Expired {formatRelativeTime(adjustment.expiresAt)}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteAdjustment(adjustment.id)}
                    >
                      <Trash2 size={16} color="#64748B" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.adjustmentReason}>
                  <Text style={styles.adjustmentReasonLabel}>Reason:</Text>
                  <Text style={styles.adjustmentReasonText}>{adjustment.reason}</Text>
                </View>
              </View>
            ))}
            </View>
          )}

          {budgetAdjustments.length === 0 && !showNewAdjustment && (
            <View style={styles.emptyState}>
              <Edit3 size={32} color="#64748B" />
              <Text style={styles.emptyStateText}>No budget adjustments yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Create temporary budget modifications to help reach your financial goals
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚀 Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Calendar size={20} color="#3B82F6" />
              <Text style={styles.quickActionText}>Schedule Budget Review</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionButton}>
              <DollarSign size={20} color="#10B981" />
              <Text style={styles.quickActionText}>Calculate Savings Goal</Text>
            </TouchableOpacity>
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
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF', // Lighter grey
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  templateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
  },
  templateButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#F59E0B', // Amber
    marginLeft: 4,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#34D399', // Bright green
    marginLeft: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#60A5FA', // Light blue
    marginLeft: 4,
  },
  notesContainer: {
    backgroundColor: '#1F2937', // Dark card
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  notesInput: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#F9FAFB', // Light text
    minHeight: 200,
    lineHeight: 24,
  },
  newAdjustmentForm: {
    backgroundColor: '#1F2937', // Dark card
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#F9FAFB', // Light text
    marginBottom: 16,
  },
  adjustmentTypeToggle: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#374151',
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  toggleButtonActive: {
    backgroundColor: '#3B82F6',
  },
  toggleText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF', // Lighter grey
    marginLeft: 4,
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  formGroup: {
    flex: 1,
  },
  formLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#F9FAFB', // Light text
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#111827', // Darker input
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#F9FAFB', // Light text
    borderWidth: 1,
    borderColor: '#374151',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827', // Darker input
    borderRadius: 8,
    paddingLeft: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  formInputWithIcon: {
    flex: 1,
    padding: 12,
    paddingLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#F9FAFB', // Light text
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF', // Lighter grey
  },
  addAdjustmentButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addAdjustmentButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  adjustmentsList: {
    gap: 12,
  },
  adjustmentCard: {
    backgroundColor: '#1F2937', // Dark card
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  adjustmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  adjustmentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  adjustmentIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  adjustmentCategory: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#F9FAFB', // Light text
    marginBottom: 2,
  },
  adjustmentDuration: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF', // Lighter grey
  },
  deleteButton: {
    padding: 8,
  },
  adjustmentReason: {
    backgroundColor: '#111827', // Darker background
    borderRadius: 8,
    padding: 12,
  },
  adjustmentReasonLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF', // Lighter grey
    marginBottom: 4,
  },
  adjustmentReasonText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#E5E7EB', // Off-white
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280', // Darker grey
    marginTop: 12,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280', // Darker grey
    textAlign: 'center',
    lineHeight: 20,
  },
  quickActions: {
    gap: 12,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937', // Darker card
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  quickActionText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#F9FAFB', // Light text
    marginLeft: 12,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonTextDisabled: {
    color: '#64748B',
  },
  autoSaveInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  autoSaveText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginLeft: 6,
  },
  templatesContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  templatesTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#F9FAFB',
    marginBottom: 12,
  },
  templatesList: {
    gap: 8,
  },
  templateCard: {
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  templateCardTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#F59E0B',
    marginBottom: 4,
  },
  templateCardPreview: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    lineHeight: 16,
  },
  suggestionsContainer: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  suggestionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
    marginLeft: 8,
  },
  suggestionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#E5E7EB',
    lineHeight: 20,
  },
  adjustmentsListTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#F9FAFB',
    marginBottom: 12,
    paddingLeft: 4,
  },
  adjustmentExpiry: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginTop: 2,
  },
  expiredCard: {
    opacity: 0.7,
    borderLeftColor: '#64748B',
  },
  expiredText: {
    color: '#9CA3AF',
  },
});