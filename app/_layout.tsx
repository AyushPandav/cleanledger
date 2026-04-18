import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { colors } from '../constants/theme';

function RootLayoutNav() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.white }}>
        <ActivityIndicator size="large" color={colors.green} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(investor)" />
      <Stack.Screen name="(startup)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="detail" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
