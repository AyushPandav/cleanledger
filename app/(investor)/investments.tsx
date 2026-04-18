import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { Badge, ProgressBar } from '../../components/ui';
import { API_HOST_NODE } from '../../context/AuthContext';
import { useAuth } from '../../context/AuthContext';

const getColorForIndex = (index: number) => {
  const c = [colors.black, '#4F46E5', colors.green, '#E11D48', '#0EA5E9', '#10B981'];
  return c[index % c.length];
};

const getRiskVariant = (riskStr: string): 'low' | 'med' | 'high' => {
  const r = riskStr?.toLowerCase() || '';
  if (r.includes('low')) return 'low';
  if (r.includes('med')) return 'med';
  return 'high';
};

export default function InvestmentsScreen() {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }

    fetch(`${API_HOST_NODE}/api/investments/${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setInvestments(data.investments || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const totalInvested = investments.reduce((s, i) => s + (i.amountInvested || 0), 0);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.green} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Investments</Text>
        <Badge variant={investments.length > 0 ? 'low' : 'high'}>{`${investments.length} Active`}</Badge>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Invested</Text>
              <Text style={styles.summaryValue}>
                {totalInvested > 0 ? `₹${(totalInvested / 1000).toFixed(1)}K` : '₹0'}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Portfolios</Text>
              <Text style={styles.summaryValue}>{investments.length}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Status</Text>
              <Text style={[styles.summaryValue, { color: investments.length > 0 ? colors.green : colors.textSecondary, fontSize: fontSize.sm }]}>
                {investments.length > 0 ? 'Active' : 'No Investments'}
              </Text>
            </View>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.sectionTitle}>Your Portfolio</Text>

        {/* Empty State */}
        {investments.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="briefcase-outline" size={64} color={colors.grayBadge} />
            <Text style={styles.emptyTitle}>No investments yet</Text>
            <Text style={styles.emptySubtitle}>
              Browse the Explore tab to discover high-potential startups and make your first investment.
            </Text>
            <View style={styles.emptyHint}>
              <MaterialCommunityIcons name="shield-check-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.emptyHintText}>All startups are AI-verified before listing</Text>
            </View>
          </View>
        ) : investments.map((inv, idx) => {
          const risk = getRiskVariant(inv.startupRiskLevel);
          const color = getColorForIndex(idx);
          const milestones: any[] = inv.startupMilestones || [];
          const completedMilestones = milestones.filter((m: any) => m.completed).length;

          return (
            <View key={inv._id || idx} style={styles.card}>
              {/* Card Banner */}
              <View style={[styles.cardBanner, { backgroundColor: color }]} />

              <View style={styles.cardBody}>
                {/* Top Row */}
                <View style={styles.cardTopRow}>
                  <View style={[styles.avatar, { backgroundColor: color }]}>
                    <Text style={styles.avatarText}>{inv.startupName?.charAt(0) || 'S'}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text style={styles.cardName}>{inv.startupName}</Text>
                    <Text style={styles.cardMeta}>{inv.startupIndustry} · {inv.startupStage}</Text>
                    <View style={styles.verifiedRow}>
                      <Badge variant={risk}>{risk === 'low' ? 'Low Risk' : risk === 'med' ? 'Med Risk' : 'High Risk'}</Badge>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Text style={styles.trustLabel}>🤖 Trust Score</Text>
                    <Text style={[styles.trustScore, { color: inv.startupTrustScore >= 70 ? colors.green : inv.startupTrustScore >= 40 ? '#F59E0B' : '#EF4444' }]}>
                      {inv.startupTrustScore}/100
                    </Text>
                  </View>
                </View>

                {/* Investment Amount */}
                <View style={styles.amountRow}>
                  <View style={styles.amountBox}>
                    <Text style={styles.amountLabel}>Your Investment</Text>
                    <Text style={styles.amountValue}>₹{(inv.amountInvested / 1000).toFixed(1)}K</Text>
                  </View>
                  <View style={styles.amountBox}>
                    <Text style={styles.amountLabel}>Milestone Status</Text>
                    <Text style={[styles.milestoneStatus, { color: colors.textSecondary }]}>{inv.milestonePaymentStatus || 'Pending'}</Text>
                  </View>
                </View>

                {/* Profile Completion */}
                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Startup Progress</Text>
                    <Text style={[styles.progressPct, { color: color }]}>{inv.startupCompletionScore}%</Text>
                  </View>
                  <ProgressBar progress={inv.startupCompletionScore || 0} height={6} style={styles.bar} />
                </View>

                {/* Milestones */}
                {milestones.length > 0 && (
                  <View style={styles.milestonesSection}>
                    <Text style={styles.milestonesTitle}>
                      Milestones  {completedMilestones}/{milestones.length} completed
                    </Text>
                    {milestones.slice(0, 3).map((m: any, mi: number) => (
                      <View key={mi} style={styles.milestoneRow}>
                        <MaterialCommunityIcons
                          name={m.completed ? 'check-circle' : 'circle-outline'}
                          size={16}
                          color={m.completed ? colors.green : colors.grayDark}
                        />
                        <Text style={[styles.milestoneText, m.completed && { color: colors.green }]}>
                          {m.title}{m.targetDate ? ` · ${m.targetDate}` : ''}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Invest Date */}
                <Text style={styles.investDate}>
                  Invested on {new Date(inv.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
              </View>
            </View>
          );
        })}
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
  headerTitle: { fontSize: fontSize.heading, fontWeight: '700', color: colors.text },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 100 },
  summaryCard: {
    backgroundColor: colors.white, borderRadius: borderRadius.lg,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, backgroundColor: colors.border },
  summaryLabel: { fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: spacing.xs },
  summaryValue: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  sectionTitle: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text, textTransform: 'uppercase', letterSpacing: 0.5 },
  emptyState: {
    marginTop: 40, alignItems: 'center', paddingHorizontal: spacing.xl,
    backgroundColor: colors.white, borderRadius: borderRadius.xl,
    borderWidth: 1, borderColor: colors.border, padding: spacing.xl, gap: spacing.md,
  },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  emptySubtitle: { fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  emptyHint: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm },
  emptyHintText: { fontSize: fontSize.xs, color: colors.textSecondary },
  card: {
    backgroundColor: colors.white, borderRadius: borderRadius.xl,
    overflow: 'hidden', borderWidth: 1, borderColor: colors.border,
  },
  cardBanner: { height: 6, width: '100%' },
  cardBody: { padding: spacing.lg, gap: spacing.md },
  cardTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  avatar: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: fontSize.xl, fontWeight: '800', color: colors.white },
  cardName: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  cardMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  verifiedRow: { flexDirection: 'row', marginTop: 6 },
  trustLabel: { fontSize: fontSize.xs, color: colors.textSecondary },
  trustScore: { fontSize: fontSize.lg, fontWeight: '800' },
  amountRow: { flexDirection: 'row', gap: spacing.md },
  amountBox: {
    flex: 1, backgroundColor: colors.background, padding: spacing.md,
    borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border,
  },
  amountLabel: { fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: 4 },
  amountValue: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  milestoneStatus: { fontSize: fontSize.sm, fontWeight: '600' },
  progressSection: { gap: 6 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: fontSize.xs, color: colors.textSecondary },
  progressPct: { fontSize: fontSize.xs, fontWeight: '700' },
  bar: { backgroundColor: colors.border },
  milestonesSection: { gap: spacing.xs },
  milestonesTitle: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text, marginBottom: 4 },
  milestoneRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  milestoneText: { fontSize: fontSize.sm, color: colors.textSecondary, flex: 1 },
  investDate: { fontSize: fontSize.xs, color: colors.grayDark },
});
