import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to log out?')) {
        await logout();
        router.replace('/');
      }
    } else {
      Alert.alert('Log out', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
          </View>
          <Text style={styles.name}>{user?.name || 'Investor'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.role}>{user?.role?.toUpperCase()}</Text>
        </View>

        <View style={styles.list}>
          <TouchableOpacity style={styles.listItem}>
            <MaterialCommunityIcons name="account-edit-outline" size={24} color={colors.text} />
            <Text style={styles.listText}>Edit Profile</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.listItem}>
            <MaterialCommunityIcons name="bell-outline" size={24} color={colors.text} />
            <Text style={styles.listText}>Notifications</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.listItem}>
            <MaterialCommunityIcons name="shield-lock-outline" size={24} color={colors.text} />
            <Text style={styles.listText}>Security</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionHeading}>WALLET</Text>
        <View style={styles.list}>
          <TouchableOpacity style={styles.listItem} onPress={() => router.push('/(investor)/wallet')}>
            <MaterialCommunityIcons name="wallet-outline" size={24} color="#6366F1" />
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={styles.listText}>Digital Wallet</Text>
              <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>Add money, view transactions</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionHeading}>AI TOOLS</Text>
        <View style={styles.list}>
          <TouchableOpacity style={styles.listItem} onPress={() => router.push('/compare')}>
            <MaterialCommunityIcons name="robot-outline" size={24} color={colors.green} />
            <Text style={styles.listText}>Compare Startups (Mistral AI)</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: fontSize.heading, fontWeight: '700', color: colors.text },
  content: { padding: spacing.lg },
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.green,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: { fontSize: 32, color: colors.white, fontWeight: '700' },
  name: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  email: { fontSize: fontSize.base, color: colors.textSecondary, marginBottom: spacing.sm },
  role: { fontSize: fontSize.sm, color: colors.green, fontWeight: '600', backgroundColor: colors.greenLight, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full },
  list: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLighter,
  },
  listText: { flex: 1, marginLeft: spacing.md, fontSize: fontSize.base, color: colors.text },
  sectionHeading: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '700', marginLeft: spacing.md, marginBottom: spacing.sm, marginTop: spacing.md, letterSpacing: 1 },
  logoutButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.red,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  logoutText: { color: colors.red, fontSize: fontSize.lg, fontWeight: '600' }
});
