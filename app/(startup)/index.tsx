import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ProgressBar, Badge } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';

export default function StartupDashboardScreen() {
     const router = useRouter();
     const { user } = useAuth();

     return (
          <SafeAreaView style={styles.container}>
               <View style={styles.header}>
                    <View>
                         <Text style={styles.greeting}>Startup Dashboard</Text>
                         <Text style={styles.headerTitle}>{user?.name || 'Company'} 🚀</Text>
                    </View>
                    <Badge variant="low">Startup</Badge>
               </View>
               <ScrollView contentContainerStyle={styles.content}>
                    {/* Funding Progress */}
                    <View style={styles.card}>
                         <Text style={styles.cardTitle}>Funding Goal</Text>
                         <Text style={styles.largeTotal}>₹36L <Text style={styles.subTotal}>/ ₹50L</Text></Text>
                         <ProgressBar progress={72} height={8} style={{ marginVertical: spacing.md }} />
                         <View style={styles.rowBetween}>
                              <Text style={styles.cardMeta}>72% Funded</Text>
                              <Text style={styles.cardMeta}>12 Investors</Text>
                         </View>
                    </View>

                    {/* ── Create & Manage Profile CTA ───────────── */}
                    <TouchableOpacity style={styles.profileCta} onPress={() => router.push('/(startup)/create-profile')} activeOpacity={0.9}>
                         <View style={styles.profileCtaLeft}>
                              <View style={styles.profileCtaIcon}>
                                   <MaterialCommunityIcons name="rocket-launch-outline" size={22} color={colors.white} />
                              </View>
                              <View>
                                   <Text style={styles.profileCtaTitle}>Build Your Startup Profile</Text>
                                   <Text style={styles.profileCtaSubtitle}>Get an AI-powered scorecard & appear in investor rankings</Text>
                              </View>
                         </View>
                         <MaterialCommunityIcons name="chevron-right" size={22} color={colors.black} />
                    </TouchableOpacity>

                    {/* Quick Actions */}
                    <View style={styles.actionGrid}>
                         <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(startup)/updates')}>
                              <MaterialCommunityIcons name="bullhorn-outline" size={24} color={colors.text} />
                              <Text style={styles.actionText}>Post Update</Text>
                         </TouchableOpacity>
                         <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(startup)/milestones')}>
                              <MaterialCommunityIcons name="flag-outline" size={24} color={colors.text} />
                              <Text style={styles.actionText}>Milestone</Text>
                         </TouchableOpacity>
                         <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(startup)/fundusage')}>
                              <MaterialCommunityIcons name="cash-multiple" size={24} color={colors.text} />
                              <Text style={styles.actionText}>Allocate Funds</Text>
                         </TouchableOpacity>
                    </View>

                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    <View style={styles.card}>
                         <View style={styles.activityItem}>
                              <View style={styles.activityIcon}><MaterialCommunityIcons name="currency-inr" size={16} color={colors.green} /></View>
                              <View style={styles.activityInfo}>
                                   <Text style={styles.activityTitle}>₹5,00,000 Invested</Text>
                                   <Text style={styles.activityTime}>2 hours ago</Text>
                              </View>
                         </View>
                         <View style={[styles.activityItem, { borderBottomWidth: 0 }]}>
                              <View style={[styles.activityIcon, { backgroundColor: colors.grayMedium }]}><MaterialCommunityIcons name="flag" size={16} color={colors.black} /></View>
                              <View style={styles.activityInfo}>
                                   <Text style={styles.activityTitle}>Milestone 2 Verified</Text>
                                   <Text style={styles.activityTime}>Yesterday</Text>
                              </View>
                         </View>
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
     greeting: { fontSize: fontSize.sm, color: colors.textSecondary },
     headerTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
     content: { padding: spacing.lg, gap: spacing.md },
     card: {
          backgroundColor: colors.white, borderRadius: borderRadius.lg,
          padding: spacing.lg, borderWidth: 1, borderColor: colors.border,
     },
     cardTitle: { fontSize: fontSize.base, fontWeight: '600', color: colors.textSecondary },
     largeTotal: { fontSize: 36, fontWeight: '700', color: colors.text, marginTop: spacing.xs },
     subTotal: { fontSize: fontSize.lg, color: colors.textSecondary, fontWeight: '500' },
     rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
     cardMeta: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '600' },
     actionGrid: { flexDirection: 'row', gap: spacing.sm },
     actionCard: {
          flex: 1, backgroundColor: colors.white, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border,
          padding: spacing.md, alignItems: 'center', gap: spacing.sm, height: 90, justifyContent: 'center'
     },
     actionText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text, textAlign: 'center' },
     sectionTitle: { fontSize: fontSize.base, fontWeight: '700', textTransform: 'uppercase', marginTop: spacing.sm },
     activityItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLighter },
     activityIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.greenLight, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
     activityInfo: { flex: 1 },
     activityTitle: { fontSize: fontSize.base, fontWeight: '600', color: colors.text },
     activityTime: { fontSize: fontSize.sm, color: colors.textSecondary },
     profileCta: {
          backgroundColor: colors.white, borderRadius: borderRadius.lg,
          borderWidth: 1.5, borderColor: colors.black,
          padding: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
     },
     profileCtaLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
     profileCtaIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.black, alignItems: 'center', justifyContent: 'center' },
     profileCtaTitle: { fontSize: fontSize.base, fontWeight: '700', color: colors.text },
     profileCtaSubtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2, flexShrink: 1 },
});
