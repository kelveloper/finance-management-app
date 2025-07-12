import { supabase } from './supabase';

// --- Smart Subcategorization System ---

// Comprehensive subcategory structure
const SUBCATEGORY_STRUCTURE = {
  'Food & Drink': {
    'Fast Food': ['MCDONALD', 'KFC', 'BURGER KING', 'TACO BELL', 'SUBWAY', 'WENDYS', 'CHICK-FIL-A', 'POPEYES', 'CHIPOTLE', 'FIVE GUYS', 'IN-N-OUT'],
    'Coffee & Tea': ['STARBUCKS', 'DUNKIN', 'COFFEE', 'CAFE', 'TEA', 'ESPRESSO', 'LATTE'],
    'Restaurants & Dining': ['RESTAURANT', 'BISTRO', 'GRILL', 'DINER', 'PIZZERIA', 'STEAKHOUSE', 'SUSHI', 'THAI', 'CHINESE', 'ITALIAN', 'MEXICAN'],
    'Groceries & Supermarkets': ['SUPERMARKET', 'GROCERY', 'WALMART', 'TARGET', 'COSTCO', 'WHOLE FOODS', 'TRADER JOES', 'SAFEWAY', 'KROGER', 'PUBLIX', 'BRAVO SUPERMARKET', 'KEY FOOD'],
    'Delivery & Takeout': ['GRUBHUB', 'DOORDASH', 'UBER EATS', 'POSTMATES', 'SEAMLESS', 'DELIVERY', 'TAKEOUT'],
    'Alcohol & Bars': ['BAR', 'PUB', 'BREWERY', 'WINE', 'LIQUOR', 'BEER', 'COCKTAIL', 'SPIRITS'],
    'Bakeries & Desserts': ['BAKERY', 'PASTRY', 'DONUT', 'ICE CREAM', 'DESSERT', 'CAKE', 'COOKIE', 'PARIS BAGUETTE', 'FORTUNATO BROS BAKERY']
  },
  'Transportation': {
    'Rideshare': ['UBER', 'LYFT', 'RIDESHARE', 'TAXI'],
    'Public Transit': ['MTA', 'SUBWAY', 'BUS', 'TRAIN', 'TRANSIT', 'METRO'],
    'Gas & Fuel': ['GAS', 'FUEL', 'SHELL', 'EXXON', 'BP', 'CHEVRON', 'MOBIL', 'SUNOCO'],
    'Car Maintenance': ['AUTO', 'MECHANIC', 'REPAIR', 'SERVICE', 'TIRE', 'OIL CHANGE', 'CARWASH'],
    'Parking': ['PARKING', 'GARAGE', 'METER', 'VALET'],
    'Tolls': ['TOLL', 'BRIDGE', 'TUNNEL', 'HIGHWAY', 'TURNPIKE']
  },
  'Shopping': {
    'Clothing & Accessories': ['CLOTHING', 'APPAREL', 'FASHION', 'SHOES', 'ACCESSORIES', 'JEWELRY', 'WATCH', 'HANDBAG'],
    'Electronics & Tech': ['ELECTRONICS', 'TECH', 'COMPUTER', 'PHONE', 'TABLET', 'APPLE', 'SAMSUNG', 'BEST BUY', 'AMAZON'],
    'Home & Garden': ['HOME', 'GARDEN', 'FURNITURE', 'DECOR', 'HARDWARE', 'LOWE\'S', 'HOME DEPOT', 'IKEA'],
    'Health & Beauty': ['BEAUTY', 'COSMETICS', 'SKINCARE', 'SALON', 'BARBER', 'SPA', 'MAKEUP', 'PERFUME'],
    'General Retail': ['RETAIL', 'STORE', 'SHOPPING', 'MALL', 'OUTLET', 'DEPARTMENT'],
    'Online Shopping': ['AMAZON', 'EBAY', 'ETSY', 'ONLINE', 'ECOMMERCE', 'TIKTOK SHOP']
  },
  'Entertainment': {
    'Streaming Services': ['NETFLIX', 'HULU', 'DISNEY+', 'HBO', 'AMAZON PRIME', 'SPOTIFY', 'YOUTUBE', 'TWITCH'],
    'Gaming': ['GAMING', 'XBOX', 'PLAYSTATION', 'NINTENDO', 'STEAM', 'APP STORE', 'GOOGLE PLAY', 'SUPERCELLSTORE'],
    'Movies & Theater': ['MOVIE', 'THEATER', 'CINEMA', 'AMC', 'REGAL', 'CINEMARK', 'FILM'],
    'Concerts & Events': ['CONCERT', 'EVENT', 'TICKET', 'SHOW', 'FESTIVAL', 'VENUE'],
    'Sports & Recreation': ['SPORTS', 'GYM', 'FITNESS', 'RECREATION', 'POOL', 'GOLF', 'TENNIS'],
    'Hobbies': ['HOBBY', 'CRAFT', 'ART', 'MUSIC', 'BOOK', 'MAGAZINE', 'SUBSCRIPTION']
  },
  'Bills & Utilities': {
    'Phone & Internet': ['PHONE', 'INTERNET', 'CELL', 'MOBILE', 'VERIZON', 'AT&T', 'T-MOBILE', 'COMCAST', 'SPECTRUM'],
    'Electricity & Gas': ['ELECTRIC', 'GAS', 'UTILITY', 'POWER', 'ENERGY'],
    'Water & Sewer': ['WATER', 'SEWER', 'SEWAGE', 'MUNICIPAL'],
    'Insurance': ['INSURANCE', 'AUTO INSURANCE', 'HEALTH INSURANCE', 'LIFE INSURANCE', 'HOME INSURANCE'],
    'Subscriptions': ['SUBSCRIPTION', 'MEMBERSHIP', 'MONTHLY', 'ANNUAL', 'HP *INSTANT INK'],
    'Cable & TV': ['CABLE', 'TV', 'SATELLITE', 'DISH', 'DIRECTV']
  },
  'Financial & Transfers': {
    'Banking & Credit': ['BANK', 'CREDIT CARD', 'LOAN', 'MORTGAGE', 'PAYMENT', 'APPLECARD GSBANK', 'BARCLAYCARD', 'CAPITAL ONE', 'CITIZENS ACCESS'],
    'Investment': ['INVESTMENT', 'STOCK', 'MUTUAL FUND', 'ROBINHOOD', 'FIDELITY', 'SCHWAB', 'VANGUARD', 'ACORNS', 'M1 PAYMENTS'],
    'Cryptocurrency': ['CRYPTO', 'BITCOIN', 'ETHEREUM', 'COINBASE', 'BINANCE', 'KRAKEN', 'GEMINI', 'MOONPAY', 'XVERSE'],
    'Digital Payments': ['PAYPAL', 'VENMO', 'CASHAPP', 'ZELLE', 'APPLE PAY', 'GOOGLE PAY', 'APPLE CASH'],
    'Transfers': ['TRANSFER', 'WIRE', 'ACH', 'DEPOSIT', 'WITHDRAWAL'],
    'Fees': ['FEE', 'CHARGE', 'OVERDRAFT', 'ATM', 'SERVICE CHARGE']
  },
  'Health & Medical': {
    'Pharmacy': ['PHARMACY', 'CVS', 'WALGREENS', 'RITE AID', 'PRESCRIPTION', 'MEDICINE', 'DRUG'],
    'Doctor Visits': ['DOCTOR', 'PHYSICIAN', 'CLINIC', 'MEDICAL', 'APPOINTMENT'],
    'Hospital': ['HOSPITAL', 'EMERGENCY', 'URGENT CARE', 'ER', 'MEDICAL CENTER'],
    'Dental': ['DENTAL', 'DENTIST', 'ORTHODONTIST', 'TEETH', 'ORAL'],
    'Vision': ['VISION', 'OPTOMETRIST', 'GLASSES', 'CONTACTS', 'EYE'],
    'Therapy': ['THERAPY', 'THERAPIST', 'COUNSELING', 'MENTAL HEALTH', 'PSYCHOLOGY']
  },
  'Personal Care': {
    'Hair & Beauty': ['HAIR', 'SALON', 'BARBER', 'BEAUTY', 'MAKEUP', 'NAIL', 'MANICURE', 'PEDICURE'],
    'Fitness & Gym': ['GYM', 'FITNESS', 'WORKOUT', 'YOGA', 'PILATES', 'TRAINER', 'EXERCISE'],
    'Spa & Wellness': ['SPA', 'MASSAGE', 'WELLNESS', 'RELAXATION', 'SAUNA'],
    'Laundry & Cleaning': ['LAUNDRY', 'DRY CLEAN', 'WASH', 'CLEANING', 'GATES MEGAWASH'],
    'Personal Items': ['PERSONAL', 'TOILETRIES', 'HYGIENE', 'SHAMPOO', 'SOAP']
  },
  'Income': {
    'Salary': ['SALARY', 'PAYROLL', 'DIRECT DEP', 'WAGES', 'INCOME'],
    'Freelance': ['FREELANCE', 'CONTRACTOR', 'CONSULTATION', 'GIG'],
    'Investment Income': ['DIVIDEND', 'INTEREST', 'CAPITAL GAINS', 'INVESTMENT INCOME'],
    'Other Income': ['BONUS', 'COMMISSION', 'TIPS', 'GIFT', 'REFUND', 'Zelle payment from']
  }
};

