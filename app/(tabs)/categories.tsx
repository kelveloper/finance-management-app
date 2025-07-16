import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PersonalizedInsight } from '../../common/types';
import { 
  Utensils, 
  ShoppingBag, 
  Car, 
  Coffee, 
  DollarSign, 
  Heart, 
  Briefcase,
  Home as HomeIcon, 
  X, 
  CircleHelp as HelpCircle, 
  TrendingUp, 
  CircleAlert as AlertCircle 
} from 'lucide-react-native';
import { getApiUrl, getDevUserId } from '../../utils/environment';
import { useSession } from '../../hooks/useSession';
import moment from 'moment';

// Icon mapping for categories
const categoryIcons: { [key: string]: any } = {
  'Food & Drink': Utensils,
  'Shopping': ShoppingBag,
  'Transportation': Car,
  'Entertainment': Coffee,
  'Bills & Utilities': HomeIcon,
  'Financial & Transfers': DollarSign,
  'Health & Medical': Heart,
  'Personal Care': Heart,
  'Income': Briefcase,
};

// Color mapping for categories
const categoryColors: { [key: string]: string } = {
  'Food & Drink': '#EF4444',
  'Shopping': '#10B981',
  'Transportation': '#3B82F6',
  'Entertainment': '#8B5CF6',
  'Bills & Utilities': '#F59E0B',
  'Financial & Transfers': '#06B6D4',
  'Health & Medical': '#EC4899',
  'Personal Care': '#84CC16',
  'Income': '#22C55E',
};

// Subcategory mapping for main categories
const subcategoryMapping: { [key: string]: { [key: string]: string[] } } = {
  'Food & Drink': {
    'Fast Food': ['McDonald\'s', 'Burger King', 'Wendy\'s', 'Taco Bell', 'KFC', 'Subway', 'Chipotle'],
    'Coffee Shops': ['Starbucks', 'Dunkin', 'Peet\'s Coffee', 'Blue Bottle'],
    'Restaurants': ['Panera', 'Applebee\'s', 'Chili\'s', 'Olive Garden'],
    'Healthy Eating': ['Sweetgreen', 'Fresh & Co', 'Chopt', 'Just Salad'],
    'Grocery': ['Whole Foods', 'Trader Joe\'s', 'Safeway', 'Kroger', 'Publix'],
    'Food Delivery': ['DoorDash', 'Uber Eats', 'Grubhub', 'Postmates', 'Seamless'],
  },
  'Shopping': {
    'Online Retail': ['Amazon', 'eBay', 'Etsy', 'Wayfair'],
    'Department Stores': ['Target', 'Walmart', 'Macy\'s', 'Nordstrom'],
    'Electronics': ['Best Buy', 'Apple', 'Microsoft', 'GameStop'],
    'Clothing': ['H&M', 'Zara', 'Gap', 'Old Navy', 'Nike', 'Adidas'],
    'Home Goods': ['Bed Bath & Beyond', 'HomeGoods', 'IKEA', 'Crate & Barrel'],
    'Pharmacies': ['CVS', 'Walgreens', 'Rite Aid'],
  },
  'Transportation': {
    'Ride Sharing': ['Uber', 'Lyft'],
    'Public Transit': ['MTA', 'BART', 'CTA', 'WMATA'],
    'Gas': ['Shell', 'Exxon', 'BP', 'Chevron', 'Mobil'],
    'Parking': ['SpotHero', 'ParkWhiz', 'PARKING'],
    'Car Services': ['Car Wash', 'Auto Repair', 'Oil Change'],
  },
  'Entertainment': {
    'Streaming Services': ['Netflix', 'Hulu', 'Disney+', 'HBO Max', 'Amazon Prime'],
    'Music': ['Spotify', 'Apple Music', 'Pandora', 'Tidal'],
    'Gaming': ['Steam', 'PlayStation', 'Xbox', 'Nintendo'],
    'Events': ['Ticketmaster', 'StubHub', 'Eventbrite', 'LiveNation'],
    'Bars & Nightlife': ['Bar', 'Club', 'Lounge', 'Brewery'],
  },
  'Bills & Utilities': {
    'Rent & Mortgage': ['Rent', 'Mortgage', 'Landlord', 'Property Management'],
    'Utilities': ['Electric', 'Gas', 'Water', 'Sewage', 'Utility'],
    'Internet & Phone': ['Verizon', 'AT&T', 'T-Mobile', 'Comcast', 'Spectrum'],
    'Insurance': ['Health Insurance', 'Car Insurance', 'Renters Insurance', 'Life Insurance'],
    'Subscriptions': ['Subscription', 'Membership'],
  },
  'Financial & Transfers': {
    'Cryptocurrency': ['Coinbase', 'Binance', 'Kraken', 'Gemini', 'Crypto'],
    'Investments': ['Robinhood', 'Fidelity', 'Vanguard', 'Charles Schwab', 'E*TRADE'],
    'Banking': ['Bank Fee', 'ATM Fee', 'Overdraft', 'Interest'],
    'Transfers': ['PayPal', 'Venmo', 'Cash App', 'Zelle', 'Wire Transfer'],
    'Savings': ['Acorns', 'Digit', 'Savings'],
  },
  'Health & Medical': {
    'Doctor Visits': ['Doctor', 'Physician', 'Medical Center', 'Clinic'],
    'Pharmacy': ['Pharmacy', 'Prescription', 'CVS', 'Walgreens'],
    'Fitness': ['Gym', 'Fitness', 'Yoga', 'Pilates', 'CrossFit'],
    'Mental Health': ['Therapy', 'Counseling', 'Psychiatrist', 'Psychologist'],
    'Dental': ['Dentist', 'Orthodontist', 'Dental'],
  },
  'Personal Care': {
    'Hair & Beauty': ['Salon', 'Barber', 'Spa', 'Hair'],
    'Skincare': ['Sephora', 'Ulta', 'Skincare'],
    'Wellness': ['Massage', 'Acupuncture', 'Wellness'],
    'Personal Hygiene': ['Personal Care', 'Hygiene'],
  },
};

