import 'react-native-testing-mocks/register';

// Mock React Native modules
global.fetch = vi.fn();

// Mock AsyncStorage
const mockAsyncStorage = {
  getItem: vi.fn(() => Promise.resolve(null)),
  setItem: vi.fn(() => Promise.resolve()),
  removeItem: vi.fn(() => Promise.resolve()),
  clear: vi.fn(() => Promise.resolve()),
};

Object.defineProperty(global, '__react_native_async_storage_mock', {
  value: mockAsyncStorage,
});

// Mock React Navigation
vi.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: vi.fn(),
    dispatch: vi.fn(),
    setOptions: vi.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// Mock Expo modules that might cause issues
vi.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      scheme: 'empowerflow',
    },
  },
}));

vi.mock('expo-linking', () => ({
  openURL: vi.fn().mockResolvedValue(true),
})); 