// Privacy-focused categorization rules (NO personal names)
const ENHANCED_CATEGORY_RULES: { [category: string]: string[] } = {
  'Income': [
    'DIRECT DEP', 'SALARY', 'PAYROLL', 'Zelle payment from', 'FREELANCE', 'CONTRACTOR'
  ],
  'Food & Drink': [
    "MCDONALD'S", 'GRUBHUB', 'SQ *', 'TST*', 'CARMINES PIZZERIA', 
    '8TH AVE DELI', 'MI AMOR FAST FOOD', 'FRESH & CO', 'FRESH&CO',
    'PARIS BAGUETTE', 'KFC', 'FOOD GALLERY', 'COURT SQUARE DINER',
    'FORTUNATO BROS BAKERY', 'DIAMOND EXPRESS DELI', 'RIDGEWOOD DELI',
    'BRAVO SUPERMARKET', 'KEY FOOD', 'RESTAURANT', 'CAFE', 'PIZZA',
    'DELI', 'BAKERY', 'FOOD'
  ],
  'Transportation': [
    'UBER', 'MTA*NYCT PAYGO', 'MTA*NYCT', 'SUBWAY', 'TAXI', 'LYFT',
    'TRANSIT', 'BUS', 'TRAIN'
  ],
  'Shopping': [
    'CVS/PHARMACY', 'CVS/PHARM', 'DORNEY PARK MERCHANDISE', 'DOLLAR GENERAL',
    'BJS WHOLESALE', 'TARGET', 'WALMART', 'AMAZON', 'COSTCO', 'STORE',
    'SHOPPING', 'RETAIL'
  ],
  'Entertainment': [
    'DORNEY PARK', 'AMC', 'MOVIE', 'THEATER', 'CINEMA', 'NETFLIX',
    'SPOTIFY', 'GAMING', 'SUPERCELLSTORE', 'TIKTOK SHOP'
  ],
  'Bills & Utilities': [
    'HP *INSTANT INK', 'ELECTRIC', 'GAS', 'WATER', 'PHONE', 'INTERNET',
    'CABLE', 'INSURANCE', 'UTILITIES', 'VERIZON', 'AT&T', 'TMOBILE'
  ],
  'Financial & Transfers': [
    'COINBASE', 'COIN BASE', 'Zelle payment to', 'Acorns', 'PAYPAL', 
    'APPLECARD GSBANK', 'BARCLAYCARD US', '1ST BANKCARD CTR', 
    'Payment to Chase card', 'APPLE CASH', 'VENMO', 'CASHAPP',
    'ROBINHOOD', 'FUNDRISE', 'GEMINI', 'MOONPAY', 'XVERSE',
    'CITIZENS ACCESS', 'M1 PAYMENTS', 'CREDIT CARD', 'BANK TRANSFER',
    'ONLINE PMT', 'CAPITAL ONE', 'PROMINIS MEDICAL'
  ],
  'Health & Medical': [
    'PHARMACY', 'DOCTOR', 'HOSPITAL', 'MEDICAL', 'HEALTH', 'DENTAL',
    'CVS/PHARMACY', 'WALGREENS', 'URGENT CARE'
  ],
  'Personal Care': [
    'GATES MEGAWASH', 'SALON', 'BARBER', 'SPA', 'GYM', 'FITNESS'
  ]
};

