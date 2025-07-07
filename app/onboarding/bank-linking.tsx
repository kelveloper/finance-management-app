import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Button, TouchableOpacity } from 'react-native';
import { usePlaidLink, PlaidLinkOnSuccess, PlaidLinkOnExit } from 'react-plaid-link';
import { useRouter } from 'expo-router';

const API_HOST = 'http://127.0.0.1:8000';

export default function BankLinkingScreen() {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isAccountLinked, setIsAccountLinked] = useState(false);
  const router = useRouter();

  const generateLinkToken = useCallback(async () => {
    try {
      const response = await fetch(`${API_HOST}/api/create_link_token`, {
        method: 'POST',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch link token');
      }
      setLinkToken(data.link_token);
    } catch (error) {
      console.error('Error fetching link token:', error);
    }
  }, []);

  useEffect(() => {
    generateLinkToken();
  }, [generateLinkToken]);

  const onWebAppLinkSuccess: PlaidLinkOnSuccess = useCallback(async (public_token: string) => {
    try {
      await fetch(`${API_HOST}/api/exchange_public_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ public_token }),
      });
      // Now fetch data
      const dataResponse = await fetch(`${API_HOST}/api/data`, {
        method: 'POST',
      });
      const data = await dataResponse.json();
      console.log('Fetched data:', data);
      setIsAccountLinked(true);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error during Plaid success handling:', error);
    }
  }, [router]);

  const onWebAppLinkExit: PlaidLinkOnExit = useCallback((error, metadata) => {
    console.log('Plaid Link Exit:', metadata);
    if (error) {
      console.error('Plaid Link Error:', error);
    }
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: onWebAppLinkSuccess,
    onExit: onWebAppLinkExit,
  });

  const handleContinue = () => {
    router.push('/(tabs)');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Link Your Bank Account</Text>
      <Text style={{ textAlign: 'center', marginHorizontal: 40, marginBottom: 40 }}>
        To get started, please link your bank account. This will allow us to securely import your transaction data.
      </Text>
      {isAccountLinked ? (
        <>
          <Text style={{ marginBottom: 20, fontSize: 18, color: 'green' }}>Account linked successfully!</Text>
          <Button title="Continue" onPress={handleContinue} />
        </>
      ) : linkToken ? (
        <TouchableOpacity onPress={() => open()} disabled={!ready} style={{ backgroundColor: '#007bff', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 8 }}>
          <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold' }}>Connect a Bank Account</Text>
        </TouchableOpacity>
      ) : (
        <Text>Generating link token...</Text>
      )}
    </View>
  );
}