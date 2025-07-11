import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSession } from '../../hooks/useSession';
import * as DocumentPicker from 'expo-document-picker';
import { UploadCloud } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function BankLinkingScreen() {
  const { setAccessToken, userId } = useSession();
  const [isCsvUploading, setIsCsvUploading] = useState(false);

  const handleCsvUpload = async () => {
    setIsCsvUploading(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const formData = new FormData();
        
        // For native, the file object is what's needed. For web, it's the file itself.
        const fileData: any = Platform.OS === 'web' ? (file.file as any) : {
          uri: file.uri,
          name: file.name,
          type: file.mimeType,
        };
        
        formData.append('file', fileData);

        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/upload-csv`, {
          method: 'POST',
          body: formData,
          headers: {
            // Let the browser set the Content-Type with boundary for multipart/form-data
            // 'Content-Type': 'multipart/form-data',
            'x-user-id': userId || 'mock_user_123',
          },
        });

        const data = await response.json();

        if (response.ok && data.accessToken) {
          Alert.alert('Success', 'Mock data uploaded successfully!');
          await setAccessToken(data.accessToken);
        } else {
          throw new Error(data.error || 'Failed to upload CSV.');
        }
      }
    } catch (error: any) {
      console.error('CSV Upload Error:', error);
      Alert.alert('Error', error.message || 'An unexpected error occurred during CSV upload.');
    } finally {
      setIsCsvUploading(false);
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
          Get started by uploading a CSV file of your transaction history. This allows you to use the app with mock data.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleCsvUpload}
          disabled={isCsvUploading}
        >
          {isCsvUploading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <UploadCloud size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Upload Transaction CSV</Text>
            </>
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
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
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
  buttonIcon: {
    marginRight: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
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
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
    fontSize: 14,
  },
});