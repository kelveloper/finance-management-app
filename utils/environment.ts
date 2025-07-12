/**
 * Environment detection utility for React Native app
 * Helps determine if we're in development, staging, or production
 */

import { Platform } from 'react-native';

export type Environment = 'development' | 'staging' | 'production';

/**
 * Determines the current environment based on various factors
 */
export function getCurrentEnvironment(): Environment {
  // Check if we're in Expo development mode
  if (__DEV__) {
    return 'development';
  }

  // Check for Expo release channel
  const releaseChannel = getReleaseChannel();
  if (releaseChannel) {
    if (releaseChannel.includes('staging')) {
      return 'staging';
    }
    if (releaseChannel.includes('production')) {
      return 'production';
    }
  }

  // Check for custom environment variables
  const customEnv = getCustomEnvironment();
  if (customEnv) {
    return customEnv;
  }

  // Default to development if we can't determine
  return 'development';
}

/**
 * Gets the Expo release channel
 */
function getReleaseChannel(): string | null {
  // In Expo, release channels are available through constants
  try {
    const Constants = require('expo-constants').default;
    return Constants.manifest?.releaseChannel || null;
  } catch (error) {
    return null;
  }
}

/**
 * Gets custom environment from app config
 */
function getCustomEnvironment(): Environment | null {
  try {
    // Check for environment variable first (set by EAS builds)
    const envVar = process.env.EXPO_PUBLIC_ENVIRONMENT;
    if (envVar === 'staging' || envVar === 'production') {
      return envVar;
    }

    // Fallback to constants
    const Constants = require('expo-constants').default;
    const environment = Constants.manifest?.extra?.environment;
    
    if (environment === 'staging' || environment === 'production') {
      return environment;
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Checks if we're in development environment
 */
export function isDevelopment(): boolean {
  return getCurrentEnvironment() === 'development';
}

/**
 * Checks if we're in staging environment
 */
export function isStaging(): boolean {
  return getCurrentEnvironment() === 'staging';
}

/**
 * Checks if we're in production environment
 */
export function isProduction(): boolean {
  return getCurrentEnvironment() === 'production';
}

/**
 * Checks if we're in staging OR production (non-development)
 */
export function isProductionLike(): boolean {
  const env = getCurrentEnvironment();
  return env === 'staging' || env === 'production';
}

/**
 * Gets a display name for the current environment
 */
export function getEnvironmentDisplayName(): string {
  const env = getCurrentEnvironment();
  switch (env) {
    case 'development':
      return 'Development';
    case 'staging':
      return 'Staging';
    case 'production':
      return 'Production';
    default:
      return 'Unknown';
  }
}

/**
 * Gets environment-specific API URL
 */
export function getApiUrl(): string {
  const env = getCurrentEnvironment();
  
  switch (env) {
    case 'development':
      return 'http://127.0.0.1:8000';
    case 'staging':
      return 'https://your-staging-api.com'; // Replace with your staging API URL
    case 'production':
      return 'https://your-production-api.com'; // Replace with your production API URL
    default:
      return 'http://127.0.0.1:8000';
  }
}

/**
 * Console log helper that includes environment context
 */
export function envLog(message: string, ...args: any[]): void {
  const env = getCurrentEnvironment();
  console.log(`[${env.toUpperCase()}] ${message}`, ...args);
} 