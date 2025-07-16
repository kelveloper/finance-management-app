/**
 * Web Retrieval Service for Merchant Context
 * Provides additional context about merchants and businesses
 */

import axios from 'axios';

export interface MerchantInfo {
  name: string;
  category: string;
  description?: string;
  type?: string;
  isHealthy?: boolean;
  isPopular?: boolean;
  priceRange?: string;
}

export class WebRetrievalService {
  private cache: Map<string, MerchantInfo> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Get merchant information with caching
   */
  async getMerchantInfo(merchantName: string): Promise<MerchantInfo | null> {
    const cacheKey = merchantName.toLowerCase();
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const expiry = this.cacheExpiry.get(cacheKey) || 0;
      if (Date.now() < expiry) {
        return this.cache.get(cacheKey) || null;
      }
    }

    try {
      // Try multiple sources for merchant info
      let merchantInfo = await this.getKnownMerchantInfo(merchantName);
      
      if (!merchantInfo) {
        merchantInfo = await this.inferMerchantInfo(merchantName);
      }

      // Cache the result
      if (merchantInfo) {
        this.cache.set(cacheKey, merchantInfo);
        this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_DURATION);
      }

      return merchantInfo;
    } catch (error) {
      console.error('Error retrieving merchant info:', error);
      return null;
    }
  }

  /**
   * Get information for well-known merchants
   */
  private async getKnownMerchantInfo(merchantName: string): Promise<MerchantInfo | null> {
    const merchant = merchantName.toLowerCase();
    
    // Known merchant database
    const knownMerchants: { [key: string]: MerchantInfo } = {
      'coinbase': {
        name: 'Coinbase',
        category: 'Cryptocurrency Exchange',
        description: 'Leading cryptocurrency trading platform',
        type: 'financial_services',
        isPopular: true
      },
      'fresh & co': {
        name: 'Fresh & Co',
        category: 'Fast Casual Restaurant',
        description: 'Healthy fast-casual chain known for fresh salads, bowls, and wraps',
        type: 'restaurant',
        isHealthy: true,
        isPopular: true,
        priceRange: '$$'
      },
      'sweetgreen': {
        name: 'Sweetgreen',
        category: 'Healthy Fast Food',
        description: 'Farm-to-table salad chain focused on healthy, sustainable ingredients',
        type: 'restaurant',
        isHealthy: true,
        isPopular: true,
        priceRange: '$$'
      },
      'whole foods': {
        name: 'Whole Foods Market',
        category: 'Organic Grocery Store',
        description: 'Premium grocery chain specializing in organic and natural foods',
        type: 'grocery',
        isHealthy: true,
        isPopular: true,
        priceRange: '$$$'
      },
      'starbucks': {
        name: 'Starbucks',
        category: 'Coffee Shop',
        description: 'Global coffeehouse chain known for specialty coffee drinks',
        type: 'coffee',
        isPopular: true,
        priceRange: '$$'
      },
      'amazon': {
        name: 'Amazon',
        category: 'E-commerce',
        description: 'Online marketplace and technology company',
        type: 'retail',
        isPopular: true
      },
      'uber': {
        name: 'Uber',
        category: 'Ride Sharing',
        description: 'Transportation network company providing ride-hailing services',
        type: 'transportation',
        isPopular: true
      },
      'uber eats': {
        name: 'Uber Eats',
        category: 'Food Delivery',
        description: 'Food delivery platform connecting customers with local restaurants',
        type: 'food_delivery',
        isPopular: true
      },
      'doordash': {
        name: 'DoorDash',
        category: 'Food Delivery',
        description: 'On-demand food delivery service',
        type: 'food_delivery',
        isPopular: true
      },
      'netflix': {
        name: 'Netflix',
        category: 'Streaming Service',
        description: 'Video streaming platform with original and licensed content',
        type: 'entertainment',
        isPopular: true,
        priceRange: '$'
      },
      'spotify': {
        name: 'Spotify',
        category: 'Music Streaming',
        description: 'Digital music streaming service',
        type: 'entertainment',
        isPopular: true,
        priceRange: '$'
      }
    };

    return knownMerchants[merchant] || null;
  }

  /**
   * Infer merchant information from name patterns
   */
  private async inferMerchantInfo(merchantName: string): Promise<MerchantInfo | null> {
    const merchant = merchantName.toLowerCase();
    
    // Pattern-based inference
    if (merchant.includes('coffee') || merchant.includes('cafe')) {
      return {
        name: merchantName,
        category: 'Coffee Shop',
        type: 'coffee',
        description: 'Local coffee establishment'
      };
    }
    
    if (merchant.includes('restaurant') || merchant.includes('bistro') || merchant.includes('grill')) {
      return {
        name: merchantName,
        category: 'Restaurant',
        type: 'restaurant',
        description: 'Dining establishment'
      };
    }
    
    if (merchant.includes('market') || merchant.includes('grocery') || merchant.includes('food')) {
      return {
        name: merchantName,
        category: 'Grocery Store',
        type: 'grocery',
        description: 'Food and grocery retailer'
      };
    }
    
    if (merchant.includes('gym') || merchant.includes('fitness') || merchant.includes('yoga')) {
      return {
        name: merchantName,
        category: 'Fitness',
        type: 'health_fitness',
        description: 'Health and fitness facility'
      };
    }

    return null;
  }

  /**
   * Generate contextual description for spending profile
   */
  async generateMerchantContext(merchantName: string, visitCount: number): Promise<string> {
    const info = await this.getMerchantInfo(merchantName);
    
    if (!info) {
      return `${merchantName} (${visitCount} visits)`;
    }

    let context = '';
    
    if (info.isHealthy) {
      context += info.description ? `${info.description.toLowerCase()}` : `${info.name}, a health-focused ${info.category.toLowerCase()}`;
    } else if (info.description) {
      context += info.description.toLowerCase();
    } else {
      context += `${info.name}, ${info.category.toLowerCase()}`;
    }

    // Add visit frequency context
    if (visitCount >= 10) {
      context += ` - clearly a favorite spot with ${visitCount} recent visits`;
    } else if (visitCount >= 5) {
      context += ` - a regular choice with ${visitCount} visits`;
    }

    return context;
  }

  /**
   * Get spending personality insights based on merchant patterns
   */
  async getSpendingPersonality(topMerchants: Array<{merchant: string, count: number}>): Promise<string[]> {
    const insights: string[] = [];
    
    for (const merchant of topMerchants.slice(0, 3)) {
      const info = await this.getMerchantInfo(merchant.merchant);
      
      if (info) {
        if (info.isHealthy && merchant.count >= 5) {
          insights.push(`Health-conscious (frequent visits to ${info.name})`);
        }
        
        if (info.type === 'coffee' && merchant.count >= 8) {
          insights.push(`Coffee enthusiast (${merchant.count} coffee runs)`);
        }
        
        if (info.type === 'financial_services' && merchant.count >= 10) {
          insights.push(`Active investor (${merchant.count} ${info.name} transactions)`);
        }
        
        if (info.type === 'food_delivery' && merchant.count >= 6) {
          insights.push(`Convenience-focused (regular food delivery user)`);
        }
      }
    }
    
    return insights;
  }
}