// Levenshtein distance for fuzzy matching
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = [];
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[str2.length][str1.length];
};

// Smart pattern matching with fuzzy logic
const smartMatch = (description: string, patterns: string[]): boolean => {
  const normalizedDesc = description.toUpperCase().replace(/[^A-Z0-9\s]/g, ' ');
  
  for (const pattern of patterns) {
    const normalizedPattern = pattern.toUpperCase().replace(/[^A-Z0-9\s]/g, ' ');
    
    // Exact match
    if (normalizedDesc.includes(normalizedPattern)) {
      return true;
    }
    
    // Fuzzy match for company names
    const patternWords = normalizedPattern.split(/\s+/).filter(w => w.length > 2);
    const descWords = normalizedDesc.split(/\s+/);
    
    for (const patternWord of patternWords) {
      if (descWords.some(descWord => 
        descWord.includes(patternWord) || 
        patternWord.includes(descWord) ||
        (patternWord.length > 4 && levenshteinDistance(patternWord, descWord) <= 1)
      )) {
        return true;
      }
    }
  }
  
  return false;
};

// Get category and subcategory from description
const getCategoryAndSubcategory = (description: string): { category: string; subcategory: string } => {
  // First, determine the main category
  let mainCategory = 'General';
  for (const category in ENHANCED_CATEGORY_RULES) {
    if (smartMatch(description, ENHANCED_CATEGORY_RULES[category])) {
      mainCategory = category;
      break;
    }
  }
  
  // Then, determine the subcategory within that main category
  let subcategory = 'Other';
  if (mainCategory in SUBCATEGORY_STRUCTURE) {
    for (const [subcat, patterns] of Object.entries(SUBCATEGORY_STRUCTURE[mainCategory as keyof typeof SUBCATEGORY_STRUCTURE])) {
      if (smartMatch(description, patterns)) {
        subcategory = subcat;
        break;
      }
    }
  }
  
  return { category: mainCategory, subcategory };
};

