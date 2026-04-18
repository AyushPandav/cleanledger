import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';
import { Badge, ProgressBar, Card, SectionTitle, Button } from '../components/ui';

export default function DetailScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>NexaHealth</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statusRow}>
          <Badge variant="low">Low Risk</Badge>
          <Text style={styles.industry}>HealthTech · Seed Stage</Text>
        </View>

        <Text style={styles.description}>
          AI-powered diagnostics for rural healthcare providers. Reducing diagnosis time by 60% with offline-capable mobile tools.
        </Text>

        <View style={styles.metrics}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Goal</Text>
            <Text style={styles.metricValue}>₹2,00,000</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Raised</Text>
            <Text style={[styles.metricValue, { color: colors.green }]}>₹1,44,000</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Investors</Text>
            <Text style={styles.metricValue}>38</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Days left</Text>
            <Text style={styles.metricValue}>22</Text>
          </View>
        </View>

        <ProgressBar progress={72} style={styles.mainProgress} />
        <Text style={styles.progressLabel}>72% funded</Text>

        <SectionTitle>Credibility Score</SectionTitle>
        <Card>
          <View style={styles.scoreRow}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreNumber}>74</Text>
            </View>
            <View style={styles.scoreInfo}>
              <Text style={styles.scoreTitle}>74 / 100</Text>
              <Badge variant="low">Credible</Badge>
              <Text style={styles.scoreHint}>Based on team, docs & activity</Text>
            </View>
          </View>
        </Card>

        <SectionTitle>Team</SectionTitle>
        <Card variant="grey">
          <View style={styles.teamMember}>
            <View style={styles.memberAvatar}>RK</View>
            <View>
              <Text style={styles.memberName}>Rahul Khanna</Text>
              <Text style={styles.memberRole}>CEO · Ex-Apollo Hospitals</Text>
            </View>
          </View>
          <View style={[styles.teamMember, { marginTop: spacing.sm }]}>
            <View style={styles.memberAvatar}>PM</View>
            <View>
              <Text style={styles.memberName}>Priya Mehta</Text>
              <Text style={styles.memberRole}>CTO · IIT Bombay</Text>
            </View>
          </View>
        </Card>

        <SectionTitle>Milestones</SectionTitle>
        <Card>
          <View style={styles.milestoneRow}>
            <View style={[styles.milestoneIcon, { backgroundColor: colors.greenLight }]}>✓</View>
            <View style={styles.milestoneInfo}>
              <Text style={styles.milestoneName}>Build MVP</Text>
              <Text style={styles.milestoneDate}>Completed Mar 2024</Text>
            </View>
            <Text style={styles.milestoneAmt}>₹30,000</Text>
          </View>
          <View style={styles.milestoneRow}>
            <View style={[styles.milestoneIcon, { backgroundColor: colors.grayLight, borderWidth: 2, borderColor: colors.border }]}>...</View>
            <View style={styles.milestoneInfo}>
              <Text style={styles.milestoneName}>Launch App</Text>
              <Text style={styles.milestoneDate}>Expected Jul 2024</Text>
            </View>
            <Text style={styles.milestoneAmt}>₹70,000</Text>
          </View>
          <View style={styles.milestoneRow}>
            <View style={[styles.milestoneIcon, { backgroundColor: colors.grayBadge }]}>—</View>
            <View style={styles.milestoneInfo}>
              <Text style={styles.milestoneName}>Scale to 5 Cities</Text>
              <Text style={styles.milestoneDate}>Locked</Text>
            </View>
            <Text style={styles.milestoneAmt}>₹1,00,000</Text>
          </View>
        </Card>

        <Button variant="green" onPress={() => router.push('/invest')}>Invest Now</Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: spacing.xs,
  },
  backText: {
    fontSize: fontSize.base,
    color: colors.green,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  industry: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  description: {
    fontSize: fontSize.base,
    color: colors.textTertiary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  metricCard: {
    width: '48%',
    backgroundColor: colors.gray,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  metricLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  metricValue: {
    fontSize: fontSize.xl,
    fontWeight: '600',
  },
  mainProgress: {
    marginBottom: spacing.xs,
  },
  progressLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  scoreCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 8,
    borderColor: colors.borderLighter,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: fontSize.xl,
    fontWeight: '600',
  },
  scoreInfo: {
    flex: 1,
  },
  scoreTitle: {
    fontSize: fontSize.title,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  scoreHint: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  teamMember: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.grayMedium,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  memberName: {
    fontSize: fontSize.base,
    fontWeight: '500',
  },
  memberRole: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayLight,
  },
  milestoneIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneName: {
    fontSize: fontSize.base,
    fontWeight: '500',
  },
  milestoneDate: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  milestoneAmt: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});