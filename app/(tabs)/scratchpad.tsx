import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Save, Plus, Minus, DollarSign, Calendar, CreditCard as Edit3, Trash2 } from 'lucide-react-native';

interface BudgetAdjustment {
  id: string;
  category: string;
  amount: number;
  duration: string;
  reason: string;
  isIncrease: boolean;
}

export default function ScratchpadScreen() {
  const [notes, setNotes] = useState('Monthly financial planning notes:\n\n• Consider increasing emergency fund contribution by $100/month\n• Look into refinancing car loan for better rate\n• Research high-yield savings accounts\n• Plan for Q2 vacation budget (~$2000)\n\nGoals for next month:\n- Track dining out expenses more closely\n- Set up automatic transfer to savings\n- Review subscription services');
  
  const [budgetAdjustments, setBudgetAdjustments] = useState<BudgetAdjustment[]>([
    {
      id: '1',
      category: 'Dining Out',
      amount: 50,
      duration: '2 weeks',
      reason: 'Trying to save for vacation',
      isIncrease: false
    }
  ]);

  const [showNewAdjustment, setShowNewAdjustment] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [newReason, setNewReason] = useState('');
  const [isIncrease, setIsIncrease] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleSaveNotes = () => {
    // In real app, save to backend
    console.log('Notes saved:', notes);
  };

  const handleAddAdjustment = () => {
    if (!newCategory || !newAmount || !newDuration || !newReason) return;

    const adjustment: BudgetAdjustment = {
      id: Date.now().toString(),
      category: newCategory,
      amount: parseFloat(newAmount),
      duration: newDuration,
      reason: newReason,
      isIncrease
    };

    setBudgetAdjustments([...budgetAdjustments, adjustment]);
    
    // Reset form
    setNewCategory('');
    setNewAmount('');
    setNewDuration('');
    setNewReason('');
    setIsIncrease(false);
    setShowNewAdjustment(false);
  };

  const handleDeleteAdjustment = (id: string) => {
    setBudgetAdjustments(budgetAdjustments.filter(adj => adj.id !== id));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#0F172A', '#1E293B']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Scratch Pad</Text>
        <Text style={styles.headerSubtitle}>Your financial planning space</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📝 Financial Notes</Text>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveNotes}
              activeOpacity={0.8}
            >
              <Save size={16} color="#10B981" />
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>

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
            <Text style={styles.sectionTitle}>⚡ Quick Budget Adjustments</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowNewAdjustment(!showNewAdjustment)}
              activeOpacity={0.8}
            >
              <Plus size={16} color="#3B82F6" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

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

          {/* Existing Adjustments */}
          <View style={styles.adjustmentsList}>
            {budgetAdjustments.map((adjustment) => (
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
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#10B981',
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
    color: '#3B82F6',
    marginLeft: 4,
  },
  notesContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  notesInput: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    minHeight: 200,
    lineHeight: 24,
  },
  newAdjustmentForm: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  adjustmentTypeToggle: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  toggleButtonActive: {
    backgroundColor: '#3B82F6',
  },
  toggleText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
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
    color: '#FFFFFF',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    paddingLeft: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  formInputWithIcon: {
    flex: 1,
    padding: 12,
    paddingLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
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
    color: '#64748B',
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
    color: '#FFFFFF',
    marginBottom: 2,
  },
  adjustmentDuration: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
  },
  deleteButton: {
    padding: 8,
  },
  adjustmentReason: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    padding: 12,
  },
  adjustmentReasonLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#94A3B8',
    marginBottom: 4,
  },
  adjustmentReasonText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#E2E8F0',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginTop: 12,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  quickActions: {
    gap: 12,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickActionText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    marginLeft: 12,
  },
});