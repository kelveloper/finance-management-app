import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Sparkles, Shield, TrendingUp } from 'lucide-react-native';
import { useSession } from '@/hooks/useSession';
import React, { useEffect, useState } from 'react';
import { isDevelopment, getApiUrl, envLog, getEnvironmentDisplayName, getCurrentEnvironment } from '@/utils/environment';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const { setAccessToken } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  // Log environment information
  useEffect(() => {
    const env = getCurrentEnvironment();
    const displayName = getEnvironmentDisplayName();
    envLog('Welcome screen loaded');
    envLog(`Current environment: ${env} (${displayName})`);
  }, []);

  useEffect(() => {
    const handleWelcomeScreenLogic = async () => {
      const isDevEnvironment = isDevelopment();
      const apiUrl = getApiUrl();
      
      envLog('Welcome screen loaded', {
        environment: getEnvironmentDisplayName(),
        isDevelopment: isDevEnvironment,
        apiUrl
      });

      // In staging/production, always show welcome screen
      if (!isDevEnvironment) {
        envLog('Production environment - showing welcome screen');
        setIsLoading(false);
        return;
      }

      // In development, try to auto-start session for faster testing
      envLog('Development environment - attempting auto-session start');
      try {
        const response = await fetch(`${apiUrl}/api/session/start`, {
          method: 'POST',
        });
        const data = await response.json();
        if (response.ok && data.accessToken) {
          envLog('Auto-session start successful, redirecting to dashboard');
          await setAccessToken(data.accessToken);
          router.replace('/(tabs)');
        } else {
          envLog('No existing data found, showing welcome screen');
          setIsLoading(false);
        }
      } catch (error) {
        envLog('Failed to start session automatically', error);
        setIsLoading(false); // Show the welcome screen on error
      }
    };

    handleWelcomeScreenLogic();
  }, [setAccessToken, router]);


  if (isLoading) {
    return (
      <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>
          {isDevelopment() ? 'Checking for existing data...' : 'Loading...'}
        </Text>
        <Text style={styles.environmentText}>
          Environment: {getEnvironmentDisplayName()}
        </Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B', '#334155']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <Sparkles size={48} color="#10B981" />
          </View>
          
                  <Text style={styles.title}>Welcome to{'\n'}EmpowerFlow</Text>
        <Text style={styles.subtitle}>
          Your intelligent financial co-pilot that provides proactive insights and personalized advice to empower your financial journey.
        </Text>
        {!isDevelopment() && (
          <Text style={styles.environmentBadge}>
            {getEnvironmentDisplayName()} Environment
          </Text>
        )}
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Shield size={24} color="#10B981" />
            <Text style={styles.featureText}>Bank-level security with your privacy first</Text>
          </View>
          
          <View style={styles.feature}>
            <TrendingUp size={24} color="#10B981" />
            <Text style={styles.featureText}>AI-powered insights that learn from your habits</Text>
          </View>
          
          <View style={styles.feature}>
            <Sparkles size={24} color="#10B981" />
            <Text style={styles.featureText}>Proactive nudges to keep you on track</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={() => router.push('/onboarding/auth')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          EmpowerFlow uses read-only access to analyze your financial data. 
          We never store your banking credentials.
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: height * 0.1,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 44,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
  },
  featuresContainer: {
    marginBottom: 40,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  featureText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#E2E8F0',
    marginLeft: 16,
    flex: 1,
  },
  getStartedButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  disclaimer: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
  },
  environmentText: {
    marginTop: 10,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  environmentBadge: {
    marginTop: 16,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#10B981',
    textAlign: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'center',
  },
});