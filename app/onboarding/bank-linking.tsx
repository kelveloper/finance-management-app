import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSession } from '../../hooks/useSession';
import * as DocumentPicker from 'expo-document-picker';
import { UploadCloud } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getDevUserId } from '../../utils/environment';

// Web-compatible alert function
const showAlert = (title: string, message: string, buttons?: Array<{text: string, onPress?: () => void, style?: 'default' | 'cancel' | 'destructive'}>) => {
  if (Platform.OS === 'web') {
    // Use browser's native alert for web
    const result = window.alert(`${title}\n\n${message}`);
    // If there are buttons, call the first button's onPress
    if (buttons && buttons[0] && buttons[0].onPress) {
      buttons[0].onPress();
    }
  } else {
    // Use React Native Alert for mobile
    Alert.alert(title, message, buttons);
  }
};

export default function BankLinkingScreen() {
  const { setAccessToken, userId } = useSession();
  const [isCsvUploading, setIsCsvUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleCsvUpload = async () => {
    setIsCsvUploading(true);
    setUploadStatus('Selecting file...');
    setUploadProgress(0);
    
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        // Stage 1: File selected
        setUploadStatus('Uploading transactions...');
        setUploadProgress(25);
        await new Promise(resolve => setTimeout(resolve, 300)); // Small delay for visual feedback
        
        const formData = new FormData();
        
        // For native, the file object is what's needed. For web, it's the file itself.
        const fileData: any = Platform.OS === 'web' ? (file.file as any) : {
          uri: file.uri,
          name: file.name,
          type: file.mimeType,
        };
        
        formData.append('file', fileData);

        // Stage 2: Uploading
        setUploadProgress(50);
        await new Promise(resolve => setTimeout(resolve, 300));

        setUploadStatus('Processing and categorizing...');
        setUploadProgress(75);
        
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/upload-csv`, {
          method: 'POST',
          body: formData,
          headers: {
            // Let the browser set the Content-Type with boundary for multipart/form-data
            // 'Content-Type': 'multipart/form-data',
            'x-user-id': userId || getDevUserId(),
          },
        });

        const data = await response.json();

        if (response.ok && data.accessToken) {
          // Stage 3: Complete
          setUploadStatus('Complete!');
          setUploadProgress(100);
          await new Promise(resolve => setTimeout(resolve, 500)); // Show completion briefly
          
          // Show detailed categorization results
          const message = data.categorization ? 
            `Upload Complete!\n\n${data.message}\n\nYour transactions have been automatically organized into categories to help you understand your spending patterns.` :
            'Transaction data uploaded successfully!';
          
          showAlert('Success', message);
          await setAccessToken(data.accessToken);
        } else {
          // Handle specific error cases
          if (response.status === 400 && data.error?.includes('No valid transactions found')) {
            showAlert(
              'CSV Format Not Supported', 
              'The CSV format you uploaded is not currently supported. We currently support Chase bank CSV exports.\n\nPlease try uploading a Chase CSV file, or contact support if you need help with other bank formats.',
              [{ text: 'OK' }]
            );
          } else {
            throw new Error(data.error || 'Failed to upload CSV.');
          }
        }
      }
    } catch (error: any) {
      console.error('CSV Upload Error:', error);
      setUploadStatus('Error occurred');
      setUploadProgress(0);
      showAlert('Error', error.message || 'An unexpected error occurred during CSV upload.');
    } finally {
      setIsCsvUploading(false);
      setTimeout(() => {
        setUploadStatus('');
        setUploadProgress(0);
      }, 1000); // Clear status after a second
    }
  };


  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Upload Your Data</Text>
        <Text style={styles.description}>
          Get started by uploading a CSV file of your transaction history. We currently support Chase bank CSV exports.
        </Text>
        
        <View style={styles.supportedFormatsContainer}>
          <Text style={styles.supportedFormatsTitle}>Supported Formats:</Text>
          <Text style={styles.supportedFormatsText}>• Chase Bank CSV exports</Text>
          <Text style={styles.supportedFormatsText}>• More banks coming soon!</Text>
        </View>

        {isCsvUploading && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
            </View>
            <Text style={styles.progressText}>{uploadStatus}</Text>
            <Text style={styles.progressPercentage}>{uploadProgress}%</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, isCsvUploading && styles.buttonDisabled]}
          onPress={handleCsvUpload}
          disabled={isCsvUploading}
        >
          {!isCsvUploading ? (
            <>
              <UploadCloud size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Upload Transaction CSV</Text>
            </>
          ) : (
            <Text style={styles.buttonText}>Processing...</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Your data will be processed securely and will only be used for your personal analysis within the app.
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0F172A',
  },
  content: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 5px rgba(0, 0, 0, 0.3)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
      },
    }),
    width: '100%',
  },
  buttonDisabled: {
    backgroundColor: '#6B7280',
    opacity: 0.7,
  },
  buttonIcon: {
    marginRight: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#64748B',
    marginTop: 24,
    textAlign: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#334155',
  },
  dividerText: {
    marginHorizontal: 16,
    fontWeight: '600',
    color: '#64748B',
    fontSize: 14,
  },
  supportedFormatsContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  supportedFormatsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 8,
  },
  supportedFormatsText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#94A3B8',
    marginBottom: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '400',
    marginTop: 8,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#1E293B',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  progressPercentage: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});