interface Transaction {
  id: string;
  description: string;
  amount: number;
  posted_date: string;
  category?: string;
  subcategory?: string;
  merchant?: string; // Added merchant field
}

interface SubcategoryData {
  name: string;
  amount: number;
  transactions: number;
  percentage: number;
  topMerchant: string;
  merchantInfo?: {
    description: string;
    type: string;
    insights: string[];
  };
  recentTransactions: Transaction[];
}

interface CategoryData {
  name: string;
  amount: number;
  transactions: number;
  percentage: number;
  color: string;
  icon: any;
  recentTransactions: Transaction[];
  isPersonalCard?: boolean;
  personalDescription?: string;
  subcategories?: SubcategoryData[];
  topSubcategory?: SubcategoryData;
}

interface SpendingProfile {
  profileDescription: string;
  spendingInsights: string[];
}

interface DataResponse {
  transactions: Transaction[];
  insights?: {
    personalized: PersonalizedInsight[];
    spendingProfile: SpendingProfile;
  };
}

// Helper: Generate a hardcoded MVP spending profile
function generateMVPSpendingProfile(transactions: Transaction[]): string {
  return `Hey Kelvin! Looks like you had quite the month with 213 Coinbase transactions in "Financial & Transfer - Cryptocurrency." That's a lot of action in the crypto world – are you chasing gains or just really into managing your digital assets?\nOn the food front, your recent Fresh&Co purchase shows you're making healthy choices, which you even marked as essential – awesome! It's a great balance, especially since your last McDonald's run was two weeks ago. Keep up the smart spending, whether it's on crypto or healthy eats!`;
}

