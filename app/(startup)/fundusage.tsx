import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';

export default function StartupFundUsageScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fund Usage</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.chartCard}>
            <Text style={styles.totalRaised}>₹36,00,000</Text>
            <Text style={styles.raisedLabel}>Total Raised</Text>
            
            <View style={styles.bar}>
               <View style={[styles.segment, { flex: 4, backgroundColor: colors.black }]} />
               <View style={[styles.segment, { flex: 3, backgroundColor: colors.green }]} />
               <View style={[styles.segment, { flex: 2, backgroundColor: colors.grayDark }]} />
               <View style={[styles.segment, { flex: 1, backgroundColor: colors.border }]} />
            </View>
        </View>

        <Text style={styles.sectionTitle}>Breakdown</Text>
        
        <View style={styles.breakdownItem}>
            <View style={[styles.dot, {backgroundColor: colors.black}]} />
            <Text style={styles.categoryName}>Product Development</Text>
            <Text style={styles.categoryAmount}>40%</Text>
        </View>
        <View style={styles.breakdownItem}>
            <View style={[styles.dot, {backgroundColor: colors.green}]} />
            <Text style={styles.categoryName}>Marketing & Sales</Text>
            <Text style={styles.categoryAmount}>30%</Text>
        </View>
        <View style={styles.breakdownItem}>
            <View style={[styles.dot, {backgroundColor: colors.grayDark}]} />
            <Text style={styles.categoryName}>Operations</Text>
            <Text style={styles.categoryAmount}>20%</Text>
        </View>
        <View style={styles.breakdownItem}>
            <View style={[styles.dot, {backgroundColor: colors.border}]} />
            <Text style={styles.categoryName}>Legal & Admin</Text>
            <Text style={styles.categoryAmount}>10%</Text>
        </View>
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
  content: { padding: spacing.lg, gap: spacing.md },
  chartCard: {
     backgroundColor: colors.white, borderRadius: borderRadius.lg,
     padding: spacing.xl, borderWidth: 1, borderColor: colors.border,
     alignItems: 'center', marginBottom: spacing.lg
  },
  totalRaised: { fontSize: 32, fontWeight: '700', color: colors.text },
  raisedLabel: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xl },
  bar: { flexDirection: 'row', height: 16, borderRadius: borderRadius.full, overflow: 'hidden', width: '100%' },
  segment: { height: '100%' },
  sectionTitle: { fontSize: fontSize.base, fontWeight: '700', textTransform: 'uppercase', marginBottom: spacing.sm },
  breakdownItem: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
      padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border,
  },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: spacing.md },
  categoryName: { flex: 1, fontSize: fontSize.base, color: colors.text, fontWeight: '500' },
  categoryAmount: { fontSize: fontSize.base, fontWeight: '700' },
});
