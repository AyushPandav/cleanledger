import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ProgressBar, Badge } from '../../components/ui';
import { useAuth, API_HOST_NODE } from '../../context/AuthContext';

export default function StartupDashboardScreen() {
     const router = useRouter();
     const { user } = useAuth();
     const [profile, setProfile] = useState<any>(null);
     const [investments, setInvestments] = useState<any[]>([]);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          if (!user?.id) return;

          const fetchData = async () => {
               try {
                    // Fetch profile
                    const pRes = await fetch(`${API_HOST_NODE}/api/user/${user.id}`);
                    const pData = await pRes.json();
                    if (pData.success) setProfile(pData.user);

                    // Fetch investments received
                    const iRes = await fetch(`${API_HOST_NODE}/api/startup-investments/${user.id}`);
                    const iData = await iRes.json();
                    if (iData.success) setInvestments(iData.investments);
               } catch (e) {
                    console.error('Error fetching dashboard data:', e);
               } finally {
                    setLoading(false);
               }
          };

          fetchData();
     }, [user?.id]);

     const totalFunded = investments.reduce((sum, inv) => sum + (inv.amountInvested || 0), 0);
     const goal = profile?.fundingGoal || 5000000;
     const progress = Math.min(Math.round((totalFunded / goal) * 100), 100);

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
                         <Text style={styles.largeTotal}>
                              ₹{(totalFunded / 100000).toFixed(1)}L <Text style={styles.subTotal}>/ ₹{(goal / 100000).toFixed(1)}L</Text>
                         </Text>
                         <ProgressBar progress={progress} height={8} style={{ marginVertical: spacing.md }} />
                         <View style={styles.rowBetween}>
                              <Text style={styles.cardMeta}>{progress}% Funded</Text>
                              <Text style={styles.cardMeta}>{investments.length} Investors</Text>
                         </View>
                    </View>

                    {/* ── Create & Manage Profile CTA ───────────── */}
                    <TouchableOpacity style={styles.profileCta} onPress={() => router.push('/(startup)/create-profile')} activeOpacity={0.9}>
                         <View style={styles.profileCtaLeft}>
                              <View style={styles.profileCtaIcon}>
                                   <MaterialCommunityIcons name="rocket-launch-outline" size={22} color={colors.white} />
                              </View>
                              <View style={{ flex: 1 }}>
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
                         {investments.length === 0 ? (
                              <Text style={{ textAlign: 'center', color: colors.textSecondary, paddingVertical: 20 }}>No investments received yet.</Text>
                         ) : (
                              investments.slice(0, 5).map((inv, idx) => (
                                   <View key={inv._id || idx} style={[styles.activityItem, idx === investments.slice(0, 5).length - 1 && { borderBottomWidth: 0 }]}>
                                        <View style={styles.activityIcon}>
                                             <MaterialCommunityIcons name="currency-inr" size={16} color={colors.green} />
                                        </View>
                                        <View style={styles.activityInfo}>
                                             <Text style={styles.activityTitle}>₹{inv.amountInvested?.toLocaleString('en-IN')} Received</Text>
                                             <Text style={styles.activityTime}>
                                                  {new Date(inv.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} from {inv.investorName || 'Anonymous'}
                                             </Text>
                                        </View>
                                   </View>
                              ))
                         )}
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
     content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 100 },
     card: {
          backgroundColor: colors.white, borderRadius: borderRadius.lg,
          padding: spacing.lg, borderWidth: 1, borderColor: colors.border,
     },
     cardTitle: { fontSize: fontSize.base, fontWeight: '600', color: colors.textSecondary },
     largeTotal: { fontSize: 32, fontWeight: '700', color: colors.text, marginTop: spacing.xs },
     subTotal: { fontSize: fontSize.base, color: colors.textSecondary, fontWeight: '500' },
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

