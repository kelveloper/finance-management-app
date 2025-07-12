import { supabase } from '../supabase';

// Privacy-focused AI Learning Engine
// This system learns patterns WITHOUT storing personal information

interface LearnedPattern {
  pattern: string;
  category: string;
  subcategory: string;
  confidence: number;
  occurrences: number;
  lastSeen: string;
}

// Generic pattern categories (NO personal names)
const BASE_CATEGORY_PATTERNS = {
  'Income': {
    patterns: ['DIRECT DEP', 'SALARY', 'PAYROLL', 'Zelle payment from'],
    subcategories: {
      'Salary': ['DIRECT DEP', 'SALARY', 'PAYROLL'],
      'Freelance': ['CONTRACTOR', 'FREELANCE', 'GIG'],
      'Investment Income': ['DIVIDEND', 'INTEREST', 'CAPITAL GAINS'],
      'Other Income': ['BONUS', 'COMMISSION', 'TIPS', 'GIFT', 'REFUND']
    }
  },
  'Food & Drink': {
    patterns: ['RESTAURANT', 'CAFE', 'FOOD', 'DELI', 'BAKERY'],
    subcategories: {
      'Fast Food': ['MCDONALD', 'KFC', 'BURGER KING', 'TACO BELL', 'SUBWAY'],
      'Coffee & Tea': ['STARBUCKS', 'DUNKIN', 'COFFEE', 'CAFE', 'TEA'],
      'Restaurants & Dining': ['RESTAURANT', 'BISTRO', 'GRILL', 'DINER', 'PIZZERIA'],
      'Groceries & Supermarkets': ['SUPERMARKET', 'GROCERY', 'WALMART', 'TARGET', 'COSTCO'],
      'Delivery & Takeout': ['GRUBHUB', 'DOORDASH', 'UBER EATS', 'DELIVERY'],
      'Bakeries & Desserts': ['BAKERY', 'PASTRY', 'DONUT', 'ICE CREAM', 'DESSERT']
    }
  },
  'Financial & Transfers': {
    patterns: ['COINBASE', 'PAYPAL', 'VENMO', 'CREDIT CARD', 'BANK'],
    subcategories: {
      'Cryptocurrency': ['COINBASE', 'BITCOIN', 'ETHEREUM', 'CRYPTO'],
      'Digital Payments': ['PAYPAL', 'VENMO', 'CASHAPP', 'ZELLE'],
      'Banking & Credit': ['BANK', 'CREDIT CARD', 'LOAN', 'PAYMENT'],
      'Investment': ['ROBINHOOD', 'FIDELITY', 'SCHWAB', 'INVESTMENT'],
      'Transfers': ['TRANSFER', 'WIRE', 'ACH'],
      'Fees': ['FEE', 'CHARGE', 'OVERDRAFT', 'ATM']
    }
  }
  // ... other categories without personal info
};

class AILearningEngine {
  private learnedPatterns: Map<string, LearnedPattern> = new Map();

  constructor() {
    this.loadLearnedPatterns();
  }

  // Load previously learned patterns from database
  private async loadLearnedPatterns() {
    try {
      const { data: patterns, error } = await supabase
        .from('ai_learned_patterns')
        .select('*')
        .gte('confidence', 0.7); // Only load high-confidence patterns

      if (error) {
        console.log('Note: AI patterns table not found, starting fresh');
        return;
      }

      patterns?.forEach(p => {
        this.learnedPatterns.set(p.pattern, {
          pattern: p.pattern,
          category: p.category,
          subcategory: p.subcategory,
          confidence: p.confidence,
          occurrences: p.occurrences,
          lastSeen: p.last_seen
        });
      });

      console.log(`🧠 Loaded ${this.learnedPatterns.size} learned patterns`);
    } catch (error) {
      console.log('Could not load learned patterns, starting fresh');
    }
  }

  // Learn from user categorization (privacy-focused)
  async learnFromUserFeedback(
    description: string, 
    userCategory: string, 
    userSubcategory?: string
  ): Promise<void> {
    // Extract GENERIC patterns (avoiding personal info)
    const patterns = this.extractGenericPatterns(description);
    
    for (const pattern of patterns) {
      await this.reinforcePattern(pattern, userCategory, userSubcategory);
    }
  }

