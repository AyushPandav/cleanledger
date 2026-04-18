import React from 'react';
import { View } from 'react-native';

// This file is kept for backwards compatibility
// All exports are from the root level components folder
export * from '../../components/ui';

// Default export - dummy component to satisfy expo-router
export default function UIModule() {
  return <View />;
}
