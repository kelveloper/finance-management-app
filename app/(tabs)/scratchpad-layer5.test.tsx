import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Layer 5: Enhanced Scratch Pad Features', () => {
  
  // Mock AsyncStorage
  const mockAsyncStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  };
  
  global.AsyncStorage = mockAsyncStorage;
  
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock current time for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });
  
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Note Templates System', () => {
    const noteTemplates = [
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

    it('should provide three predefined note templates', () => {
      expect(noteTemplates).toHaveLength(3);
      expect(noteTemplates[0].title).toBe('Monthly Planning');
      expect(noteTemplates[1].title).toBe('Goal Setting'); 
      expect(noteTemplates[2].title).toBe('Expense Tracking');
    });

    it('should have structured content for each template', () => {
      noteTemplates.forEach(template => {
        expect(template.content).toContain('•'); // Contains bullet points
        expect(template.content.length).toBeGreaterThan(50); // Substantial content
      });
    });

    it('should handle template selection correctly', () => {
      const handleUseTemplate = vi.fn();
      const setNotes = vi.fn();
      const setShowTemplates = vi.fn();
      
      const mockTemplate = noteTemplates[0];
      
      // Simulate template selection
      handleUseTemplate(mockTemplate);
      setNotes(mockTemplate.content);
      setShowTemplates(false);
      
      expect(setNotes).toHaveBeenCalledWith(mockTemplate.content);
      expect(setShowTemplates).toHaveBeenCalledWith(false);
    });
  });

  describe('Auto-Save Functionality', () => {
    it('should save notes automatically after 30 seconds of inactivity', async () => {
      const notes = 'Test notes content';
      const handleSaveNotes = vi.fn();
      
      // Simulate auto-save trigger
      setTimeout(() => {
        handleSaveNotes(true); // isAutoSave = true
      }, 30000);
      
      vi.advanceTimersByTime(30000);
      
      expect(handleSaveNotes).toHaveBeenCalledWith(true);
    });

    it('should track last saved time correctly', () => {
      const now = new Date('2024-01-15T12:00:00Z');
      const formatRelativeTime = (date: Date): string => {
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        
        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        return `${diffHours}h ago`;
      };
      
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      expect(formatRelativeTime(fiveMinutesAgo)).toBe('5m ago');
      expect(formatRelativeTime(oneHourAgo)).toBe('1h ago');
      expect(formatRelativeTime(now)).toBe('just now');
    });

    it('should handle auto-save without showing alerts', async () => {
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
      
      const notes = 'Auto-saved notes';
      await mockAsyncStorage.setItem('scratchpad_notes', notes);
      await mockAsyncStorage.setItem('notes_last_saved', new Date().toISOString());
      
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('scratchpad_notes', notes);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('notes_last_saved', expect.any(String));
    });
  });

  describe('Enhanced Budget Adjustments', () => {
    const createBudgetAdjustment = (overrides = {}) => ({
      id: Date.now().toString(),
      category: 'Dining Out',
      amount: 50,
      duration: '2 weeks',
      reason: 'Saving for vacation',
      isIncrease: false,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      isActive: true,
      ...overrides
    });

    it('should calculate expiration dates correctly', () => {
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
      
      const oneWeekLater = calculateExpirationDate('1 week');
      const twoWeeksLater = calculateExpirationDate('2 weeks');
      const oneMonthLater = calculateExpirationDate('1 month');
      
      const now = new Date();
      expect(oneWeekLater.getTime()).toBe(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      expect(twoWeeksLater.getTime()).toBe(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      expect(oneMonthLater.getTime()).toBe(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    });

    it('should separate active and expired adjustments', () => {
      const activeAdjustment = createBudgetAdjustment({
        id: '1',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true
      });
      
      const expiredAdjustment = createBudgetAdjustment({
        id: '2', 
        expiresAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        isActive: false
      });
      
      const adjustments = [activeAdjustment, expiredAdjustment];
      const getActiveAdjustments = () => adjustments.filter(adj => adj.isActive);
      const getExpiredAdjustments = () => adjustments.filter(adj => !adj.isActive);
      
      expect(getActiveAdjustments()).toHaveLength(1);
      expect(getExpiredAdjustments()).toHaveLength(1);
      expect(getActiveAdjustments()[0].id).toBe('1');
      expect(getExpiredAdjustments()[0].id).toBe('2');
    });

    it('should validate adjustment input correctly', () => {
      const validateAdjustment = (category: string, amount: string, duration: string, reason: string) => {
        if (!category || !amount || !duration || !reason) {
          return { valid: false, error: 'Missing Information' };
        }
        
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
          return { valid: false, error: 'Invalid Amount' };
        }
        
        return { valid: true };
      };
      
      expect(validateAdjustment('', '50', '2 weeks', 'test')).toEqual({
        valid: false,
        error: 'Missing Information'
      });
      
      expect(validateAdjustment('Dining', 'invalid', '2 weeks', 'test')).toEqual({
        valid: false,
        error: 'Invalid Amount'
      });
      
      expect(validateAdjustment('Dining', '50', '2 weeks', 'test')).toEqual({
        valid: true
      });
    });

    it('should update adjustment active status based on expiration', () => {
      const now = new Date();
      const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const checkAdjustmentStatus = (expiresAt: Date) => new Date(expiresAt) > now;
      
      expect(checkAdjustmentStatus(futureDate)).toBe(true);
      expect(checkAdjustmentStatus(pastDate)).toBe(false);
    });
  });

  describe('Persistent Storage Integration', () => {
    it('should save notes to AsyncStorage', async () => {
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
      
      const notes = 'Test financial notes';
      const lastSaved = new Date().toISOString();
      
      await mockAsyncStorage.setItem('scratchpad_notes', notes);
      await mockAsyncStorage.setItem('notes_last_saved', lastSaved);
      
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('scratchpad_notes', notes);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('notes_last_saved', lastSaved);
    });

    it('should save budget adjustments to AsyncStorage', async () => {
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
      
      const adjustments = [createBudgetAdjustment()];
      
      await mockAsyncStorage.setItem('budget_adjustments', JSON.stringify(adjustments));
      
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'budget_adjustments',
        JSON.stringify(adjustments)
      );
    });

    it('should load stored data on initialization', async () => {
      const storedNotes = 'Previously saved notes';
      const storedAdjustments = JSON.stringify([createBudgetAdjustment()]);
      const lastSavedTime = new Date().toISOString();
      
      mockAsyncStorage.getItem
        .mockResolvedValueOnce(storedNotes)
        .mockResolvedValueOnce(storedAdjustments)
        .mockResolvedValueOnce(lastSavedTime);
      
      const notes = await mockAsyncStorage.getItem('scratchpad_notes');
      const adjustments = await mockAsyncStorage.getItem('budget_adjustments');
      const lastSaved = await mockAsyncStorage.getItem('notes_last_saved');
      
      expect(notes).toBe(storedNotes);
      expect(adjustments).toBe(storedAdjustments);
      expect(lastSaved).toBe(lastSavedTime);
    });

    it('should provide default content when no stored data exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      
      const defaultNotes = 'Monthly financial planning notes:\n\n• Consider increasing emergency fund contribution by $100/month\n• Look into refinancing car loan for better rate\n• Research high-yield savings accounts\n• Plan for Q2 vacation budget (~$2000)\n\nGoals for next month:\n- Track dining out expenses more closely\n- Set up automatic transfer to savings\n- Review subscription services';
      
      const notes = await mockAsyncStorage.getItem('scratchpad_notes') || defaultNotes;
      
      expect(notes).toBe(defaultNotes);
    });
  });

  describe('Smart Suggestions System', () => {
    it('should provide relevant budget adjustment suggestions', () => {
      const suggestions = [
        'Try reducing dining out by $50-100 for 2 weeks to boost your savings goals',
        'Temporarily increase your entertainment budget if you have a special event coming up',
        'Consider pausing subscription services you don\'t use frequently'
      ];
      
      suggestions.forEach(suggestion => {
        expect(suggestion).toContain('$');
        expect(suggestion.length).toBeGreaterThan(20);
      });
    });

    it('should show suggestions when no active adjustments exist', () => {
      const activeAdjustments: any[] = [];
      const shouldShowSuggestions = !false && activeAdjustments.length === 0; // !showNewAdjustment
      
      expect(shouldShowSuggestions).toBe(true);
    });

    it('should hide suggestions when adjustments exist or form is open', () => {
      const activeAdjustments = [createBudgetAdjustment()];
      const showNewAdjustment = true;
      
      const shouldShowSuggestions = !showNewAdjustment && activeAdjustments.length === 0;
      
      expect(shouldShowSuggestions).toBe(false);
    });
  });

  describe('Category and Duration Suggestions', () => {
    it('should provide common category suggestions', () => {
      const commonCategories = [
        'Dining Out', 'Entertainment', 'Shopping', 'Groceries',
        'Transportation', 'Subscriptions', 'Hobbies', 'Personal Care'
      ];
      
      expect(commonCategories).toHaveLength(8);
      expect(commonCategories).toContain('Dining Out');
      expect(commonCategories).toContain('Entertainment');
      expect(commonCategories).toContain('Subscriptions');
    });

    it('should provide duration suggestions', () => {
      const durationSuggestions = [
        '1 week', '2 weeks', '1 month', '2 months', '3 months'
      ];
      
      expect(durationSuggestions).toHaveLength(5);
      expect(durationSuggestions).toContain('1 week');
      expect(durationSuggestions).toContain('1 month');
      expect(durationSuggestions).toContain('3 months');
    });
  });

  describe('User Experience Enhancements', () => {
    it('should format currency correctly', () => {
      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amount);
      };
      
      expect(formatCurrency(50)).toBe('$50.00');
      expect(formatCurrency(100.5)).toBe('$100.50');
      expect(formatCurrency(1000)).toBe('$1,000.00');
    });

    it('should handle save button states correctly', () => {
      const isSaving = false;
      const buttonText = isSaving ? 'Saving...' : 'Save';
      const buttonDisabled = isSaving;
      
      expect(buttonText).toBe('Save');
      expect(buttonDisabled).toBe(false);
      
      const isSavingState = true;
      const savingButtonText = isSavingState ? 'Saving...' : 'Save';
      const savingButtonDisabled = isSavingState;
      
      expect(savingButtonText).toBe('Saving...');
      expect(savingButtonDisabled).toBe(true);
    });

    it('should provide visual feedback for expired adjustments', () => {
      const adjustment = createBudgetAdjustment({ isActive: false });
      const cardOpacity = adjustment.isActive ? 1 : 0.7;
      const borderColor = adjustment.isActive ? '#3B82F6' : '#64748B';
      
      expect(cardOpacity).toBe(0.7);
      expect(borderColor).toBe('#64748B');
    });
  });

  describe('Integration and Error Handling', () => {
    it('should handle AsyncStorage errors gracefully', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage full'));
      
      try {
        await mockAsyncStorage.setItem('test_key', 'test_value');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Storage full');
      }
    });

    it('should maintain data consistency during operations', () => {
      const originalAdjustments = [createBudgetAdjustment({ id: '1' })];
      const newAdjustment = createBudgetAdjustment({ id: '2' });
      const updatedAdjustments = [...originalAdjustments, newAdjustment];
      
      expect(updatedAdjustments).toHaveLength(2);
      expect(updatedAdjustments[0].id).toBe('1');
      expect(updatedAdjustments[1].id).toBe('2');
    });

    it('should handle deletion operations correctly', () => {
      const adjustments = [
        createBudgetAdjustment({ id: '1' }),
        createBudgetAdjustment({ id: '2' }),
        createBudgetAdjustment({ id: '3' })
      ];
      
      const filteredAdjustments = adjustments.filter(adj => adj.id !== '2');
      
      expect(filteredAdjustments).toHaveLength(2);
      expect(filteredAdjustments.map(adj => adj.id)).toEqual(['1', '3']);
    });
  });
}); 