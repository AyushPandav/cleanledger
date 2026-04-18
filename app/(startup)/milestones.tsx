import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { ProgressBar } from '../../components/ui';

export default function StartupMilestonesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Milestones</Text>
        <TouchableOpacity style={styles.addButton}>
            <MaterialCommunityIcons name="plus" size={20} color={colors.white} />
            <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
             <View style={styles.milestoneHeader}>
                  <Text style={styles.milestoneTitle}>Beta Launch</Text>
                  <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>In Progress</Text>
                  </View>
             </View>
             <Text style={styles.milestoneDesc}>Complete beta testing and launch to initial 100 users.</Text>
             <ProgressBar progress={60} height={8} style={{marginTop: spacing.md, marginBottom: spacing.sm}} />
             <Text style={styles.progressText}>60% Complete</Text>
        </View>

        <View style={styles.card}>
             <View style={styles.milestoneHeader}>
                  <Text style={styles.milestoneTitle}>Seed Funding</Text>
                  <View style={[styles.statusBadge, {backgroundColor: colors.greenLight}]}>
                      <Text style={[styles.statusText, {color: colors.green}]}>Completed</Text>
                  </View>
             </View>
             <Text style={styles.milestoneDesc}>Raise initial ₹50L for product development.</Text>
             <ProgressBar progress={100} height={8} style={{marginTop: spacing.md, marginBottom: spacing.sm}} />
             <Text style={styles.progressText}>100% Complete</Text>
        </View>
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
  addButton: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: colors.black,
      paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.md,
  },
  addButtonText: { color: colors.white, fontWeight: '600', marginLeft: 4},
  content: { padding: spacing.lg, gap: spacing.md },
  card: {
    backgroundColor: colors.white, borderRadius: borderRadius.lg,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  milestoneHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  milestoneTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.text },
  statusBadge: { backgroundColor: colors.yellowLight, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.sm },
  statusText: { fontSize: fontSize.xs, color: colors.yellow, fontWeight: '700', textTransform: 'uppercase' },
  milestoneDesc: { fontSize: fontSize.sm, color: colors.textSecondary },
  progressText: { fontSize: fontSize.xs, color: colors.textSecondary, textAlign: 'right'},
});