// Learn from user feedback (enhanced for subcategories)
export const learnFromUserFeedback = async (
  transactionId: string, 
  userCategory: string, 
  userSubcategory?: string
): Promise<{ 
  success: boolean; 
  similarUpdated: number; 
  patternLearned: string;
}> => {
  try {
    // Get the transaction description
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('description')
      .eq('id', transactionId)
      .single();

    if (fetchError || !transaction) {
      console.error('Error fetching transaction for learning:', fetchError);
      return { success: false, similarUpdated: 0, patternLearned: '' };
    }

    // Update the original transaction category and subcategory
    const { error: updateError } = await supabase
      .from('transactions')
      .update({ 
        category: userCategory,
        subcategory: userSubcategory || null
      })
      .eq('id', transactionId);

    if (updateError) {
      console.error('Error updating transaction category:', updateError);
      return { success: false, similarUpdated: 0, patternLearned: '' };
    }

    // Extract key patterns from the transaction description
    const description = transaction.description.toUpperCase();
    const patterns = extractKeyPatterns(description);
    
    console.log(`🧠 Learning from: "${transaction.description}"`);
    console.log(`📝 Extracted patterns: ${patterns.join(', ')}`);
    console.log(`🎯 User categorized as: ${userCategory}${userSubcategory ? ` > ${userSubcategory}` : ''}`);

    // Find all similar transactions that haven't been manually categorized
    const { data: similarTransactions, error: similarError } = await supabase
      .from('transactions')
      .select('id, description, category, subcategory')
      .neq('id', transactionId); // Exclude the original transaction

    if (similarError || !similarTransactions) {
      console.log('Could not fetch similar transactions');
      return { success: true, similarUpdated: 0, patternLearned: patterns.join(', ') };
    }

    // Filter for truly similar transactions using pattern matching
    const matchingTransactions = similarTransactions.filter(t => {
      return patterns.some(pattern => 
        t.description.toUpperCase().includes(pattern) ||
        smartMatch(t.description, [pattern])
      );
    });

    console.log(`🔍 Found ${matchingTransactions.length} similar transactions to update`);

    // Update all similar transactions
    let updatedCount = 0;
    if (matchingTransactions.length > 0) {
      const updates = matchingTransactions.map(t => {
        console.log(`  📝 Updating: "${t.description.substring(0, 50)}..." -> ${userCategory}${userSubcategory ? ` > ${userSubcategory}` : ''}`);
        return supabase
          .from('transactions')
          .update({ 
            category: userCategory,
            subcategory: userSubcategory || null
          })
          .eq('id', t.id);
      });

      await Promise.all(updates);
      updatedCount = matchingTransactions.length;
    }

    // Store the learning data in AI learning engine (if database table exists)
    try {
      const { error: learningError } = await supabase
        .from('ai_learned_patterns')
        .insert({
          pattern: patterns[0] || transaction.description.substring(0, 50), // Use the strongest pattern
          category: userCategory,
          subcategory: userSubcategory || null,
          confidence: 0.9, // High confidence for user-provided data
          occurrences: updatedCount + 1,
          created_at: new Date().toISOString(),
          last_seen: new Date().toISOString()
        });

      if (learningError) {
        // Try to update existing pattern instead
        const { error: updatePatternError } = await supabase
          .from('ai_learned_patterns')
          .update({
            confidence: 0.9,
            occurrences: updatedCount + 1,
            last_seen: new Date().toISOString()
          })
          .eq('pattern', patterns[0] || transaction.description.substring(0, 50))
          .eq('category', userCategory);

        if (updatePatternError) {
          console.log('Note: Could not store/update AI learning pattern:', updatePatternError.message);
        }
      }
    } catch (aiError) {
      console.log('Note: AI learning table may not exist yet');
    }

    // Store the categorization feedback
    try {
      const { error: feedbackError } = await supabase
        .from('categorization_feedback')
        .insert({
          transaction_id: transactionId,
          original_description: transaction.description,
          user_category: userCategory,
          user_subcategory: userSubcategory || null,
          similar_updated: updatedCount,
          patterns_learned: patterns.join(', '),
          created_at: new Date().toISOString()
        });

      if (feedbackError) {
        console.log('Note: Could not store categorization feedback:', feedbackError.message);
      }
    } catch (feedbackError) {
      console.log('Note: Categorization feedback table may not exist yet');
    }

    console.log(`✅ Successfully learned pattern and updated ${updatedCount + 1} total transactions`);
    return { 
      success: true, 
      similarUpdated: updatedCount, 
      patternLearned: patterns.join(', ')
    };
  } catch (error) {
    console.error('Error in learning from user feedback:', error);
    return { success: false, similarUpdated: 0, patternLearned: '' };
  }
};

