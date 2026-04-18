import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { Badge } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { API_HOST_NODE } from '../../context/AuthContext';

const INDUSTRY_COLORS: Record<string, string> = {
  FinTech: '#6366F1', HealthTech: '#10B981', EdTech: '#0EA5E9',
  AgriTech: '#22C55E', 'AI/ML': '#8B5CF6', Logistics: '#F59E0B',
  SaaS: '#EC4899', Other: '#64748B',
};

const getRisk = (r: string): 'low' | 'med' | 'high' => {
  const s = r?.toLowerCase() || '';
  if (s.includes('low')) return 'low';
  if (s.includes('med')) return 'med';
  return 'high';
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export default function InvestorHome() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [startups, setStartups] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_HOST_NODE}/api/startups`).then(r => r.json()),
      user?.id ? fetch(`${API_HOST_NODE}/api/investments/${user.id}`).then(r => r.json()) : Promise.resolve({ success: true, investments: [] }),
    ]).then(([startupsData, invData]) => {
      if (startupsData.success) setStartups(startupsData.startups.slice(0, 3));
      if (invData.success) setInvestments(invData.investments || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [user]);

  const totalInvested = investments.reduce((s, i) => s + (i.amountInvested || 0), 0);
  const verifiedCount = startups.filter(s => s.businessRegistered && s.kycCompleted).length;

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to log out?')) { await logout(); router.replace('/'); }
    } else {
      Alert.alert('Log out', 'Are you sure?', [
        { text: 'Cancel' },
        { text: 'Log out', style: 'destructive', onPress: async () => { await logout(); router.replace('/'); } },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.headerName}>{user?.name?.split(' ')[0] ?? 'Investor'} 👋</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={18} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { icon: 'rocket-launch-outline', value: loading ? '…' : `${startups.length > 0 ? `${startups.length}+` : '0'}`, label: 'Live Startups' },
            { icon: 'shield-check-outline', value: loading ? '…' : `${verifiedCount}`, label: 'Fully Verified' },
            { icon: 'currency-inr', value: loading ? '…' : totalInvested > 0 ? `₹${(totalInvested / 1000).toFixed(0)}K` : '₹0', label: 'Invested' },
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <MaterialCommunityIcons name={s.icon as any} size={20} color={colors.green} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Your Portfolio mini-summary */}
        {investments.length > 0 && (
          <TouchableOpacity style={styles.portfolioBanner} onPress={() => router.push('/(investor)/portfolio')}>
            <View style={styles.portfolioBannerLeft}>
              <MaterialCommunityIcons name="briefcase-outline" size={22} color="#6366F1" />
              <View>
                <Text style={styles.portfolioBannerTitle}>Your Portfolio</Text>
                <Text style={styles.portfolioBannerSub}>{investments.length} investment{investments.length > 1 ? 's' : ''} · ₹{(totalInvested / 1000).toFixed(0)}K deployed</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#94A3B8" />
          </TouchableOpacity>
        )}

        {/* Featured Startups */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Ranked Startups</Text>
            <TouchableOpacity onPress={() => router.push('/(investor)/explore')}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={colors.green} />
              <Text style={styles.loadingText}>Loading startups…</Text>
            </View>
          ) : startups.length === 0 ? (
            <View style={styles.emptyBox}>
              <MaterialCommunityIcons name="telescope" size={36} color="#CBD5E1" />
              <Text style={styles.emptyText}>No startups yet. Check back soon!</Text>
            </View>
          ) : (
            startups.map((item, idx) => {
              const accentColor = INDUSTRY_COLORS[item.industry] || '#64748B';
              const risk = getRisk(item.aiRiskLevel);
              const trust = item.aiTrustScore || 0;
              return (
                <TouchableOpacity
                  key={item.id || item._id || idx}
                  style={styles.card}
                  onPress={() => router.push({ pathname: '/detail', params: { id: item.id || item._id } })}
                  activeOpacity={0.92}
                >
                  <View style={[styles.cardAccent, { backgroundColor: accentColor }]} />
                  <View style={styles.cardContent}>
                    <View style={styles.cardRow}>
                      <View style={[styles.avatar, { backgroundColor: accentColor }]}>
                        <Text style={styles.avatarText}>{item.name?.charAt(0) || 'S'}</Text>
                      </View>
                      <View style={styles.cardMid}>
                        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.cardMeta}>{item.industry || 'Unknown'}  ·  {item.stage || 'Startup'}</Text>
                      </View>
                      <View style={styles.cardRight}>
                        <Badge variant={risk}>{risk === 'low' ? 'Low Risk' : risk === 'med' ? 'Med' : 'High'}</Badge>
                        <Text style={[styles.trustVal, { color: trust >= 70 ? '#10B981' : trust >= 40 ? '#F59E0B' : '#EF4444' }]}>
                          {trust}/100
                        </Text>
                      </View>
                    </View>
                    {item.description ? (
                      <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                    ) : null}
                    <View style={styles.cardFooter}>
                      <View style={styles.rankPill}>
                        <Text style={styles.rankText}>#{idx + 1} ranked</Text>
                      </View>
                      {(item.businessRegistered && item.kycCompleted) && (
                        <View style={styles.verifiedPill}>
                          <MaterialCommunityIcons name="shield-check" size={11} color="#10B981" />
                          <Text style={styles.verifiedText}>Verified</Text>
                        </View>
                      )}
                      <Text style={styles.goalText}>
                        Goal: {item.fundingGoal ? `₹${(item.fundingGoal / 100000).toFixed(1)}L` : 'N/A'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* CTA */}
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
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  scroll: { paddingBottom: 100 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: 14,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  greeting: { fontSize: fontSize.sm, color: '#64748B', fontWeight: '500' },
  headerName: { fontSize: 22, fontWeight: '800', color: '#0F172A', letterSpacing: -0.3 },
  logoutBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#E2E8F0',
  },

  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: spacing.lg, paddingVertical: spacing.lg },
  statCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: 16,
    padding: 12, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  statValue: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  statLabel: { fontSize: 10, color: '#94A3B8', textAlign: 'center', fontWeight: '600' },

  portfolioBanner: {
    marginHorizontal: spacing.lg, marginBottom: spacing.md,
    backgroundColor: colors.white, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0',
    padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  portfolioBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  portfolioBannerTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  portfolioBannerSub: { fontSize: 12, color: '#64748B', marginTop: 2 },

  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 },
  seeAll: { fontSize: fontSize.sm, color: colors.green, fontWeight: '700' },

  loadingBox: { alignItems: 'center', gap: 8, paddingVertical: 32 },
  loadingText: { fontSize: fontSize.sm, color: '#94A3B8' },
  emptyBox: { alignItems: 'center', gap: 8, paddingVertical: 32 },
  emptyText: { fontSize: fontSize.sm, color: '#94A3B8' },

  card: {
    backgroundColor: colors.white, borderRadius: 18, marginBottom: 12,
    overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0',
    flexDirection: 'row',
    ...Platform.select({
      ios: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 2 },
    }),
  },
  cardAccent: { width: 4 },
  cardContent: { flex: 1, padding: 14, gap: 8 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '800', color: colors.white },
  cardMid: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  cardMeta: { fontSize: 12, color: '#64748B', marginTop: 2 },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  trustVal: { fontSize: 13, fontWeight: '800' },
  cardDesc: { fontSize: 12, color: '#475569', lineHeight: 18 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  rankPill: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  rankText: { fontSize: 11, fontWeight: '700', color: '#334155' },
  verifiedPill: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#ECFDF5', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10 },
  verifiedText: { fontSize: 11, fontWeight: '700', color: '#10B981' },
  goalText: { fontSize: 12, color: '#94A3B8', marginLeft: 'auto' as any },

  ctaBanner: {
    marginHorizontal: spacing.lg, marginBottom: spacing.xl,
    backgroundColor: '#0F172A', borderRadius: 16,
    padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md,
  },
  ctaText: { flex: 1, fontSize: fontSize.lg, fontWeight: '700', color: colors.white },
});
