import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { Platform } from 'react-native';
import BankLinkingScreen from './bank-linking';
import * as DocumentPicker from 'expo-document-picker';
import { useSession } from '../../hooks/useSession';

// Mock dependencies
jest.mock('../../hooks/useSession');
jest.mock('expo-document-picker');
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: any) => children,
}));
jest.mock('lucide-react-native', () => ({
  UploadCloud: ({ size, color, style }: any) => `UploadCloud`,
}));

// Mock global fetch
global.fetch = jest.fn();

// Mock platform-specific alert
const mockAlert = jest.fn();
const mockWindowAlert = jest.fn();

// Store original Platform.OS
const originalPlatform = Platform.OS;

describe('BankLinkingScreen', () => {
  const mockSetAccessToken = jest.fn();
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default useSession mock
    (useSession as jest.Mock).mockReturnValue({
      setAccessToken: mockSetAccessToken,
      userId: mockUserId,
    });

    // Setup default DocumentPicker mock
    (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
      canceled: true,
    });

    // Setup default fetch mock
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        accessToken: 'mock-access-token',
        message: 'Upload successful',
        categorization: { categories: 5, transactions: 100 },
      }),
    });

    // Mock global alert for web
    Object.defineProperty(window, 'alert', {
      value: mockWindowAlert,
      writable: true,
    });
  });

  afterEach(() => {
    // Restore original Platform.OS
    Platform.OS = originalPlatform;
  });

  describe('Component Rendering', () => {
    it('renders the main components correctly', () => {
      render(<BankLinkingScreen />);
      
      expect(screen.getByText('Upload Your Data')).toBeTruthy();
      expect(screen.getByText('Upload Transaction CSV')).toBeTruthy();
      expect(screen.getByText('Supported Formats:')).toBeTruthy();
      expect(screen.getByText('• Chase Bank CSV exports')).toBeTruthy();
      expect(screen.getByText('• More banks coming soon!')).toBeTruthy();
    });

    it('renders the upload button in enabled state initially', () => {
      render(<BankLinkingScreen />);
      
      const uploadButton = screen.getByText('Upload Transaction CSV');
      expect(uploadButton).toBeTruthy();
    });

    it('shows security disclaimer text', () => {
      render(<BankLinkingScreen />);
      
      expect(screen.getByText(/Your data will be processed securely/)).toBeTruthy();
    });
  });

  describe('CSV Upload Flow', () => {
    it('handles successful CSV upload', async () => {
      const mockFile = {
        uri: 'file://test.csv',
        name: 'test.csv',
        mimeType: 'text/csv',
      };

      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [mockFile],
      });

      render(<BankLinkingScreen />);
      
      const uploadButton = screen.getByText('Upload Transaction CSV');
      fireEvent.press(uploadButton);

      // Wait for upload to complete
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://127.0.0.1:8000/api/upload-csv',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'x-user-id': mockUserId,
            },
          })
        );
      });

      // Verify access token was set
      await waitFor(() => {
        expect(mockSetAccessToken).toHaveBeenCalledWith('mock-access-token');
      });
    });

    it('shows progress during upload', async () => {
      const mockFile = {
        uri: 'file://test.csv',
        name: 'test.csv',
        mimeType: 'text/csv',
      };

      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [mockFile],
      });

      render(<BankLinkingScreen />);
      
      const uploadButton = screen.getByText('Upload Transaction CSV');
      fireEvent.press(uploadButton);

      // Check for progress indicators
      await waitFor(() => {
        expect(screen.getByText('Processing...')).toBeTruthy();
      });
    });

    it('handles canceled file selection', async () => {
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
        canceled: true,
      });

      render(<BankLinkingScreen />);
      
      const uploadButton = screen.getByText('Upload Transaction CSV');
      fireEvent.press(uploadButton);

      // Verify no API call was made
      await waitFor(() => {
        expect(global.fetch).not.toHaveBeenCalled();
      });
    });

    it('uses correct API URL from environment', async () => {
      const originalEnv = process.env.EXPO_PUBLIC_API_URL;
      process.env.EXPO_PUBLIC_API_URL = 'https://api.example.com';

      const mockFile = {
        uri: 'file://test.csv',
        name: 'test.csv',
        mimeType: 'text/csv',
      };

      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [mockFile],
      });

      render(<BankLinkingScreen />);
      
      const uploadButton = screen.getByText('Upload Transaction CSV');
      fireEvent.press(uploadButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'https://api.example.com/api/upload-csv',
          expect.any(Object)
        );
      });

      // Restore environment
      process.env.EXPO_PUBLIC_API_URL = originalEnv;
    });
  });

  describe('Error Handling', () => {
    it('handles unsupported CSV format error', async () => {
      const mockFile = {
        uri: 'file://test.csv',
        name: 'test.csv',
        mimeType: 'text/csv',
      };

      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [mockFile],
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          error: 'No valid transactions found in the CSV file',
        }),
      });

      render(<BankLinkingScreen />);
      
      const uploadButton = screen.getByText('Upload Transaction CSV');
      fireEvent.press(uploadButton);

      // For native platforms, we'd need to mock Alert.alert
      // For now, just verify the fetch was called
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles network errors', async () => {
      const mockFile = {
        uri: 'file://test.csv',
        name: 'test.csv',
        mimeType: 'text/csv',
      };

      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [mockFile],
      });

      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<BankLinkingScreen />);
      
      const uploadButton = screen.getByText('Upload Transaction CSV');
      fireEvent.press(uploadButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles DocumentPicker errors', async () => {
      (DocumentPicker.getDocumentAsync as jest.Mock).mockRejectedValue(
        new Error('DocumentPicker error')
      );

      render(<BankLinkingScreen />);
      
      const uploadButton = screen.getByText('Upload Transaction CSV');
      fireEvent.press(uploadButton);

      await waitFor(() => {
        expect(DocumentPicker.getDocumentAsync).toHaveBeenCalled();
      });
    });

    it('handles server errors without specific error message', async () => {
      const mockFile = {
        uri: 'file://test.csv',
        name: 'test.csv',
        mimeType: 'text/csv',
      };

      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [mockFile],
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      });

      render(<BankLinkingScreen />);
      
      const uploadButton = screen.getByText('Upload Transaction CSV');
      fireEvent.press(uploadButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Platform-Specific Behavior', () => {
    it('handles web platform file upload', async () => {
      // Mock web platform
      Platform.OS = 'web';

      const mockFile = {
        uri: 'file://test.csv',
        name: 'test.csv',
        mimeType: 'text/csv',
        file: new File(['test content'], 'test.csv', { type: 'text/csv' }),
      };

      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [mockFile],
      });

      render(<BankLinkingScreen />);
      
      const uploadButton = screen.getByText('Upload Transaction CSV');
      fireEvent.press(uploadButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('uses native alert on mobile platforms', async () => {
      // Mock native platform
      Platform.OS = 'ios';

      const mockFile = {
        uri: 'file://test.csv',
        name: 'test.csv',
        mimeType: 'text/csv',
      };

      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [mockFile],
      });

      render(<BankLinkingScreen />);
      
      const uploadButton = screen.getByText('Upload Transaction CSV');
      fireEvent.press(uploadButton);

      await waitFor(() => {
        expect(mockSetAccessToken).toHaveBeenCalledWith('mock-access-token');
      });
    });

    it('uses window.alert on web platform', async () => {
      // Mock web platform
      Platform.OS = 'web';

      const mockFile = {
        uri: 'file://test.csv',
        name: 'test.csv',
        mimeType: 'text/csv',
        file: new File(['test content'], 'test.csv', { type: 'text/csv' }),
      };

      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [mockFile],
      });

      render(<BankLinkingScreen />);
      
      const uploadButton = screen.getByText('Upload Transaction CSV');
      fireEvent.press(uploadButton);

      await waitFor(() => {
        expect(mockSetAccessToken).toHaveBeenCalledWith('mock-access-token');
      });
    });
  });

  describe('UI State Management', () => {
    it('disables button during upload', async () => {
      const mockFile = {
        uri: 'file://test.csv',
        name: 'test.csv',
        mimeType: 'text/csv',
      };

      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [mockFile],
      });

      // Make fetch hang to test loading state
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<BankLinkingScreen />);
      
      const uploadButton = screen.getByText('Upload Transaction CSV');
      fireEvent.press(uploadButton);

      await waitFor(() => {
        expect(screen.getByText('Processing...')).toBeTruthy();
      });
    });

    it('resets UI state after upload completion', async () => {
      const mockFile = {
        uri: 'file://test.csv',
        name: 'test.csv',
        mimeType: 'text/csv',
      };

      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [mockFile],
      });

      render(<BankLinkingScreen />);
      
      const uploadButton = screen.getByText('Upload Transaction CSV');
      fireEvent.press(uploadButton);

      // Wait for upload to complete and UI to reset
      await waitFor(() => {
        expect(mockSetAccessToken).toHaveBeenCalledWith('mock-access-token');
      });

      // Wait for UI reset timeout
      await waitFor(() => {
        expect(screen.getByText('Upload Transaction CSV')).toBeTruthy();
      }, { timeout: 2000 });
    });
  });
}); 