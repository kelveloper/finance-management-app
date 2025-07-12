import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SessionProvider, useSession } from '@/hooks/useSession';
import { isProductionLike, getEnvironmentDisplayName, envLog } from '@/utils/environment';

const queryClient = new QueryClient();

const SessionGate = ({ children }: { children: React.ReactNode }) => {
  const { accessToken, isLoading } = useSession();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) {
      return; // Wait for session to load
    }

    const inOnboardingGroup = segments[0] === 'onboarding';
    const isProductionEnvironment = isProductionLike();

    envLog('Session routing check:', {
      hasAccessToken: !!accessToken,
      inOnboardingGroup,
      isProductionEnvironment,
      currentSegments: segments,
      environment: getEnvironmentDisplayName(),
      accessTokenValue: accessToken ? '[PRESENT]' : '[MISSING]'
    });

    // STAGING/PRODUCTION: Always start with welcome screen (ignore any existing sessions)
    if (isProductionEnvironment) {
      if (accessToken && inOnboardingGroup) {
        // User has completed the flow and has an access token - redirect to main app
        envLog('Staging: User authenticated, redirecting to main app');
        router.replace('/(tabs)');
      } else if (!inOnboardingGroup && !accessToken) {
        // User is not in onboarding flow and not authenticated, send them to welcome
        envLog('Staging: Redirecting to welcome screen (fresh start)');
        router.replace('/onboarding/welcome');
      }
      // Note: In staging, we let users proceed through the normal flow after reaching welcome
    } 
    // DEVELOPMENT: Route directly to transaction page for development work
    else {
      // Only redirect to tabs if user is not already in tabs or onboarding
      if (!inOnboardingGroup && segments[0] !== '(tabs)') {
        envLog('Development: Forcing redirect to transaction page for development');
        router.replace('/(tabs)');
      }
    }
  }, [accessToken, isLoading, segments, router]);

  if (isLoading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator /></View>;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <SessionGate>
          <Stack>
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </SessionGate>
      </SessionProvider>
    </QueryClientProvider>
  );
}