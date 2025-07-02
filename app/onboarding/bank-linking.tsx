import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Shield, Lock, Eye, CircleCheck as CheckCircle, ArrowRight } from 'lucide-react-native';

export default function BankLinkingScreen() {
  const handleConnectBank = () => {
    // In real app, this would integrate with Plaid/Finicity
    router.replace('/(tabs)');
  };

  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Shield size={32} color="#10B981" />
            </View>
            <Text style={styles.title}>Connect Your Bank</Text>
            <Text style={styles.subtitle}>
              Link your accounts securely to start receiving personalized financial insights
            </Text>
          </View>

          <View style={styles.securitySection}>
            <Text style={styles.securityTitle}>Your Security is Our Priority</Text>
            
            <View style={styles.securityFeatures}>
              <View style={styles.securityFeature}>
                <Lock size={20} color="#10B981" />
                <View style={styles.securityText}>
                  <Text style={styles.securityFeatureTitle}>256-bit Encryption</Text>
                  <Text style={styles.securityFeatureDesc}>Same level of security used by major banks</Text>
                </View>
              </View>

              <View style={styles.securityFeature}>
                <Eye size={20} color="#10B981" />
                <View style={styles.securityText}>
                  <Text style={styles.securityFeatureTitle}>Read-Only Access</Text>
                  <Text style={styles.securityFeatureDesc}>We can view but never move your money</Text>
                </View>
              </View>

              <View style={styles.securityFeature}>
                <CheckCircle size={20} color="#10B981" />
                <View style={styles.securityText}>
                  <Text style={styles.securityFeatureTitle}>No Credential Storage</Text>
                  <Text style={styles.securityFeatureDesc}>Your login details are never saved</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.providerSection}>
            <Text style={styles.providerTitle}>Powered by Plaid</Text>
            <Text style={styles.providerDesc}>
              Trusted by millions of users and thousands of financial apps. 
              Your data is handled with institutional-grade security.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.connectButton}
            onPress={handleConnectBank}
            activeOpacity={0.8}
          >
            <Text style={styles.connectButtonText}>Connect Bank Account</Text>
            <ArrowRight size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => router.replace('/(tabs)')}
            activeOpacity={0.8}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
  },
  securitySection: {
    marginBottom: 32,
  },
  securityTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  securityFeatures: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
  },
  securityFeature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  securityText: {
    marginLeft: 16,
    flex: 1,
  },
  securityFeatureTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  securityFeatureDesc: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    lineHeight: 20,
  },
  providerSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  providerTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  providerDesc: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
  connectButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  connectButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
});