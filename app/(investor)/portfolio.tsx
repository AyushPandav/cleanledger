import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { Badge, ProgressBar } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { API_HOST_NODE } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

const INDUSTRY_COLORS: Record<string, string> = {
  FinTech: '#6366F1', HealthTech: '#10B981', EdTech: '#0EA5E9',
  AgriTech: '#22C55E', 'AI/ML': '#8B5CF6', Logistics: '#F59E0B',
  SaaS: '#EC4899', Other: '#64748B',
};

export default function PortfolioScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    fetch(`${API_HOST_NODE}/api/investments/${user.id}`)
      .then(r => r.json())
      .then(d => { if (d.success) setInvestments(d.investments || []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const totalInvested = investments.reduce((s, i) => s + (i.amountInvested || 0), 0);

  // Build allocation data from real investments
  const allocation = investments.map((inv, idx) => ({
    name: inv.startupName || 'Unknown',
    amount: inv.amountInvested || 0,
    pct: totalInvested > 0 ? Math.round(((inv.amountInvested || 0) / totalInvested) * 100) : 0,
    color: INDUSTRY_COLORS[inv.startupIndustry] || '#64748B',
  }));

  // Best performer by trust score
  const best = investments.reduce((b, i) => (!b || (i.startupTrustScore > b.startupTrustScore) ? i : b), null as any);
  const mostInvested = investments.reduce((b, i) => (!b || (i.amountInvested > b.amountInvested) ? i : b), null as any);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Portfolio</Text>
        <Badge variant="low">Investor</Badge>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.green} />
            <Text style={styles.loadingText}>Loading portfolio…</Text>
          </View>
        ) : investments.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="briefcase-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No investments yet</Text>
            <Text style={styles.emptySubtitle}>Invest in startups from the Explore tab to see your portfolio here.</Text>
            <TouchableOpacity style={styles.exploreBtn} onPress={() => router.push('/(investor)/explore')}>
              <MaterialCommunityIcons name="magnify" size={16} color={colors.white} />
              <Text style={styles.exploreBtnText}>Explore Startups</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Key Metrics */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <MaterialCommunityIcons name="currency-inr" size={18} color="#6366F1" />
                <Text style={styles.metricValue}>₹{(totalInvested / 1000).toFixed(1)}K</Text>
                <Text style={styles.metricLabel}>Total Invested</Text>
              </View>
              <View style={styles.metricCard}>
                <MaterialCommunityIcons name="briefcase-check-outline" size={18} color="#10B981" />
                <Text style={styles.metricValue}>{investments.length}</Text>
                <Text style={styles.metricLabel}>Portfolios</Text>
              </View>
              <View style={styles.metricCard}>
                <MaterialCommunityIcons name="robot-outline" size={18} color="#8B5CF6" />
                <Text style={styles.metricValue}>
                  {investments.length > 0
                    ? Math.round(investments.reduce((s, i) => s + (i.startupTrustScore || 0), 0) / investments.length)
                    : 0}
                </Text>
                <Text style={styles.metricLabel}>Avg Trust</Text>
              </View>
              <View style={styles.metricCard}>
                <MaterialCommunityIcons name="shield-check-outline" size={18} color="#F59E0B" />
                <Text style={styles.metricValue}>
                  {investments.filter(i => i.startupRiskLevel?.toLowerCase().includes('low')).length}
                </Text>
                <Text style={styles.metricLabel}>Low Risk</Text>
              </View>
            </View>

            {/* Allocation breakdown */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Investment Allocation</Text>
              <View style={styles.allocationCard}>
                {/* Visual bar */}
                <View style={styles.allocationBar}>
                  {allocation.map((a, i) => (
                    <View key={i} style={{ flex: a.pct, backgroundColor: a.color, minWidth: a.pct > 0 ? 4 : 0 }} />
                  ))}
                </View>
                {allocation.map((a, i) => (
                  <View key={i} style={styles.allocationRow}>
                    <View style={[styles.allocationDot, { backgroundColor: a.color }]} />
                    <Text style={styles.allocationName}>{a.name}</Text>
                    <Text style={styles.allocationPct}>{a.pct}%</Text>
                    <Text style={styles.allocationAmt}>₹{(a.amount / 1000).toFixed(1)}K</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Performance */}
            {(best || mostInvested) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Performance Highlights</Text>
                <View style={styles.perfCard}>
                  {best && (
                    <View style={styles.perfRow}>
                      <MaterialCommunityIcons name="star-outline" size={16} color="#F59E0B" />
                      <Text style={styles.perfLabel}>Highest Trust Score</Text>
                      <Text style={styles.perfName}>{best.startupName}</Text>
                      <Text style={styles.perfVal}>{best.startupTrustScore || 0}/100</Text>
                    </View>
                  )}
                  {mostInvested && (
                    <View style={[styles.perfRow, { borderTopWidth: 1, borderTopColor: '#F1F5F9', marginTop: 10, paddingTop: 10 }]}>
                      <MaterialCommunityIcons name="trending-up" size={16} color="#10B981" />
                      <Text style={styles.perfLabel}>Largest Investment</Text>
                      <Text style={styles.perfName}>{mostInvested.startupName}</Text>
                      <Text style={[styles.perfVal, { color: '#10B981' }]}>₹{(mostInvested.amountInvested / 1000).toFixed(1)}K</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Investment cards */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Investments</Text>
              {investments.map((inv, idx) => {
                const accent = INDUSTRY_COLORS[inv.startupIndustry] || '#64748B';
                const trust = inv.startupTrustScore || 0;
                const milestones: any[] = inv.startupMilestones || [];
                const done = milestones.filter((m: any) => m.completed).length;

                return (
                  <TouchableOpacity
                    key={inv._id || idx}
                    style={styles.investCard}
                    onPress={() => router.push({ pathname: '/detail', params: { id: inv.startupId } })}
                    activeOpacity={0.92}
                  >
                    <View style={[styles.investCardAccent, { backgroundColor: accent }]} />
                    <View style={styles.investCardContent}>
                      <View style={styles.investCardHeader}>
                        <View style={[styles.investAvatar, { backgroundColor: accent }]}>
                          <Text style={styles.investAvatarText}>{inv.startupName?.charAt(0) || 'S'}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.investName}>{inv.startupName}</Text>
                          <Text style={styles.investMeta}>{inv.startupIndustry} · {inv.startupStage}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end', gap: 4 }}>
                          <Text style={styles.investAmount}>₹{(inv.amountInvested / 1000).toFixed(1)}K</Text>
                          <Text style={[styles.investTrust, { color: trust >= 70 ? '#10B981' : trust >= 40 ? '#F59E0B' : '#EF4444' }]}>
                            Trust {trust}/100
                          </Text>
                        </View>
                      </View>

                      <View style={styles.investProgressRow}>
                        <Text style={styles.investProgressLabel}>Startup Progress</Text>
                        <Text style={styles.investProgressPct}>{inv.startupCompletionScore || 0}%</Text>
                      </View>
                      <ProgressBar progress={inv.startupCompletionScore || 0} height={5} style={styles.bar} />

                      {milestones.length > 0 && (
                        <Text style={styles.milestoneStatus}>
                          Milestones: {done}/{milestones.length} completed  ·  {inv.milestonePaymentStatus}
                        </Text>
                      )}

                      <Text style={styles.investDate}>
                        Invested {new Date(inv.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  content: { padding: spacing.lg, paddingBottom: 100, gap: spacing.md },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 80 },
  loadingText: { fontSize: fontSize.sm, color: '#94A3B8' },

  emptyState: { paddingTop: 60, alignItems: 'center', gap: 12 },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: '700', color: '#334155' },
  emptySubtitle: { fontSize: fontSize.sm, color: '#94A3B8', textAlign: 'center', lineHeight: 20, maxWidth: 280 },
  exploreBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.green, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 8,
  },
  exploreBtnText: { color: colors.white, fontWeight: '700' },

  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metricCard: {
    width: '47%', backgroundColor: colors.white, borderRadius: 16,
    padding: 14, gap: 6, alignItems: 'center',
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  metricValue: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  metricLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },

  section: { gap: 10 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 },

  allocationCard: {
    backgroundColor: colors.white, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#E2E8F0', gap: 10,
  },
  allocationBar: { height: 10, borderRadius: 5, flexDirection: 'row', overflow: 'hidden', backgroundColor: '#F1F5F9' },
  allocationRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  allocationDot: { width: 10, height: 10, borderRadius: 5 },
  allocationName: { flex: 1, fontSize: 13, color: '#334155', fontWeight: '500' },
  allocationPct: { fontSize: 13, fontWeight: '700', color: '#0F172A', width: 36, textAlign: 'right' },
  allocationAmt: { fontSize: 12, color: '#94A3B8', width: 50, textAlign: 'right' },

  perfCard: {
    backgroundColor: colors.white, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  perfRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  perfLabel: { fontSize: 12, color: '#94A3B8', flex: 1 },
  perfName: { fontSize: 13, fontWeight: '600', color: '#334155' },
  perfVal: { fontSize: 14, fontWeight: '800', color: '#0F172A' },

  investCard: {
    backgroundColor: colors.white, borderRadius: 18, overflow: 'hidden',
    borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row',
  },
  investCardAccent: { width: 4 },
  investCardContent: { flex: 1, padding: 14, gap: 8 },
  investCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  investAvatar: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  investAvatarText: { fontSize: 18, fontWeight: '800', color: colors.white },
  investName: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  investMeta: { fontSize: 12, color: '#64748B', marginTop: 2 },
  investAmount: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  investTrust: { fontSize: 12, fontWeight: '700' },
  investProgressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  investProgressLabel: { fontSize: 11, color: '#94A3B8' },
  investProgressPct: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  bar: { backgroundColor: '#F1F5F9' },
  milestoneStatus: { fontSize: 12, color: '#64748B' },
  investDate: { fontSize: 11, color: '#CBD5E1' },
});
