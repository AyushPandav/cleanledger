import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { Badge, ProgressBar } from '../../components/ui';

const myInvestments = [
  {
    id: '1', initials: 'NX', name: 'NexaHealth', industry: 'HealthTech',
    amountInvested: 15000, currentValue: 16800, progress: 72, risk: 'low' as const,
    color: colors.black, milestone: 'Clinical Trial (In Progress)', milestoneNum: 2, milestoneTotal: 4,
    date: 'Mar 2025',
  },
  {
    id: '2', initials: 'KR', name: 'Kredifi', industry: 'FinTech',
    amountInvested: 25000, currentValue: 29500, progress: 88, risk: 'low' as const,
    color: colors.green, milestone: 'Series A Closed', milestoneNum: 3, milestoneTotal: 3,
    date: 'Jan 2025',
  },
  {
    id: '3', initials: 'FL', name: 'FlowLearn', industry: 'EdTech',
    amountInvested: 10000, currentValue: 9200, progress: 45, risk: 'med' as const,
    color: colors.grayDark, milestone: 'Beta Launch Pending', milestoneNum: 1, milestoneTotal: 3,
    date: 'Feb 2025',
  },
];

export default function InvestmentsScreen() {
  const router = useRouter();
  const totalInvested = myInvestments.reduce((s, i) => s + i.amountInvested, 0);
  const totalCurrent = myInvestments.reduce((s, i) => s + i.currentValue, 0);
  const gain = totalCurrent - totalInvested;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Investments</Text>
        <Badge variant="low">{myInvestments.length} Active</Badge>
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
        {myInvestments.map((inv) => {
          const returnPct = (((inv.currentValue - inv.amountInvested) / inv.amountInvested) * 100).toFixed(1);
          const isPositive = inv.currentValue >= inv.amountInvested;
          return (
            <TouchableOpacity key={inv.id} style={styles.card} onPress={() => router.push('/detail')}>
              <View style={styles.cardTop}>
                <View style={[styles.avatar, { backgroundColor: inv.color }]}>
                  <Text style={styles.avatarText}>{inv.initials}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{inv.name}</Text>
                  <Text style={styles.cardMeta}>{inv.industry} · Invested {inv.date}</Text>
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
                  <Text style={styles.amountLabel}>Funding Goal</Text>
                  <Text style={styles.amountValue}>{inv.progress}% reached</Text>
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
  content: { padding: spacing.lg, gap: spacing.md },
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
