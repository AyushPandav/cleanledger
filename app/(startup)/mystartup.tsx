import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';

export default function StartupMyStartupScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Startup</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
             <View style={styles.avatar}>
               <Text style={styles.avatarText}>NX</Text>
             </View>
             <Text style={styles.name}>NexaHealth</Text>
             <Text style={styles.meta}>HealthTech · Seed Stage</Text>
             <View style={styles.tagRow}>
                 <View style={styles.tag}><Text style={styles.tagText}>Bengaluru, India</Text></View>
                 <View style={styles.tag}><Text style={styles.tagText}>B2B SaaS</Text></View>
             </View>
        </View>

        <Text style={styles.sectionTitle}>Overview</Text>
        <Text style={styles.desc}>NexaHealth is building the next generation of AI-powered hospital management systems. Our platform reduces administrative overhead by 40% and improves patient outcomes through predictive analytics.</Text>

        <Text style={[styles.sectionTitle, {marginTop: spacing.lg}]}>Funding Status</Text>
        <View style={styles.fundCard}>
             <View style={styles.fundRow}>
                  <Text style={styles.fundLabel}>Target</Text>
                  <Text style={styles.fundValue}>₹50,00,000</Text>
             </View>
             <View style={styles.divider} />
             <View style={styles.fundRow}>
                  <Text style={styles.fundLabel}>Raised</Text>
                  <Text style={[styles.fundValue, {color: colors.green}]}>₹36,00,000</Text>
             </View>
             <View style={styles.divider} />
             <View style={styles.fundRow}>
                  <Text style={styles.fundLabel}>Investors</Text>
                  <Text style={styles.fundValue}>12</Text>
             </View>
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
  content: { padding: spacing.lg },
  card: {
     backgroundColor: colors.white, borderRadius: borderRadius.lg,
     padding: spacing.xl, borderWidth: 1, borderColor: colors.border,
     alignItems: 'center', marginBottom: spacing.xl
  },
  avatar: { width: 64, height: 64, borderRadius: 16, backgroundColor: colors.black, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  avatarText: { fontSize: 24, fontWeight: '700', color: colors.white },
  name: { fontSize: 24, fontWeight: '700', color: colors.text },
  meta: { fontSize: fontSize.base, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.md },
  tagRow: { flexDirection: 'row', gap: spacing.sm },
  tag: { backgroundColor: colors.grayLight, paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: borderRadius.full },
  tagText: { fontSize: fontSize.xs, color: colors.grayDark, fontWeight: '600' },
  sectionTitle: { fontSize: fontSize.base, fontWeight: '700', textTransform: 'uppercase', marginBottom: spacing.sm },
  desc: { fontSize: fontSize.base, color: colors.textSecondary, lineHeight: 22 },
  fundCard: { backgroundColor: colors.white, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border },
  fundRow: { flexDirection: 'row', justifyContent: 'space-between', padding: spacing.md },
  fundLabel: { fontSize: fontSize.base, color: colors.textSecondary },
  fundValue: { fontSize: fontSize.base, fontWeight: '700', color: colors.text },
  divider: { height: 1, backgroundColor: colors.borderLighter, marginHorizontal: spacing.md },
});