// Extract key patterns from transaction description for learning
const extractKeyPatterns = (description: string): string[] => {
  const patterns: string[] = [];
  const normalized = description.toUpperCase().replace(/[^A-Z0-9\s]/g, ' ').trim();
  
  // Split into words and filter meaningful ones
  const words = normalized.split(/\s+/).filter(word => 
    word.length > 2 && 
    !['THE', 'AND', 'FOR', 'WITH', 'FROM', 'PURCHASE', 'DEBIT', 'CREDIT'].includes(word)
  );
  
  // Company/merchant names (often the first significant word)
  if (words.length > 0) {
    patterns.push(words[0]);
  }
  
  // Look for common business patterns
  const businessPatterns = [
    'STARBUCKS', 'MCDONALD', 'UBER', 'COINBASE', 'GRUBHUB', 'PAYPAL',
    'AMAZON', 'APPLE', 'NETFLIX', 'SPOTIFY', 'FRESH&CO', 'FRESH & CO',
    'CVS', 'WALGREENS', 'TARGET', 'WALMART', 'COSTCO'
  ];
  
  businessPatterns.forEach(pattern => {
    if (normalized.includes(pattern)) {
      patterns.push(pattern);
    }
  });
  
  // Look for multi-word company names
  for (let i = 0; i < words.length - 1; i++) {
    const twoWordPattern = `${words[i]} ${words[i + 1]}`;
    if (twoWordPattern.length > 6) {
      patterns.push(twoWordPattern);
    }
  }
  
  // Remove duplicates and return most specific patterns first
  return [...new Set(patterns)].slice(0, 3);
};

