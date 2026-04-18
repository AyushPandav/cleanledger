import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { Badge, ProgressBar } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';

const featuredStartups = [
  { id: '1', initials: 'NX', name: 'NexaHealth', industry: 'HealthTech', stage: 'Seed', progress: 72, risk: 'low' as const, color: colors.black, goal: '₹50L', raised: '₹36L' },
  { id: '2', initials: 'KR', name: 'Kredifi', industry: 'FinTech', stage: 'Series A', progress: 88, risk: 'low' as const, color: colors.green, goal: '₹2Cr', raised: '₹1.76Cr' },
  { id: '3', initials: 'SR', name: 'Surgent AI', industry: 'AI/ML', stage: 'Pre-seed', progress: 58, risk: 'med' as const, color: colors.black, goal: '₹30L', raised: '₹17.4L' },
];

const stats = [
  { label: 'Active Startups', value: '127', icon: 'rocket-launch-outline' as const },
  { label: 'Fully Funded', value: '43', icon: 'check-circle-outline' as const },
  { label: 'Avg Return', value: '8.3%', icon: 'trending-up' as const },
];

export default function InvestorHome() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to log out?')) {
        await logout();
        router.replace('/');
      }
    } else {
      Alert.alert('Log out', 'Are you sure?', [
        { text: 'Cancel' },
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
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning</Text>
          <Text style={styles.headerName}>{user?.name?.split(' ')[0] ?? 'Investor'} 👋</Text>
        </View>
        <TouchableOpacity style={styles.avatarBtn} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <MaterialCommunityIcons name={s.icon} size={20} color={colors.green} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Featured */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Startups</Text>
            <TouchableOpacity onPress={() => router.push('/(investor)/explore')}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>

          {featuredStartups.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => router.push('/detail')}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.avatar, { backgroundColor: item.color }]}>
                  <Text style={styles.avatarText}>{item.initials}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardMeta}>{item.industry} · {item.stage}</Text>
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.progressPct}>{item.progress}%</Text>
                  <Badge variant={item.risk}>{item.risk === 'low' ? 'Low' : item.risk === 'med' ? 'Med' : 'High'}</Badge>
                </View>
              </View>
              <ProgressBar progress={item.progress} height={5} style={{ marginTop: spacing.sm }} />
              <View style={styles.cardFooter}>
                <Text style={styles.cardMeta}>Goal: {item.goal}</Text>
                <Text style={[styles.cardMeta, { color: colors.green, fontWeight: '600' }]}>Raised: {item.raised}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Invest CTA */}
        <TouchableOpacity style={styles.ctaBanner} onPress={() => router.push('/(investor)/explore')}>
          <MaterialCommunityIcons name="magnify" size={22} color={colors.white} />
          <Text style={styles.ctaText}>Explore all startups</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.white} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  greeting: { fontSize: fontSize.sm, color: colors.textSecondary },
  headerName: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  avatarBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.gray, alignItems: 'center', justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row', gap: spacing.sm,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.lg,
  },
  statCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: borderRadius.lg,
    padding: spacing.md, alignItems: 'center', gap: spacing.xs,
    borderWidth: 1, borderColor: colors.border,
  },
  statValue: { fontSize: fontSize.title, fontWeight: '700', color: colors.text },
  statLabel: { fontSize: fontSize.xs, color: colors.textSecondary, textAlign: 'center' },
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { fontSize: fontSize.base, fontWeight: '700', color: colors.text, textTransform: 'uppercase', letterSpacing: 0.5 },
  seeAll: { fontSize: fontSize.sm, color: colors.green, fontWeight: '600' },
  card: {
    backgroundColor: colors.white, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  avatar: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: fontSize.base, fontWeight: '700', color: colors.white },
  cardInfo: { flex: 1, marginLeft: spacing.md },
  cardName: { fontSize: fontSize.lg, fontWeight: '600', color: colors.text },
  cardMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  cardRight: { alignItems: 'flex-end', gap: spacing.xs },
  progressPct: { fontSize: fontSize.base, fontWeight: '700', color: colors.green },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  ctaBanner: {
    marginHorizontal: spacing.lg, marginBottom: spacing.xl,
    backgroundColor: colors.black, borderRadius: borderRadius.lg,
    padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md,
  },
  ctaText: { flex: 1, fontSize: fontSize.lg, fontWeight: '600', color: colors.white },
});
