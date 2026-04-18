import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { Badge, ProgressBar } from '../../components/ui';
import { API_HOST_NODE } from '../../context/AuthContext';

// Helper for UI colors per dynamic item
const getColorForIndex = (index: number) => {
  const c = [colors.black, '#4F46E5', colors.green, '#E11D48', '#0EA5E9', '#10B981'];
  return c[index % c.length];
};

const getRiskColor = (riskStr: string) => {
  const r = riskStr?.toLowerCase() || '';
  if (r.includes('low')) return 'low';
  if (r.includes('med')) return 'med';
  return 'high';
};

export default function InvestmentsScreen() {
  const router = useRouter();
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_HOST_NODE}/api/startups`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.startups) {
          // Mock investments from the real dynamic startups!
          // Give them some fake returns and investment state for visualization.
          const dynamicStartups = data.startups.slice(0, 3).map((s: any, i: number) => {
            const amountInvested = 10000 * (i + 1);
            const growth = 1.0 + (s.aiTrustScore / 100);
            const currentValue = amountInvested * growth;
            return {
              id: s.id,
              initials: s.name ? s.name.charAt(0) : 'U',
              name: s.name,
              industry: s.industry,
              amountInvested,
              currentValue,
              progress: s.profileCompletionScore,
              risk: getRiskColor(s.aiRiskLevel),
              color: getColorForIndex(i),
              businessRegistered: s.businessRegistered,
              kycCompleted: s.kycCompleted,
              milestone: s.milestones?.[0]?.title || 'Development',
              milestoneNum: 1,
              milestoneTotal: Math.max(s.milestones?.length || 1, 3),
              date: new Date(s.createdAt || Date.now()).toLocaleDateString()
            };
          });
          setInvestments(dynamicStartups);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalInvested = investments.reduce((s, i) => s + i.amountInvested, 0);
  const totalCurrent = investments.reduce((s, i) => s + i.currentValue, 0);
  const gain = totalCurrent - totalInvested;

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
        <Badge variant="low">{`${investments.length} Active`}</Badge>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Invested</Text>
              <Text style={styles.summaryValue}>₹{(totalInvested / 1000).toFixed(0)}K</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Current Value</Text>
              <Text style={[styles.summaryValue, { color: colors.green }]}>₹{(totalCurrent / 1000).toFixed(1)}K</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Unrealised P&L</Text>
              <Text style={[styles.summaryValue, { color: gain >= 0 ? colors.green : colors.red }]}>
                {gain >= 0 ? '+' : ''}₹{(gain / 1000).toFixed(1)}K
              </Text>
            </View>
          </View>
        </View>

        {/* Investments */}
        <Text style={styles.sectionTitle}>Your Investments</Text>
        {investments.length === 0 ? (
          <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 20 }}>No investments mapped yet.</Text>
        ) : investments.map((inv, idx) => {
          const returnPct = (((inv.currentValue - inv.amountInvested) / inv.amountInvested) * 100).toFixed(1);
          const isPositive = inv.currentValue >= inv.amountInvested;
          const uniqueKey = inv.id || inv._id || `inv-${idx}`;
          return (
            <TouchableOpacity key={uniqueKey} style={styles.card} onPress={() => router.push('/detail')}>
              <View style={styles.cardTop}>
                <View style={[styles.avatar, { backgroundColor: inv.color }]}>
                  <Text style={styles.avatarText}>{inv.initials}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{inv.name}</Text>
                  <Text style={styles.cardMeta}>{inv.industry} · Invested {inv.date}</Text>
                  {inv.businessRegistered && inv.kycCompleted ? (
                    <Text style={{ fontSize: 12, color: colors.green, marginTop: 4, fontWeight: '700' }}>Fully Verified</Text>
                  ) : inv.businessRegistered || inv.kycCompleted ? (
                    <Text style={{ fontSize: 12, color: '#F59E0B', marginTop: 4, fontWeight: '700' }}>Partially Verified</Text>
                  ) : (
                    <Text style={{ fontSize: 12, color: '#EF4444', marginTop: 4, fontWeight: '700' }}>Not Verified</Text>
                  )}
                </View>
                <View style={styles.cardRight}>
                  <Text style={[styles.returnPct, { color: isPositive ? colors.green : colors.red }]}>
                    {isPositive ? '+' : ''}{returnPct}%
                  </Text>
                  <Badge variant={inv.risk}>{inv.risk === 'low' ? 'Low' : inv.risk === 'med' ? 'Med' : 'High'}</Badge>
                </View>
              </View>

              <ProgressBar progress={inv.progress} height={6} style={styles.bar} />

              <View style={styles.cardBottom}>
                <View>
                  <Text style={styles.amountLabel}>Invested</Text>
                  <Text style={styles.amountValue}>₹{(inv.amountInvested / 1000).toFixed(0)}K</Text>
                </View>
                <View>
                  <Text style={styles.amountLabel}>Now Worth</Text>
                  <Text style={[styles.amountValue, { color: isPositive ? colors.green : colors.red }]}>
                    ₹{(inv.currentValue / 1000).toFixed(1)}K
                  </Text>
                </View>
                <View>
                  <Text style={styles.amountLabel}>Profile Goal</Text>
                  <Text style={styles.amountValue}>{inv.progress}% setup</Text>
                </View>
              </View>

              <View style={styles.milestoneRow}>
                <MaterialCommunityIcons name="flag-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.milestoneText}>
                  Milestone {inv.milestoneNum}/{inv.milestoneTotal}: {inv.milestone}
                </Text>
              </View>
            </TouchableOpacity>
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
  card: {
    backgroundColor: colors.white, borderRadius: borderRadius.lg,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  avatar: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: fontSize.base, fontWeight: '700', color: colors.white },
  cardInfo: { flex: 1, marginLeft: spacing.md },
  cardName: { fontSize: fontSize.lg, fontWeight: '600', color: colors.text },
  cardMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  returnPct: { fontSize: fontSize.base, fontWeight: '700' },
  bar: { marginBottom: spacing.md },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  amountLabel: { fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: 2 },
  amountValue: { fontSize: fontSize.base, fontWeight: '600', color: colors.text },
  milestoneRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.borderLighter,
  },
  milestoneText: { fontSize: fontSize.sm, color: colors.textSecondary, flex: 1 },
});