// Auto-learn from similar transactions (enhanced for subcategories)
const autoLearnFromSimilarTransactions = async (): Promise<void> => {
  console.log('🧠 Auto-learning from similar transactions...');
  
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('id, description, category, subcategory')
    .neq('category', 'General')
    .limit(1000);

  if (error || !transactions) {
    console.log('Could not fetch transactions for auto-learning');
    return;
  }

  // Group transactions by category and subcategory to find patterns
  const categoryGroups: { [key: string]: string[] } = {};
  transactions.forEach(t => {
    const key = `${t.category}${t.subcategory ? `>${t.subcategory}` : ''}`;
    if (!categoryGroups[key]) {
      categoryGroups[key] = [];
    }
    categoryGroups[key].push(t.description);
  });

  // Extract common patterns from each category/subcategory combination
  for (const categoryKey in categoryGroups) {
    const descriptions = categoryGroups[categoryKey];
    const commonWords = extractCommonWords(descriptions);
    
    if (commonWords.length > 0) {
      console.log(`📚 Found ${commonWords.length} patterns for ${categoryKey}`);
      
      // Add learned patterns to rules (in memory for this session)
      const [category, subcategory] = categoryKey.split('>');
      if (!ENHANCED_CATEGORY_RULES[category]) {
        ENHANCED_CATEGORY_RULES[category] = [];
      }
      
      commonWords.forEach(word => {
        if (!ENHANCED_CATEGORY_RULES[category].includes(word)) {
          ENHANCED_CATEGORY_RULES[category].push(word);
        }
      });
    }
  }
};

