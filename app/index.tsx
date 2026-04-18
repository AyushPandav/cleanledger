import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '../constants/theme';

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.white }}>
        <ActivityIndicator size="large" color={colors.green} />
      </View>
    );
  }

  if (!user) return <Redirect href="/(auth)" />;
  if (user.role === 'investor') return <Redirect href="/(investor)" />;
  return <Redirect href="/(startup)" />;
}