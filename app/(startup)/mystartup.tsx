import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { useAuth, API_HOST_NODE } from '../../context/AuthContext';

export default function StartupMyStartupScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetch(`${API_HOST_NODE}/api/user/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && (data.user.profileComplete || data.user.name)) {
            setProfileData(data.user);
          }
        })
        .catch(err => console.log('Fetch mystartup error:', err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.green} />
      </SafeAreaView>
    );
  }

  if (!profileData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Startup</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No Startup Profile</Text>
          <Text style={styles.emptyDesc}>Create your official startup profile to get scored by our AI and feature on the Investor Explore page.</Text>
          <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/(startup)/create-profile')}>
            <Text style={styles.createBtnText}>Build Profile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Startup</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profileData.name?.charAt(0) || 'U'}</Text>
          </View>
          <Text style={styles.name}>{profileData.name}</Text>
          <Text style={styles.meta}>{profileData.industry} · {profileData.stage}</Text>

          {profileData.aiTrustScore && (
            <View style={styles.tagRow}>
              <View style={styles.tag}><Text style={styles.tagText}>Trust: {profileData.aiTrustScore}%</Text></View>
              <View style={[styles.tag, { backgroundColor: colors.grayDark }]}><Text style={[styles.tagText, { color: colors.white }]}>Risk: {profileData.aiRiskLevel}</Text></View>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Overview</Text>
        <Text style={styles.desc}>{profileData.description || 'No description provided.'}</Text>

        <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Funding Status</Text>
        <View style={styles.fundCard}>
          <View style={styles.fundRow}>
            <Text style={styles.fundLabel}>Funding Goal</Text>
            <Text style={styles.fundValue}>₹{profileData.fundingGoal}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.fundRow}>
            <Text style={styles.fundLabel}>Profile Score</Text>
            <Text style={[styles.fundValue, { color: colors.green }]}>{profileData.profileCompletionScore}%</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.updateBtn} onPress={() => router.push('/(startup)/create-profile')}>
          <Text style={styles.updateBtnText}>Update Profile Settings</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: fontSize.heading, fontWeight: '700', color: colors.text },
  content: { padding: spacing.lg },
  card: {
    backgroundColor: colors.white, borderRadius: borderRadius.lg,
    padding: spacing.xl, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', marginBottom: spacing.xl
  },
  avatar: { width: 64, height: 64, borderRadius: 16, backgroundColor: colors.black, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  avatarText: { fontSize: 24, fontWeight: '700', color: colors.white },
  name: { fontSize: 24, fontWeight: '700', color: colors.text },
  meta: { fontSize: fontSize.base, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.md },
  tagRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  tag: { backgroundColor: colors.grayLight, paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: borderRadius.full },
  tagText: { fontSize: fontSize.xs, color: colors.grayDark, fontWeight: '600' },
  sectionTitle: { fontSize: fontSize.base, fontWeight: '700', textTransform: 'uppercase', marginBottom: spacing.sm },
  desc: { fontSize: fontSize.base, color: colors.textSecondary, lineHeight: 22 },
  fundCard: { backgroundColor: colors.white, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border },
  fundRow: { flexDirection: 'row', justifyContent: 'space-between', padding: spacing.md },
  fundLabel: { fontSize: fontSize.base, color: colors.textSecondary },
  fundValue: { fontSize: fontSize.base, fontWeight: '700', color: colors.text },
  divider: { height: 1, backgroundColor: colors.borderLighter, marginHorizontal: spacing.md },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  emptyDesc: { fontSize: fontSize.base, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl, lineHeight: 22 },
  createBtn: { backgroundColor: colors.green, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: borderRadius.full },
  createBtnText: { color: colors.white, fontWeight: '700', fontSize: fontSize.base },
  updateBtn: { backgroundColor: colors.black, padding: spacing.md, borderRadius: borderRadius.md, alignItems: 'center', marginTop: spacing.xl },
  updateBtnText: { color: colors.white, fontWeight: '600', fontSize: fontSize.base }
});
