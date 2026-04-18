import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';
import { Badge, ProgressBar, Card } from '../components/ui';

interface Milestone {
  id: string;
  name: string;
  status: 'completed' | 'in-progress' | 'locked';
  progress?: number;
  fundAmount: number;
  date?: string;
}

interface AllocationItem {
  id: string;
  label: string;
  percentage: number;
  amount: number;
  color: string;
}

export default function StartupScreen() {
  const totalRaised = 144000;
  const fundingGoal = 200000;
  const weeklyRaise = 12000;
  const investors = 38;
  const remainingDays = 22;

  const milestones: Milestone[] = [
    {
      id: '1',
      name: 'Build MVP',
      status: 'completed',
      fundAmount: 30000,
      date: 'Completed · Verified',
    },
    {
      id: '2',
      name: 'Launch App',
      status: 'in-progress',
      progress: 60,
      fundAmount: 70000,
      date: 'In progress · Jul 2024',
    },
    {
      id: '3',
      name: 'Scale to 5 Cities',
      status: 'locked',
      fundAmount: 100000,
      date: 'Locked',
    },
  ];

  const allocation: AllocationItem[] = [
    { id: '1', label: 'Engineering', percentage: 43, amount: 61920, color: colors.black },
    { id: '2', label: 'Marketing', percentage: 30, amount: 43200, color: colors.green },
    { id: '3', label: 'Operations', percentage: 27, amount: 38880, color: colors.grayBadge },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Badge variant="done">Startup</Badge>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Fundraising Progress */}
        <Card variant="grey">
          <Text style={styles.raisedLabel}>TOTAL RAISED</Text>
          <Text style={styles.raisedAmount}>₹{(totalRaised / 1000).toFixed(0)}K</Text>
          <Text style={styles.weeklyIncrease}>+₹{(weeklyRaise / 1000).toFixed(0)}K this week</Text>
          <ProgressBar progress={(totalRaised / fundingGoal) * 100} style={styles.mainProgress} />
          <View style={styles.progressInfo}>
            <Text style={styles.progressLabel}>₹{(totalRaised / 1000).toFixed(0)}K</Text>
            <Text style={styles.progressLabel}>₹{(fundingGoal / 1000).toFixed(0)}K</Text>
          </View>
        </Card>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Investors</Text>
            <Text style={styles.metricValue}>{investors}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Days Left</Text>
            <Text style={styles.metricValue}>{remainingDays}</Text>
          </View>
        </View>

        {/* Milestone Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Milestone Status</Text>
          {milestones.map((milestone) => (
            <View key={milestone.id} style={styles.milestoneCard}>
              <View style={styles.milestoneHeader}>
                <View style={styles.milestoneIconContainer}>
                  {milestone.status === 'completed' && (
                    <View style={[styles.milestoneIcon, { backgroundColor: colors.greenLight }]}>
                      <Text style={styles.milestoneIconText}>✓</Text>
                    </View>
                  )}
                  {milestone.status === 'in-progress' && (
                    <View style={[styles.milestoneIcon, { borderWidth: 2, borderColor: colors.border, backgroundColor: colors.white }]}>
                      <Text style={styles.milestoneIconText}>ON</Text>
                    </View>
                  )}
                  {milestone.status === 'locked' && (
                    <View style={[styles.milestoneIcon, { backgroundColor: colors.grayBadge }]}>
                      <Text style={styles.milestoneIconText}>—</Text>
                    </View>
                  )}
                </View>
                <View style={styles.milestoneInfo}>
                  <Text style={styles.milestoneName}>{milestone.name}</Text>
                  <Text style={styles.milestoneDate}>{milestone.date}</Text>
                </View>
                <Badge
                  variant={
                    milestone.status === 'completed'
                      ? 'done'
                      : milestone.status === 'in-progress'
                      ? 'pending'
                      : 'locked'
                  }
                >
                  {milestone.status === 'completed'
                    ? 'Released'
                    : milestone.status === 'in-progress'
                    ? 'Pending'
                    : 'Locked'}
                </Badge>
              </View>
              {milestone.progress && (
                <>
                  <ProgressBar progress={milestone.progress} style={styles.milestoneProgress} />
                  <Text style={styles.progressLabel}>{milestone.progress}% towards goal</Text>
                </>
              )}
            </View>
          ))}
        </View>

        {/* Fund Allocation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fund Allocation</Text>
          {allocation.map((item) => (
            <View key={item.id} style={styles.allocationItem}>
              <View style={styles.allocationHeader}>
                <Text style={styles.allocationLabel}>{item.label}</Text>
                <Text style={styles.allocationPercentage}>{item.percentage}%</Text>
              </View>
              <ProgressBar
                progress={item.percentage}
                color={item.color}
                style={styles.allocationBar}
              />
              <Text style={styles.allocationAmount}>₹{(item.amount / 1000).toFixed(0)}K</Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Post an Update</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>View Investors</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSize.heading,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  raisedLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  raisedAmount: {
    fontSize: fontSize.display,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  weeklyIncrease: {
    fontSize: fontSize.md,
    color: colors.green,
    fontWeight: '500',
    marginBottom: spacing.md,
  },
  mainProgress: {
    marginBottom: spacing.md,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metricCard: {
    flex: 1,
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
    color: colors.text,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  milestoneCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  milestoneIconContainer: {
    marginTop: spacing.xs,
  },
  milestoneIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneIconText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.green,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  milestoneDate: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  milestoneProgress: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  allocationItem: {
    backgroundColor: colors.gray,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  allocationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  allocationLabel: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text,
  },
  allocationPercentage: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text,
  },
  allocationBar: {
    marginBottom: spacing.sm,
  },
  allocationAmount: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  actionsSection: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  primaryBtn: {
    backgroundColor: colors.black,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.white,
  },
  secondaryBtn: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: fontSize.lg,
    fontWeight: '500',
    color: colors.text,
  },
});