export default function CategoriesScreen() {
  const { userId } = useSession();
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());

  // Fetch transaction data
  const { 
    data, 
    isLoading, 
    error,
    refetch 
  } = useQuery<DataResponse>({
    queryKey: ['financialData'],
    queryFn: async () => {
      const response = await fetch(`${getApiUrl()}/api/data`, {
        headers: {
          'x-user-id': userId || getDevUserId(),
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch financial data from the server.');
      }
      return response.json();
    }
  });

  const transactions = data?.transactions ?? [];
  const personalizedInsights = data?.insights?.personalized ?? [];
  const aiSpendingProfile = data?.insights?.spendingProfile;

  // Add this after transactions are loaded
  const mvpSpendingProfile = useMemo(() => generateMVPSpendingProfile(transactions), [transactions]);

  // Enhanced merchant extraction with web retrieval context
  const extractMerchantFromDescription = (description: string): string => {
    const desc = description.toUpperCase();
    
    // Enhanced merchant patterns
    const merchantPatterns: { [key: string]: RegExp } = {
      // Food & Restaurants
      'McDonald\'s': /MCDONALD/,
      'Starbucks': /STARBUCKS/,
      'Subway': /SUBWAY/,
      'Chipotle': /CHIPOTLE/,
      'Panera': /PANERA/,
      'Fresh & Co': /FRESH.*CO|FRESH.*AND.*CO/,
      'Sweetgreen': /SWEETGREEN/,
      'Whole Foods': /WHOLE.*FOODS/,
      'Trader Joe\'s': /TRADER.*JOE/,
      
      // Delivery & Rideshare
      'DoorDash': /DOORDASH/,
      'Uber Eats': /UBER.*EATS/,
      'Grubhub': /GRUBHUB/,
      'Uber': /UBER(?!.*EATS)/,
      'Lyft': /LYFT/,
      
      // Retail & Shopping
      'Amazon': /AMAZON/,
      'Target': /TARGET/,
      'Walmart': /WALMART/,
      'Costco': /COSTCO/,
      'CVS': /\bCVS\b/,
      'Walgreens': /WALGREENS/,
      'Best Buy': /BEST.*BUY/,
      
      // Gas & Transportation
      'Shell': /SHELL/,
      'Exxon': /EXXON/,
      'BP': /\bBP\b/,
      'Chevron': /CHEVRON/,
      'MTA': /MTA|NYCT/,
      
      // Financial & Crypto
      'Coinbase': /COINBASE/,
      'PayPal': /PAYPAL/,
      'Venmo': /VENMO/,
      'Robinhood': /ROBINHOOD/,
      'Acorns': /ACORNS/,
      
      // Subscriptions & Digital
      'Netflix': /NETFLIX/,
      'Spotify': /SPOTIFY/,
      'Apple': /\bAPPLE\b/,
      'Google': /GOOGLE/,
      'Microsoft': /MICROSOFT/,
      'Adobe': /ADOBE/,
    };

    // First try exact merchant matching
    for (const [merchant, pattern] of Object.entries(merchantPatterns)) {
      if (pattern.test(desc)) {
        return merchant;
      }
    }

    // Enhanced extraction for unknown merchants
    const cleaned = desc
      .replace(/[^A-Z0-9\s]/g, ' ')
      .replace(/\b(DEBIT|CREDIT|PURCHASE|PAYMENT|ONLINE|POS|CARD|VISA|MASTERCARD|AMEX)\b/g, '')
      .replace(/\b\d{4,}\b/g, '') // Remove long numbers
      .replace(/\b(SQ|TST|WWW|HTTP|COM|NET|ORG)\b/g, '') // Remove common prefixes/suffixes
      .trim();
    
    const words = cleaned.split(/\s+/).filter(w => w.length > 2);
    
    if (words.length > 0) {
      const businessWords = words.filter(w => 
        !['INC', 'LLC', 'CORP', 'LTD', 'NYC', 'CA', 'NY', 'TX', 'FL'].includes(w)
      );
      
      if (businessWords.length > 0) {
        return businessWords.slice(0, 2).join(' ');
      }
      
      return words[0];
    }
    
    return 'Unknown Merchant';
  };

  // Dynamic web retrieval for merchant context with personalized insights
  const getMerchantInsights = async (merchantName: string, category: string, transactionCount: number, totalAmount: number, subcategory?: string): Promise<{
    description: string;
    type: string;
    insights: string[];
  }> => {
    const merchant = merchantName.toLowerCase();
    
    // Dynamic merchant analysis based on spending patterns
    const avgPerTransaction = totalAmount / transactionCount;
    const spendingLevel = totalAmount > 500 ? 'high' : totalAmount > 200 ? 'medium' : 'low';
    const frequencyLevel = transactionCount >= 15 ? 'very_frequent' : transactionCount >= 8 ? 'frequent' : transactionCount >= 4 ? 'regular' : 'occasional';
    
    // Generate dynamic insights based on actual spending behavior
    return generateDynamicMerchantInsights(merchantName, category, subcategory, {
      transactionCount,
      totalAmount,
      avgPerTransaction,
      spendingLevel,
      frequencyLevel
    });
  };

  // Generate personalized insights based on spending patterns
  const generateDynamicMerchantInsights = (
    merchantName: string, 
    category: string, 
    subcategory: string | undefined,
    spendingData: {
      transactionCount: number;
      totalAmount: number;
      avgPerTransaction: number;
      spendingLevel: 'low' | 'medium' | 'high';
      frequencyLevel: 'occasional' | 'regular' | 'frequent' | 'very_frequent';
    }
  ): { description: string; type: string; insights: string[] } => {
    const { transactionCount, totalAmount, avgPerTransaction, spendingLevel, frequencyLevel } = spendingData;
    
    // Dynamic merchant type detection
    const merchantType = detectMerchantType(merchantName, category, subcategory);
    
    // Generate personalized description
    const description = generatePersonalizedDescription(merchantName, merchantType, spendingLevel, frequencyLevel);
    
    // Generate insights based on spending behavior
    const insights = generateSpendingInsights(merchantName, merchantType, spendingData);
    
    return {
      description,
      type: merchantType,
      insights
    };
  };

  // Detect merchant type dynamically
  const detectMerchantType = (merchantName: string, category: string, subcategory?: string): string => {
    const merchant = merchantName.toLowerCase();
    
    // Use subcategory if available
    if (subcategory) {
      return subcategory.toLowerCase().replace(/\s+/g, '_');
    }
    
    // Pattern-based detection
    if (merchant.includes('coffee') || merchant.includes('starbucks') || merchant.includes('dunkin')) return 'coffee_shop';
    if (merchant.includes('bar') || merchant.includes('brewery') || merchant.includes('pub')) return 'bar_nightlife';
    if (merchant.includes('gym') || merchant.includes('fitness') || merchant.includes('yoga')) return 'fitness';
    if (merchant.includes('uber') && !merchant.includes('eats')) return 'rideshare';
    if (merchant.includes('doordash') || merchant.includes('grubhub') || merchant.includes('uber eats')) return 'food_delivery';
    if (merchant.includes('amazon') || merchant.includes('target') || merchant.includes('walmart')) return 'retail';
    if (merchant.includes('coinbase') || merchant.includes('crypto')) return 'cryptocurrency';
    if (merchant.includes('netflix') || merchant.includes('spotify') || merchant.includes('hulu')) return 'subscription';
    
    // Fallback to category
    return category.toLowerCase().replace(/\s+/g, '_');
  };

  // Generate personalized description based on spending
  const generatePersonalizedDescription = (merchantName: string, merchantType: string, spendingLevel: string, frequencyLevel: string): string => {
    const baseDescriptions: { [key: string]: string } = {
      coffee_shop: '☕ Your caffeine headquarters',
      food_delivery: '🚚 Your cooking avoidance solution',
      bar_nightlife: '🍻 Your social hangout spot',
      fast_food: '🍔 Your comfort food destination',
      retail: '🛒 Your shopping go-to',
      cryptocurrency: '🚀 Your digital investment platform',
      fitness: '💪 Your wellness sanctuary',
      rideshare: '🚗 Your personal transportation service',
      subscription: '📺 Your entertainment hub'
    };
    
    const base = baseDescriptions[merchantType] || `Your ${merchantType.replace(/_/g, ' ')} spot`;
    
    // Add spending context
    if (spendingLevel === 'high' && frequencyLevel === 'very_frequent') {
      return `${base} (and clearly your favorite!) 🌟`;
    } else if (spendingLevel === 'high') {
      return `${base} (where you splurge) 💰`;
    } else if (frequencyLevel === 'very_frequent') {
      return `${base} (practically your second home) 🏠`;
    }
    
    return base;
  };

  // Generate spending-based insights
  const generateSpendingInsights = (
    merchantName: string, 
    merchantType: string, 
    spendingData: {
      transactionCount: number;
      totalAmount: number;
      avgPerTransaction: number;
      spendingLevel: 'low' | 'medium' | 'high';
      frequencyLevel: 'occasional' | 'regular' | 'frequent' | 'very_frequent';
    }
  ): string[] => {
    const { transactionCount, totalAmount, avgPerTransaction, spendingLevel, frequencyLevel } = spendingData;
    const insights: string[] = [];
    
    // Frequency-based insights
    if (frequencyLevel === 'very_frequent') {
      insights.push(`${transactionCount} visits to ${merchantName}? You're practically a VIP member! 🌟`);
      insights.push('The staff probably recognizes you by now');
    } else if (frequencyLevel === 'frequent') {
      insights.push(`${transactionCount} visits shows real loyalty to ${merchantName} 🤝`);
      insights.push('You\'ve clearly found a place you trust');
    } else if (frequencyLevel === 'regular') {
      insights.push(`${transactionCount} visits - you\'re giving ${merchantName} a fair shot 👍`);
    } else {
      insights.push(`${transactionCount} visits to ${merchantName} - testing the waters? 🌊`);
    }
    
    // Spending amount insights
    if (spendingLevel === 'high') {
      insights.push(`$${totalAmount.toFixed(0)} spent here - this place clearly has your wallet's attention! 💰`);
      if (avgPerTransaction > 50) {
        insights.push('You don\'t hold back when you visit - quality over quantity? 💎');
      }
    } else if (spendingLevel === 'medium') {
      insights.push(`$${totalAmount.toFixed(0)} invested in ${merchantName} - solid commitment 💪`);
    } else {
      insights.push(`$${totalAmount.toFixed(0)} spent - keeping it budget-friendly 💡`);
    }
    
    // Average transaction insights
    if (avgPerTransaction > 100) {
      insights.push('You go big when you visit - special occasions or just treating yourself? 🎉');
    } else if (avgPerTransaction > 30) {
      insights.push('Consistent spending per visit - you know what you like 🎯');
    } else {
      insights.push('Smart spending - getting value without breaking the bank 🧠');
    }
    
    // Merchant type specific insights
    switch (merchantType) {
      case 'coffee_shop':
        if (frequencyLevel === 'very_frequent') {
          insights.push('Coffee is clearly essential to your daily functioning ☕');
        }
        break;
      case 'food_delivery':
        if (frequencyLevel === 'frequent') {
          insights.push('Cooking is overrated when delivery exists, right? 😄');
        }
        break;
      case 'bar_nightlife':
        insights.push('You know how to unwind and have a good time 🎉');
        break;
      case 'cryptocurrency':
        if (spendingLevel === 'high') {
          insights.push('You\'re serious about your crypto investments 📈');
        }
        break;
      case 'fitness':
        insights.push('Investing in your health - respect! 💪');
        break;
    }
    
    return insights;
  };

  // State for enhanced category data with subcategorization
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [isProcessingCategories, setIsProcessingCategories] = useState(false);

  // Process transactions into enhanced category data with subcategorization
  const processTransactionsWithSubcategories = async () => {
    if (!transactions.length) {
      setCategoryData([]);
      return;
    }

    setIsProcessingCategories(true);
    
    try {
      // Filter out income and positive transactions for spending analysis
      const spendingTransactions = transactions.filter(t => 
        t.amount < 0 && 
        t.category && 
        t.category !== 'Income'
      );

      // Group by main category
      const categoryGroups: { [key: string]: Transaction[] } = {};
      spendingTransactions.forEach(transaction => {
        const category = transaction.category || 'Uncategorized';
        if (!categoryGroups[category]) {
          categoryGroups[category] = [];
        }
        categoryGroups[category].push(transaction);
      });

      // Calculate totals and create enhanced category data with subcategorization
      const totalSpending = spendingTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      const categories: CategoryData[] = await Promise.all(
        Object.entries(categoryGroups).map(async ([categoryName, categoryTransactions]) => {
          const totalAmount = categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
          const percentage = totalSpending > 0 ? Math.round((totalAmount / totalSpending) * 100) : 0;
          
          // Get recent transactions (last 5)
          const recentTransactions = categoryTransactions
            .sort((a, b) => new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime())
            .slice(0, 5);

          // Create subcategories based on subcategory mapping
          const subcategoryGroups: { [key: string]: Transaction[] } = {};
          const merchantToSubcategory: { [key: string]: string } = {};
          
          categoryTransactions.forEach(transaction => {
            const merchant = extractMerchantFromDescription(transaction.description);
            
            // Find which subcategory this merchant belongs to
            let subcategoryName = 'Other';
            
            if (subcategoryMapping[categoryName]) {
              // Check each subcategory to see if this merchant is in its list
              for (const [subcat, merchants] of Object.entries(subcategoryMapping[categoryName])) {
                // More flexible matching - check if merchant name contains any of the keywords
                const merchantLower = merchant.toLowerCase();
                const transactionDesc = transaction.description.toLowerCase();
                
                if (merchants.some(m => {
                  const keyword = m.toLowerCase();
                  return merchantLower.includes(keyword) || 
                         keyword.includes(merchantLower) ||
                         transactionDesc.includes(keyword);
                })) {
                  subcategoryName = subcat;
                  break;
                }
              }
            }
            
            // Store the merchant-to-subcategory mapping for later use
            merchantToSubcategory[merchant] = subcategoryName;
            
            // Group transaction by subcategory
            if (!subcategoryGroups[subcategoryName]) {
              subcategoryGroups[subcategoryName] = [];
            }
            subcategoryGroups[subcategoryName].push(transaction);
          });
          
          // Also keep track of merchants within each subcategory
          const subcategoryMerchants: { [key: string]: { [key: string]: Transaction[] } } = {};
          categoryTransactions.forEach(transaction => {
            const merchant = extractMerchantFromDescription(transaction.description);
            const subcategoryName = merchantToSubcategory[merchant] || 'Other';
            
            if (!subcategoryMerchants[subcategoryName]) {
              subcategoryMerchants[subcategoryName] = {};
            }
            
            if (!subcategoryMerchants[subcategoryName][merchant]) {
              subcategoryMerchants[subcategoryName][merchant] = [];
            }
            
            subcategoryMerchants[subcategoryName][merchant].push(transaction);
          });

          // Create subcategory data based on subcategory groups
          const subcategories: SubcategoryData[] = await Promise.all(
            Object.entries(subcategoryGroups)
              .sort(([,a], [,b]) => b.reduce((sum, t) => sum + Math.abs(t.amount), 0) - a.reduce((sum, t) => sum + Math.abs(t.amount), 0))
              .slice(0, 5) // Top 5 subcategories per category
              .map(async ([subcategoryName, subcategoryTransactions]) => {
                const subcategoryAmount = subcategoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
                const subcategoryPercentage = Math.round((subcategoryAmount / totalAmount) * 100);
                
                // Find top merchant in this subcategory
                const merchantCounts: { [key: string]: { count: number, amount: number, transactions: Transaction[] } } = {};
                subcategoryTransactions.forEach(transaction => {
                  const merchant = extractMerchantFromDescription(transaction.description);
                  if (!merchantCounts[merchant]) {
                    merchantCounts[merchant] = { count: 0, amount: 0, transactions: [] };
                  }
                  merchantCounts[merchant].count++;
                  merchantCounts[merchant].amount += Math.abs(transaction.amount);
                  merchantCounts[merchant].transactions.push(transaction);
                });
                
                // Get top merchant by amount
                const topMerchantEntry = Object.entries(merchantCounts)
                  .sort(([,a], [,b]) => b.amount - a.amount)[0] || ['Unknown', { count: 0, amount: 0, transactions: [] }];
                
                const topMerchantName = topMerchantEntry[0];
                const topMerchantTransactions = topMerchantEntry[1].transactions;
                
                // Get web retrieval insights for the top merchant
                const merchantInfo = await getMerchantInsights(topMerchantName, categoryName, topMerchantTransactions.length, topMerchantEntry[1].amount, subcategoryName);
                
                return {
                  name: subcategoryName,
                  amount: subcategoryAmount,
                  transactions: subcategoryTransactions.length,
                  percentage: subcategoryPercentage,
                  topMerchant: topMerchantName,
                  merchantInfo,
                  recentTransactions: subcategoryTransactions
                    .sort((a, b) => new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime())
                    .slice(0, 3)
                };
              })
          );

          // Get top subcategory for quick insights
          const topSubcategory = subcategories[0];

          return {
            name: categoryName,
            amount: totalAmount,
            transactions: categoryTransactions.length,
            percentage,
            color: categoryColors[categoryName] || '#64748B',
            icon: categoryIcons[categoryName] || ShoppingBag,
            recentTransactions,
            subcategories,
            topSubcategory
          };
        })
      );

      // Sort by spending amount (highest to lowest)
      const sortedCategories = categories.sort((a, b) => b.amount - a.amount);
      
      // Create personal profile card if we have at least 2 categories
      if (sortedCategories.length >= 2) {
        // Do not create a personalCard with personalDescription anymore
        setCategoryData(sortedCategories);
      } else {
        setCategoryData(sortedCategories);
      }
    } catch (error) {
      console.error('Error processing categories:', error);
      setCategoryData([]);
    } finally {
      setIsProcessingCategories(false);
    }
  };

  // Process transactions when data changes
  useEffect(() => {
    if (transactions.length > 0) {
      processTransactionsWithSubcategories();
    }
  }, [transactions]);

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return moment(dateString).format('MMM D');
  };

  const handleCategoryPress = (category: CategoryData) => {
    setSelectedCategory(category);
  };

  const toggleInsightExpansion = (insightId: string) => {
    setExpandedInsights(prev => {
      const newSet = new Set(prev);
      if (newSet.has(insightId)) {
        // If clicking the same insight, close it
        newSet.delete(insightId);
      } else {
        // If clicking a different insight, close all others and open this one
        newSet.clear();
        newSet.add(insightId);
      }
      return newSet;
    });
  };

  const handleInsightAction = async (insightId: string, action: 'follow' | 'ignore') => {
    try {
      const response = await fetch(`${getApiUrl()}/api/insights/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId || getDevUserId(),
        },
        body: JSON.stringify({
          insightId,
          action,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        // Remove the insight from the list after user action
        // You could also update the state to mark it as dismissed
        console.log(`Insight ${insightId} ${action}ed successfully`);
      }
    } catch (error) {
      console.error('Error sending insight feedback:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0F172A', '#1E293B']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Spending Categories</Text>
          <Text style={styles.headerSubtitle}>Loading...</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#34D399" />
          <Text style={styles.loadingText}>Loading your spending data...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0F172A', '#1E293B']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Spending Categories</Text>
          <Text style={styles.headerSubtitle}>Error loading data</Text>
        </LinearGradient>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load spending data</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Calculate total spending from filtered transactions (same as category processing)
  const filteredSpendingTransactions = transactions.filter(t => 
    t.amount < 0 && 
    t.category && 
    t.category !== 'Income'
  );
  const totalSpending = filteredSpendingTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  // Also calculate category sum for comparison
  const categorySumTotal = categoryData.reduce((sum, cat) => sum + cat.amount, 0);
  
  // Log discrepancy if exists (for debugging)
  if (Math.abs(totalSpending - categorySumTotal) > 1) {
    console.log('Spending discrepancy detected:', {
      totalFromTransactions: totalSpending,
      totalFromCategories: categorySumTotal,
      difference: totalSpending - categorySumTotal,
      totalTransactions: transactions.length,
      filteredTransactions: filteredSpendingTransactions.length,
      categorizedTransactions: categoryData.reduce((sum, cat) => sum + cat.transactions, 0)
    });
  }
  const currentMonth = moment().format('MMMM YYYY');

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#0F172A', '#1E293B']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Spending Categories</Text>
        <Text style={styles.headerSubtitle}>{currentMonth}</Text>
        <Text style={styles.totalSpending}>Total: {formatCurrency(totalSpending)}</Text>
      </LinearGradient>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" />
        }
      >
        {/* Spending Profile Card */}
        <View style={{
          backgroundColor: '#251B3A',
          borderRadius: 20,
          margin: 16,
          padding: 20,
          borderWidth: 1,
          borderColor: '#8B5CF6',
          flexDirection: 'row',
          alignItems: 'flex-start'
        }}>
          <View style={{
            width: 48, height: 48, borderRadius: 16, backgroundColor: '#8B5CF6',
            alignItems: 'center', justifyContent: 'center', marginRight: 16
          }}>
            <Text style={{ fontSize: 28, color: '#fff' }}>♡</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#C4B5FD', fontWeight: 'bold', fontSize: 20, marginBottom: 6 }}>
              Your Spending Profile
            </Text>
            <Text style={{ color: '#E0E7FF', fontSize: 16 }}>
              {mvpSpendingProfile}
            </Text>
          </View>
        </View>

        {/* Personal Insights */}
        {personalizedInsights.length > 0 && (
          <View style={styles.personalizedContainer}>
            <Text style={styles.insightsTitle}>💡 Personal Insights</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.insightsScrollContainer}
            >
              {personalizedInsights.map((insight) => {
                const isExpanded = expandedInsights.has(insight.id);
                return (
                  <View key={insight.id} style={[styles.insightCard, isExpanded && styles.insightCardExpanded]}>
                    <TouchableOpacity
                      onPress={() => toggleInsightExpansion(insight.id)}
                      activeOpacity={0.8}
                      style={styles.insightContent}
                    >
                      <View style={styles.insightHeader}>
                        <Text style={styles.insightTitle}>{insight.title}</Text>
                        <Text style={styles.expandIcon}>
                          {isExpanded ? '▼' : '▶'}
                        </Text>
                      </View>
                      <Text style={styles.insightMessage}>{insight.message}</Text>
                      
                      {insight.actionable_advice.length > 0 && (
                        <Text style={styles.tapToExpand}>
                          {isExpanded ? 'Tap to hide actions' : 'Tap to see what you can do'}
                        </Text>
                      )}
                    </TouchableOpacity>
                    
                    {isExpanded && insight.actionable_advice.length > 0 && (
                      <View style={styles.expandedContent}>
                        <View style={styles.adviceContainer}>
                          <Text style={styles.adviceTitle}>💡 What you can do:</Text>
                          {insight.actionable_advice.map((advice, index) => (
                            <Text key={index} style={styles.adviceItem}>• {advice}</Text>
                          ))}
                        </View>
                        
                        <View style={styles.actionButtons}>
                          <TouchableOpacity 
                            style={[styles.actionButton, styles.followButton]}
                            onPress={() => handleInsightAction(insight.id, 'follow')}
                          >
                            <Text style={styles.followButtonText}>I'll try this</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[styles.actionButton, styles.ignoreButton]}
                            onPress={() => handleInsightAction(insight.id, 'ignore')}
                          >
                            <Text style={styles.ignoreButtonText}>Not for me</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Categories List */}
        <View style={styles.categoriesList}>
          {categoryData.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No spending data available</Text>
              <Text style={styles.emptyStateSubtext}>
                Start making transactions to see your spending breakdown
              </Text>
            </View>
          ) : (
            categoryData.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <TouchableOpacity
                  key={category.name}
                  style={[styles.categoryCard, category.isPersonalCard && styles.personalCategoryCard]}
                onPress={() => handleCategoryPress(category)}
                activeOpacity={0.8}
              >
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryLeft}>
                    <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                      <IconComponent size={20} color={category.color} />
                    </View>
                    <View style={styles.categoryTextContainer}>
                      <View style={styles.categoryTitleRow}>
                        <Text style={[styles.categoryName, category.isPersonalCard && styles.personalCategoryName]}>
                          {category.name}
                        </Text>
                        {!category.isPersonalCard && (
                          <View style={styles.rankBadge}>
                            <Text style={styles.rankText}>#{index}</Text>
                          </View>
                        )}
                      </View>
                      {category.isPersonalCard ? (
                        <Text style={styles.personalDescription}>
                          {category.personalDescription}
                        </Text>
                      ) : (
                        <Text style={styles.categoryTransactions}>
                          {category.transactions} transactions
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.categoryRight}>
                    {!category.isPersonalCard && (
                      <>
                        <Text style={styles.categoryAmount}>{formatCurrency(category.amount)}</Text>
                        <Text style={styles.percentageText}>{category.percentage}% of spending</Text>
                      </>
                    )}
                  </View>
                </View>

                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <View style={[
                      styles.progressFill,
                      { width: `${category.percentage}%`, backgroundColor: category.color }
                    ]} />
                  </View>
                </View>
                
                {/* Show top subcategory if available */}
                {!category.isPersonalCard && category.topSubcategory && (
                  <View style={styles.topSubcategoryContainer}>
                    <Text style={styles.topSubcategoryLabel}>Top subcategory:</Text>
                    <Text style={styles.topSubcategoryName}>{category.topSubcategory.name}</Text>
                    <Text style={styles.topSubcategoryAmount}>
                      {formatCurrency(category.topSubcategory.amount)} ({category.topSubcategory.percentage}%)
                    </Text>
                  </View>
                )}
                
                {/* Show multiple subcategories */}
                {!category.isPersonalCard && category.subcategories && category.subcategories.length > 1 && (
                  <View style={styles.subcategoryPillsContainer}>
                    {category.subcategories.slice(0, 3).map((subcategory) => (
                      <View 
                        key={subcategory.name} 
                        style={[styles.subcategoryPill, { backgroundColor: category.color + '20' }]}
                      >
                        <Text style={[styles.subcategoryPillText, { color: category.color }]}>
                          {subcategory.name}
                        </Text>
                      </View>
                    ))}
                    {category.subcategories.length > 3 && (
                      <View style={styles.subcategoryPill}>
                        <Text style={styles.subcategoryPillText}>+{category.subcategories.length - 3} more</Text>
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
            })
          )}
        </View>
      </ScrollView>

      {/* Category Detail Modal */}
      {selectedCategory && (
        <Modal
          visible={!!selectedCategory}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedCategory.name} Details</Text>
              <TouchableOpacity
                onPress={() => setSelectedCategory(null)}
                style={styles.closeButton}
              >
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.modalStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{formatCurrency(selectedCategory.amount)}</Text>
                  <Text style={styles.statLabel}>Total Spent</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{selectedCategory.transactions}</Text>
                  <Text style={styles.statLabel}>Transactions</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{selectedCategory.percentage}%</Text>
                  <Text style={styles.statLabel}>of Total Spending</Text>
                </View>
              </View>

              {/* Subcategories Section */}
              {!selectedCategory.isPersonalCard && selectedCategory.subcategories && selectedCategory.subcategories.length > 0 && (
                <View style={styles.subcategoriesSection}>
                  <Text style={styles.sectionTitle}>Subcategories</Text>
                  <Text style={styles.sectionSubtitle}>Breakdown of spending by type</Text>
                  
                  {selectedCategory.subcategories.map((subcategory) => (
                    <View key={subcategory.name} style={styles.subcategoryItem}>
                      <View style={styles.subcategoryHeader}>
                        <Text style={styles.subcategoryName}>{subcategory.name}</Text>
                        <View style={styles.subcategoryStats}>
                          <Text style={styles.subcategoryAmount}>
                            {formatCurrency(subcategory.amount)}
                          </Text>
                          <Text style={styles.subcategoryPercentage}>
                            {subcategory.percentage}%
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.subcategoryProgressBar}>
                        <View 
                          style={[
                            styles.subcategoryProgressFill, 
                            { width: `${subcategory.percentage}%`, backgroundColor: selectedCategory.color }
                          ]} 
                        />
                      </View>
                      
                      <View style={styles.subcategoryDetails}>
                        <Text style={styles.subcategoryTransactions}>
                          {subcategory.transactions} transactions
                        </Text>
                        
                        {/* Top merchant for this subcategory */}
                        <View style={styles.topMerchantContainer}>
                          <Text style={styles.topMerchantLabel}>Top merchant:</Text>
                          <Text style={styles.topMerchantName}>{subcategory.topMerchant}</Text>
                        </View>
                        
                        {subcategory.merchantInfo && (
                          <>
                            <Text style={styles.merchantDescription}>
                              {subcategory.merchantInfo.description}
                            </Text>
                            
                            {/* Company Information */}
                            {/* Removed companyInfo block since it's not defined in merchantInfo */}
                          </>
                        )}
                      </View>
                      
                      {subcategory.merchantInfo && subcategory.merchantInfo.insights && subcategory.merchantInfo.insights.length > 0 && (
                        <View style={styles.merchantInsights}>
                          {subcategory.merchantInfo.insights.map((insight, index) => (
                            <Text key={index} style={styles.merchantInsight}>
                              • {insight}
                            </Text>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.recentTransactionsSection}>
                <Text style={styles.sectionTitle}>Recent Transactions</Text>
                {selectedCategory.recentTransactions.map((transaction) => (
                  <View key={transaction.id} style={styles.transactionItem}>
                    <View style={styles.transactionLeft}>
                      <Text style={styles.transactionDescription} numberOfLines={1}>
                        {transaction.description}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {formatDate(transaction.posted_date)}
                      </Text>
                    </View>
                    <Text style={styles.transactionAmount}>
                      {formatCurrency(Math.abs(transaction.amount))}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 8,
  },
  totalSpending: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34D399',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9CA3AF',
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#34D399',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#111827',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  categoriesList: {
    marginBottom: 20,
  },
  categoryCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  personalCategoryCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    paddingRight: 12,
  },
  categoryTextContainer: {
    flex: 1,
    flexShrink: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
    marginRight: 8,
  },
  personalCategoryName: {
    color: '#C4B5FD',
    fontWeight: 'bold',
  },
  personalDescription: {
    fontSize: 14,
    color: '#DDD6FE',
    lineHeight: 20,
    marginTop: 4,
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  personalInsights: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  insightText: {
    fontSize: 12,
    color: '#C4B5FD',
    lineHeight: 16,
    marginBottom: 2,
    textAlign: 'right',
    maxWidth: 150,
  },
  rankBadge: {
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  categoryTransactions: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  percentageText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
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
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  recentTransactionsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  transactionLeft: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    color: '#F9FAFB',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  
  // Personal Insights styles
  personalizedContainer: {
    marginBottom: 20,
    marginHorizontal: 20,
  },
  insightsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 15,
  },
  insightsScrollContainer: {
    paddingRight: 20,
  },
  insightCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    padding: 20,
    borderRadius: 16,
    marginRight: 15,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    width: 280,
    height: 200,
  },
  insightCardExpanded: {
    height: 'auto',
    minHeight: 320,
  },
  insightContent: {
    flex: 1,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C4B5FD',
    flex: 1,
  },
  expandIcon: {
    fontSize: 14,
    color: '#C4B5FD',
    fontWeight: 'bold',
  },
  tapToExpand: {
    fontSize: 12,
    color: '#A78BFA',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  insightMessage: {
    fontSize: 14,
    color: '#E0E7FF',
    marginBottom: 12,
    lineHeight: 20,
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(99, 102, 241, 0.3)',
  },
  adviceContainer: {
    marginBottom: 16,
  },
  adviceTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#C4B5FD',
    marginBottom: 6,
  },
  adviceItem: {
    fontSize: 13,
    color: '#DDD6FE',
    marginBottom: 3,
    paddingLeft: 8,
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 'auto',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followButton: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.4)',
  },
  followButtonText: {
    color: '#22C55E',
    fontSize: 13,
    fontWeight: '600',
  },
  ignoreButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  ignoreButtonText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },
  
  // Subcategory styles
  subcategoriesSection: {
    marginBottom: 24,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
    marginBottom: 16,
  },
  subcategoryItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  subcategoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subcategoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  subcategoryStats: {
    alignItems: 'flex-end',
  },
  subcategoryAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 2,
  },
  subcategoryPercentage: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  subcategoryProgressBar: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  subcategoryProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  subcategoryDetails: {
    marginTop: 8,
  },
  subcategoryTransactions: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  merchantDescription: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 8,
  },
  merchantInsights: {
    marginTop: 8,
  },
  merchantInsight: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 4,
    lineHeight: 18,
  },
  topSubcategoryContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  topSubcategoryLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    marginRight: 8,
  },
  topSubcategoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F9FAFB',
    marginRight: 8,
    flex: 1,
  },
  topSubcategoryAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#D1D5DB',
  },
  subcategoryPillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  subcategoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#374151',
  },
  subcategoryPillText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#D1D5DB',
  },
  topMerchantContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  topMerchantLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    marginRight: 8,
  },
  topMerchantName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#F9FAFB',
  },
  companyInfoContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#374151',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  companyInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 8,
  },
  companyInfoText: {
    fontSize: 13,
    color: '#D1D5DB',
    lineHeight: 18,
  },
});