import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * A simple, cross-platform key-value storage utility.
 * Uses AsyncStorage for native and localStorage for web.
 */
export const storage = {
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (e) {
      console.error('Failed to save item to storage', e);
    }
  },

  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      } else {
        return await AsyncStorage.getItem(key);
      }
    } catch (e) {
      console.error('Failed to get item from storage', e);
      return null;
    }
  },
  
  removeItem: async (key: string): Promise<void> => {
      try {
          if (Platform.OS === 'web') {
              localStorage.removeItem(key);
          } else {
              await AsyncStorage.removeItem(key);
          }
      } catch (e) {
          console.error('Failed to remove item from storage', e);
      }
  }
}; 