import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';
import { Card, ProgressBar, Button, Badge } from '../components/ui';

const presetAmounts = [1000, 5000, 10000, 25000];

export default function InvestScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('5000');
  const base = 144000;
  const goal = 200000;

  const investAmount = parseInt(amount) || 0;
  const newRaised = base + investAmount;
  const newPct = Math.min(100, Math.round((newRaised / goal) * 1000) / 10);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invest</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card variant="grey">
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Funding goal</Text>
            <Text style={styles.infoValue}>₹2,00,000</Text>
          </View>
          <View style={[styles.infoRow, { marginBottom: spacing.sm }]}>
            <Text style={styles.infoLabel}>Already raised</Text>
            <Text style={[styles.infoValue, { color: colors.green }]}>₹1,44,000</Text>
          </View>
          <ProgressBar progress={72} />
          <Text style={styles.progressInfo}>72% · 28% remaining</Text>
        </Card>

        <Text style={styles.sectionTitle}>Enter amount</Text>
        <View style={styles.inputRow}>
          <Text style={styles.currency}>₹</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.presetRow}>
          {presetAmounts.map((val) => (
            <TouchableOpacity
              key={val}
              style={[styles.presetBtn, amount === val.toString() && styles.presetBtnActive]}
              onPress={() => setAmount(val.toString())}
            >
              <Text style={[styles.presetBtnText, amount === val.toString() && styles.presetBtnTextActive]}>
                ₹{val.toLocaleString()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Card>
          <Text style={styles.afterLabel}>After your contribution</Text>
          <ProgressBar progress={newPct} style={styles.newProgress} />
          <View style={styles.resultRow}>
            <Text style={[styles.resultValue, { color: colors.green }]}>₹{newRaised.toLocaleString()}</Text>
            <Text style={styles.resultPct}>{newPct}%</Text>
          </View>
        </Card>

        <Card variant="grey" style={{ marginBottom: spacing.lg }}>
          <Text style={styles.escrowLabel}>Fund allocation (milestone-based)</Text>
          <Text style={styles.escrowText}>
            Your funds are held in escrow and released only upon verified milestone completion, tracked on-chain.
          </Text>
        </Card>

        <Button variant="green">
          Confirm ₹{parseInt(amount || '0').toLocaleString()}
        </Button>
        <Button variant="secondary">Cancel</Button>
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  infoLabel: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  progressInfo: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  currency: {
    backgroundColor: colors.gray,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.grayDark,
  },
  amountInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.xl,
    fontWeight: '600',
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  presetBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
  },
  presetBtnActive: {
    backgroundColor: colors.black,
    borderColor: colors.black,
  },
  presetBtnText: {
    fontSize: fontSize.sm,
    color: colors.grayDark,
  },
  presetBtnTextActive: {
    color: colors.white,
  },
  afterLabel: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  newProgress: {
    marginBottom: spacing.xs,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resultValue: {
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  resultPct: {
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  escrowLabel: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  escrowText: {
    fontSize: fontSize.md,
    color: colors.textTertiary,
    lineHeight: 20,
  },
});