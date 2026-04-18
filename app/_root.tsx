import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/theme';

export default function RootLayout() {
  const { user, isLoading } = useAuth();

  // Show loading screen while checking auth state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.white }}>
        <ActivityIndicator size="large" color={colors.green} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {user ? (
        // Authenticated user - show tab navigation
        <Stack.Screen name="(tabs)" />
      ) : (
        // Unauthenticated user - show auth screens
        <Stack.Screen name="(auth)" />
      )}
    </Stack>
  );
}