  // Learn from negative feedback (when user deselects similar transactions)
  async learnFromNegativeFeedback(
    selectedDescription: string,
    deselectedDescription: string,
    category: string,
    subcategory?: string
  ): Promise<void> {
    // Extract patterns from both descriptions
    const selectedPatterns = this.extractGenericPatterns(selectedDescription);
    const deselectedPatterns = this.extractGenericPatterns(deselectedDescription);
    
    // Find patterns that are common between them (these are the false positives)
    const commonPatterns = selectedPatterns.filter(p => deselectedPatterns.includes(p));
    
    // Reduce confidence for patterns that led to false matches
    for (const pattern of commonPatterns) {
      await this.weakenPattern(pattern, category, subcategory);
    }
    
    // Learn distinguishing patterns (what makes them different)
    const uniqueToSelected = selectedPatterns.filter(p => !deselectedPatterns.includes(p));
    const uniqueToDeselected = deselectedPatterns.filter(p => !selectedPatterns.includes(p));
    
    // Strengthen patterns unique to the selected transaction
    for (const pattern of uniqueToSelected) {
      await this.reinforcePattern(pattern, category, subcategory);
    }
    
    // Store negative patterns (what NOT to match for this category)
    for (const pattern of uniqueToDeselected) {
      await this.storeNegativePattern(pattern, category, subcategory);
    }
    
    console.log(`🧠 Learned from negative feedback: ${commonPatterns.length} weakened, ${uniqueToSelected.length} strengthened, ${uniqueToDeselected.length} negative patterns`);
  }

  // Extract generic patterns without personal information
  private extractGenericPatterns(description: string): string[] {
    const patterns: string[] = [];
    const normalizedDesc = description.toUpperCase().replace(/[^A-Z0-9\s]/g, ' ');
    
    // Extract company/merchant names (not personal names)
    const words = normalizedDesc.split(/\s+/).filter(w => w.length > 3);
    
    for (const word of words) {
      // Skip if it looks like a personal name (starts with common name patterns)
      if (this.isLikelyPersonalName(word)) {
        continue;
      }
      
      // Include business/merchant patterns
      if (this.isLikelyBusinessPattern(word)) {
        patterns.push(word);
      }
    }
    
    // Extract business phrases
    const businessPhrases = [
      'DIRECT DEP', 'CREDIT CARD', 'ONLINE PMT', 'INST XFER',
      'Zelle payment', 'PAYPAL', 'VENMO', 'CASHAPP'
    ];
    
    for (const phrase of businessPhrases) {
      if (normalizedDesc.includes(phrase.toUpperCase())) {
        patterns.push(phrase);
      }
    }
    
    return patterns;
  }

  // Check if a word is likely a personal name (privacy protection)
  private isLikelyPersonalName(word: string): boolean {
    // Skip words that are likely personal names
    const personalNameIndicators = [
      // Skip if it's all caps and looks like a name (vs business)
      // This is a simple heuristic - could be improved with NLP
    ];
    
    // For now, if it starts with common name patterns, skip it
    // This could be enhanced with a names database
    return false; // Simplified for now
  }

  // Check if a word is likely a business pattern
  private isLikelyBusinessPattern(word: string): boolean {
    const businessIndicators = [
      'LLC', 'INC', 'CORP', 'CO', 'RESTAURANT', 'STORE', 'MARKET',
      'BANK', 'CREDIT', 'CARD', 'PAYMENT', 'TRANSFER', 'PHARMACY',
      'HOSPITAL', 'CLINIC', 'UBER', 'LYFT', 'AMAZON', 'TARGET'
    ];
    
    return businessIndicators.some(indicator => word.includes(indicator)) ||
           word.includes('CARD') || word.includes('BANK') || word.includes('PAY');
  }

  // Reinforce a pattern with user feedback
  private async reinforcePattern(
    pattern: string, 
    category: string, 
    subcategory?: string
  ): Promise<void> {
    const key = `${pattern}|${category}|${subcategory || 'none'}`;
    
    if (this.learnedPatterns.has(key)) {
      const existing = this.learnedPatterns.get(key)!;
      existing.occurrences++;
      existing.confidence = Math.min(1.0, existing.confidence + 0.1);
      existing.lastSeen = new Date().toISOString();
    } else {
      this.learnedPatterns.set(key, {
        pattern,
        category,
        subcategory: subcategory || 'Other',
        confidence: 0.6, // Start with medium confidence
        occurrences: 1,
        lastSeen: new Date().toISOString()
      });
    }
    
    // Save to database
    await this.savePattern(this.learnedPatterns.get(key)!);
  }

  // Weaken a pattern when it leads to false matches
  private async weakenPattern(
    pattern: string, 
    category: string, 
    subcategory?: string
  ): Promise<void> {
    const key = `${pattern}|${category}|${subcategory || 'none'}`;
    
    if (this.learnedPatterns.has(key)) {
      const existing = this.learnedPatterns.get(key)!;
      existing.confidence = Math.max(0.1, existing.confidence - 0.15); // Reduce confidence more aggressively
      existing.lastSeen = new Date().toISOString();
      
      // If confidence gets too low, remove the pattern
      if (existing.confidence < 0.3) {
        this.learnedPatterns.delete(key);
        await this.deletePattern(pattern, category, subcategory);
        console.log(`🗑️ Removed low-confidence pattern: ${pattern} -> ${category}`);
      } else {
        await this.savePattern(existing);
        console.log(`📉 Weakened pattern: ${pattern} -> ${category} (confidence: ${existing.confidence.toFixed(2)})`);
      }
    }
  }