// Extract common words from transaction descriptions
const extractCommonWords = (descriptions: string[]): string[] => {
  const wordCounts: { [word: string]: number } = {};
  
  descriptions.forEach(desc => {
    const words = desc.toUpperCase()
      .replace(/[^A-Z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3); // Only words longer than 3 characters
    
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
  });
  
  // Return words that appear in at least 30% of descriptions
  const threshold = Math.max(2, Math.floor(descriptions.length * 0.3));
  return Object.keys(wordCounts).filter(word => wordCounts[word] >= threshold);
};

// Main categorization function (enhanced for subcategories)
export const categorizeTransactions = async (): Promise<{
  total: number;
  categorized: Record<string, number>;
  subcategorized: Record<string, number>;
  uncategorized: number;
}> => {
  console.log('🤖 Starting smart categorization with subcategories...');
  
  // First, auto-learn from existing categorized transactions
  await autoLearnFromSimilarTransactions();
  
  console.log('Fetching uncategorized transactions from Supabase...');

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('id, description, category, subcategory')
    .or('category.is.null,category.eq.General,category.eq.Uncategorized');

  if (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }

  if (!transactions || transactions.length === 0) {
    console.log('No transactions to categorize.');
    return { total: 0, categorized: {}, subcategorized: {}, uncategorized: 0 };
  }

  console.log(`Found ${transactions.length} transactions to categorize.`);

  // Track categorization results
  const categoryStats: Record<string, number> = {};
  const subcategoryStats: Record<string, number> = {};
  let generalCount = 0;

  const updates = transactions.map(t => {
    const { category, subcategory } = getCategoryAndSubcategory(t.description);
    
    // Track stats
    if (category === 'General') {
      generalCount++;
    } else {
      categoryStats[category] = (categoryStats[category] || 0) + 1;
      const subcatKey = `${category} > ${subcategory}`;
      subcategoryStats[subcatKey] = (subcategoryStats[subcatKey] || 0) + 1;
    }

    console.log(`  - ID ${t.id}: ${t.description.substring(0, 50)}... -> ${category} > ${subcategory}`);
    return supabase
      .from('transactions')
      .update({ 
        category: category,
        subcategory: subcategory
      })
      .eq('id', t.id);
  });

  console.log('Updating categories and subcategories in Supabase...');
  await Promise.all(updates);

  console.log('🎯 Smart categorization with subcategories complete!');
  
  return {
    total: transactions.length,
    categorized: categoryStats,
    subcategorized: subcategoryStats,
    uncategorized: generalCount
  };
};

// Get subcategory structure for frontend
// Learn from negative feedback (when users deselect transactions in preview)
export const learnFromNegativeFeedback = async (
  selectedTransactionId: string,
  deselectedTransactionIds: string[],
  category: string,
  subcategory?: string
): Promise<{ success: boolean; patternsLearned: number }> => {
  try {
    // Get the selected transaction
    const { data: selectedTransaction, error: selectedError } = await supabase
      .from('transactions')
      .select('description')
      .eq('id', selectedTransactionId)
      .single();

    if (selectedError || !selectedTransaction) {
      console.error('Error fetching selected transaction:', selectedError);
      return { success: false, patternsLearned: 0 };
    }

    // Get the deselected transactions
    const { data: deselectedTransactions, error: deselectedError } = await supabase
      .from('transactions')
      .select('id, description')
      .in('id', deselectedTransactionIds);

    if (deselectedError || !deselectedTransactions) {
      console.error('Error fetching deselected transactions:', deselectedError);
      return { success: false, patternsLearned: 0 };
    }

    console.log(`🧠 Learning from negative feedback:`);
    console.log(`✅ Selected: "${selectedTransaction.description.substring(0, 50)}..."`);
    console.log(`❌ Deselected: ${deselectedTransactions.length} transactions`);

    // Use AI learning engine for sophisticated negative learning
    const { aiLearningEngine } = await import('./services/ai-learning-engine');
    
    let patternsLearned = 0;
    
    // Learn from each deselected transaction
    for (const deselectedTx of deselectedTransactions) {
      await aiLearningEngine.learnFromNegativeFeedback(
        selectedTransaction.description,
        deselectedTx.description,
        category,
        subcategory
      );
      patternsLearned++;
      
      console.log(`📉 Learned negative pattern from: "${deselectedTx.description.substring(0, 50)}..."`);
    }

    console.log(`✅ Learned ${patternsLearned} negative patterns for category: ${category}${subcategory ? ` > ${subcategory}` : ''}`);
    
    return { success: true, patternsLearned };
  } catch (error) {
    console.error('Error learning from negative feedback:', error);
    return { success: false, patternsLearned: 0 };
  }
};

export const getSubcategoryStructure = () => {
  return SUBCATEGORY_STRUCTURE;
}; 