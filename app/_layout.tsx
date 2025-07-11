import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SessionProvider, useSession } from '@/hooks/useSession';

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

    if (accessToken && inOnboardingGroup) {
      // User has finished onboarding, redirect to the main app
      router.replace('/(tabs)');
    } else if (!accessToken && !inOnboardingGroup) {
      // User is not authenticated and not in the onboarding flow, send them there
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