  // Store negative patterns (what NOT to match for this category)
  private async storeNegativePattern(
    pattern: string, 
    category: string, 
    subcategory?: string
  ): Promise<void> {
    const key = `NEG_${pattern}|${category}|${subcategory || 'none'}`;
    
    this.learnedPatterns.set(key, {
      pattern: `NEG_${pattern}`, // Prefix to indicate negative pattern
      category,
      subcategory: subcategory || 'Other',
      confidence: -0.8, // Negative confidence
      occurrences: 1,
      lastSeen: new Date().toISOString()
    });
    
    await this.savePattern(this.learnedPatterns.get(key)!);
    console.log(`❌ Stored negative pattern: ${pattern} should NOT match ${category}`);
  }

  // Delete a pattern from database
  private async deletePattern(
    pattern: string, 
    category: string, 
    subcategory?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_learned_patterns')
        .delete()
        .eq('pattern', pattern)
        .eq('category', category)
        .eq('subcategory', subcategory || 'Other');
      
      if (error) {
        console.error('Error deleting pattern:', error);
      }
    } catch (error) {
      console.error('Error deleting pattern:', error);
    }
  }

  // Save learned pattern to database
  private async savePattern(pattern: LearnedPattern): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_learned_patterns')
        .upsert({
          pattern: pattern.pattern,
          category: pattern.category,
          subcategory: pattern.subcategory,
          confidence: pattern.confidence,
          occurrences: pattern.occurrences,
          last_seen: pattern.lastSeen
        }, {
          onConflict: 'pattern,category,subcategory'
        });

      if (error) {
        console.log('Note: Could not save learned pattern:', error.message);
      }
    } catch (error) {
      console.log('Could not save learned pattern to database');
    }
  }

  // Categorize transaction using learned patterns
  categorizeTransaction(description: string): { category: string; subcategory: string; confidence: number } {
    let bestMatch = { category: 'General', subcategory: 'Other', confidence: 0 };
    const upperDesc = description.toUpperCase();
    
    // First check learned patterns
    for (const [key, pattern] of this.learnedPatterns) {
      const patternText = pattern.pattern.replace('NEG_', '').toUpperCase();
      
      if (upperDesc.includes(patternText)) {
        // Handle negative patterns (reduce confidence for this category)
        if (pattern.pattern.startsWith('NEG_')) {
          // If this is a negative pattern, penalize this category
          if (pattern.category === bestMatch.category) {
            bestMatch.confidence = Math.max(0, bestMatch.confidence + pattern.confidence); // Add negative confidence
          }
        } else {
          // Positive pattern
          if (pattern.confidence > bestMatch.confidence) {
            // Check if there's a negative pattern for this category
            const negativeKey = `NEG_${pattern.pattern}|${pattern.category}|${pattern.subcategory}`;
            const hasNegativePattern = this.learnedPatterns.has(negativeKey);
            
            if (!hasNegativePattern) {
              bestMatch = {
                category: pattern.category,
                subcategory: pattern.subcategory,
                confidence: pattern.confidence
              };
            }
          }
        }
      }
    }
    
    // Fallback to base patterns if no learned pattern found
    if (bestMatch.confidence < 0.5) {
      for (const [category, categoryData] of Object.entries(BASE_CATEGORY_PATTERNS)) {
        for (const pattern of categoryData.patterns) {
          if (upperDesc.includes(pattern.toUpperCase())) {
            // Check if there's a negative pattern for this category
            const negativeKey = `NEG_${pattern}|${category}|Other`;
            const hasNegativePattern = this.learnedPatterns.has(negativeKey);
            
            if (!hasNegativePattern) {
              bestMatch = { category, subcategory: 'Other', confidence: 0.8 };
              break;
            }
          }
        }
      }
    }
    
    return bestMatch;
  }

  // Get learning statistics
  getLearningStats(): { totalPatterns: number; categories: Record<string, number> } {
    const categories: Record<string, number> = {};
    
    for (const pattern of this.learnedPatterns.values()) {
      categories[pattern.category] = (categories[pattern.category] || 0) + 1;
    }
    
    return {
      totalPatterns: this.learnedPatterns.size,
      categories
    };
  }

  // Clean up low-confidence patterns (privacy maintenance)
  async cleanupLowConfidencePatterns(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 days ago
    
    for (const [key, pattern] of this.learnedPatterns) {
      if (pattern.confidence < 0.3 && new Date(pattern.lastSeen) < cutoffDate) {
        this.learnedPatterns.delete(key);
        
        // Remove from database
        await supabase
          .from('ai_learned_patterns')
          .delete()
          .eq('pattern', pattern.pattern)
          .eq('category', pattern.category)
          .eq('subcategory', pattern.subcategory);
      }
    }
  }
}

export const aiLearningEngine = new AILearningEngine(); 