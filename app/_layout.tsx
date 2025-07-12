import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
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
      environment: getEnvironmentDisplayName()
    });

    if (accessToken && inOnboardingGroup) {
      // User has finished onboarding, redirect to the main app
      envLog('Redirecting to main app (user authenticated)');
      router.replace('/(tabs)');
    } else if (!accessToken && !inOnboardingGroup) {
      // User is not authenticated and not in the onboarding flow, send them there
      envLog('Redirecting to welcome screen (user not authenticated)');
      router.replace('/onboarding/welcome');
    } else if (isProductionEnvironment && !inOnboardingGroup) {
      // In staging/production, always show welcome first
      envLog('Redirecting to welcome screen (production environment)');
      router.replace('/onboarding/welcome');
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