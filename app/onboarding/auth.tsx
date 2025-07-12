import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useSession } from '@/hooks/useSession';
import { getApiUrl, envLog } from '@/utils/environment';

const API_URL = getApiUrl();

// Web-compatible alert function
const showAlert = (title: string, message: string, buttons?: Array<{text: string, onPress?: () => void, style?: string}>) => {
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

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(false); // Default to sign-up for first-time users
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAccessToken, setUserId } = useSession();

  // Debug log to see environment and API URL
  React.useEffect(() => {
    envLog('Auth screen mounted, API URL:', API_URL);
  }, []);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: ''
  });

  const handleAuth = async () => {
    if (loading) return;

    // Basic validation
    if (!formData.email || !formData.password) {
      showAlert('Error', 'Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showAlert('Error', 'Please enter a valid email address');
      return;
    }

    if (!isLogin && (!formData.firstName || !formData.lastName)) {
      showAlert('Error', 'Please fill in all required fields');
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      showAlert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      showAlert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { email: formData.email, password: formData.password }
        : { 
            email: formData.email, 
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName
          };

      envLog(`Attempting ${isLogin ? 'login' : 'registration'} with API URL: ${API_URL}${endpoint}`);
      envLog('Request body:', body);

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      envLog('Response status:', response.status);
      const data = await response.json();
      envLog('Response data:', data);

      if (response.ok) {
        await setAccessToken(data.accessToken);
        await setUserId(data.user.id);
        
        // Redirect immediately without success alert for better UX
        if (isLogin) {
          // Check personalization and data status for existing user
          if (!data.hasCompletedPersonalization) {
            // User hasn't completed personalization - send them there first
            router.replace('/onboarding/personalization');
          } else if (!data.hasData) {
            // User completed personalization but has no transaction data - send to bank linking
            router.replace('/onboarding/bank-linking');
          } else {
            // User has both personalization and transaction data - send to dashboard
            router.replace('/(tabs)');
          }
        } else {
          // New user, go to personalization questionnaire first
          router.push('/onboarding/personalization');
        }
      } else {
        // Enhanced error handling - show the specific error message from backend
        const errorMessage = data.error || data.message || 'Authentication failed';
        envLog('Backend error:', errorMessage);
        
        showAlert(
          'Error', 
          errorMessage,
          [
            {
              text: 'OK',
              onPress: () => {
                // If user already exists, switch to login mode
                if (errorMessage.toLowerCase().includes('user already exists') || 
                    errorMessage.toLowerCase().includes('user exists')) {
                  envLog('User exists - switching to login mode');
                  setIsLogin(true);
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      envLog('Auth error:', error);
      console.error('Auth error:', error);
      
      // Better error handling for network issues
      const errorMessage = error instanceof Error ? error.message : 'Network error. Please try again.';
      
      showAlert(
        'Connection Error', 
        `Unable to connect to the server. Please check your internet connection and try again.\n\nError: ${errorMessage}`,
        [
          {
            text: 'Retry',
            onPress: () => handleAuth()
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      confirmPassword: ''
    });
  };

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <User size={32} color="#10B981" />
              </View>
              <Text style={styles.title}>
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </Text>
              <Text style={styles.subtitle}>
                {isLogin 
                  ? 'Sign in to access your personalized AI financial coach'
                  : 'Get started with your personal AI financial assistant'
                }
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {!isLogin && (
                <>
                  <View style={styles.inputRow}>
                    <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                      <User size={20} color="#64748B" />
                      <TextInput
                        style={styles.input}
                        placeholder="First Name"
                        placeholderTextColor="#64748B"
                        value={formData.firstName}
                        onChangeText={(text) => setFormData({...formData, firstName: text || ''})}
                        autoCapitalize="words"
                      />
                    </View>
                    <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                      <User size={20} color="#64748B" />
                      <TextInput
                        style={styles.input}
                        placeholder="Last Name"
                        placeholderTextColor="#64748B"
                        value={formData.lastName}
                        onChangeText={(text) => setFormData({...formData, lastName: text || ''})}
                        autoCapitalize="words"
                      />
                    </View>
                  </View>
                </>
              )}

              <View style={styles.inputContainer}>
                <Mail size={20} color="#64748B" />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="#64748B"
                  value={formData.email}
                  onChangeText={(text) => setFormData({...formData, email: text?.toLowerCase() || ''})}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

              <View style={styles.inputContainer}>
                <Lock size={20} color="#64748B" />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#64748B"
                  value={formData.password}
                  onChangeText={(text) => setFormData({...formData, password: text || ''})}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={20} color="#64748B" />
                  ) : (
                    <Eye size={20} color="#64748B" />
                  )}
                </TouchableOpacity>
              </View>

              {!isLogin && (
                <View style={styles.inputContainer}>
                  <Lock size={20} color="#64748B" />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor="#64748B"
                    value={formData.confirmPassword}
                    onChangeText={(text) => setFormData({...formData, confirmPassword: text || ''})}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                </View>
              )}
            </View>

            {/* Auth Button */}
            <TouchableOpacity 
              style={[styles.authButton, loading && styles.authButtonDisabled]}
              onPress={handleAuth}
              disabled={loading}
            >
              <Text style={styles.authButtonText}>
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              </Text>
            </TouchableOpacity>

            {/* Switch Mode */}
            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
              </Text>
              <TouchableOpacity onPress={switchMode}>
                <Text style={styles.switchLink}>
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Features */}
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>Why choose EmpowerFlow?</Text>
              <View style={styles.feature}>
                <Text style={styles.featureText}>🧠 AI learns YOUR spending habits</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureText}>🎯 Personalized financial goals</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureText}>🔒 Your data stays private & secure</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: 24,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  authButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  authButtonDisabled: {
    opacity: 0.6,
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  switchText: {
    color: '#94A3B8',
    fontSize: 16,
  },
  switchLink: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
  },
  featuresContainer: {
    alignItems: 'center',
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  feature: {
    marginBottom: 8,
  },
  featureText: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
}); 