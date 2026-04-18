import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Platform, StatusBar
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';
import { Badge } from '../components/ui';
import { API_HOST_NODE } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';

const INDUSTRY_COLORS: Record<string, string> = {
  FinTech: '#6366F1', HealthTech: '#10B981', EdTech: '#0EA5E9',
  AgriTech: '#22C55E', 'AI/ML': '#8B5CF6', Logistics: '#F59E0B',
  SaaS: '#EC4899', Other: '#64748B',
};

const getRiskVariant = (r: string): 'low' | 'med' | 'high' => {
  const s = r?.toLowerCase() || '';
  if (s.includes('low')) return 'low';
  if (s.includes('med')) return 'med';
  return 'high';
};

function InfoChip({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.infoChip}>
      <MaterialCommunityIcons name={icon as any} size={13} color="#64748B" />
      <Text style={styles.infoChipText}>{label}</Text>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function DetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [startup, setStartup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [investing, setInvesting] = useState(false);
  const [invested, setInvested] = useState(false);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    fetch(`${API_HOST_NODE}/api/user/${id}`)
      .then(r => r.json())
      .then(d => { if (d.success) setStartup(d.user); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleInvest = async () => {
    if (!user?.id || !startup?.id) return;
    setInvesting(true);
    try {
      const r = await fetch(`${API_HOST_NODE}/api/investments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          investorId: user.id,
          startupId: startup.id,
          amountInvested: startup.fundingGoal ? startup.fundingGoal * 0.01 : 10000,
        }),
      });
      const d = await r.json();
      if (d.success) setInvested(true);
    } catch (e) { console.error(e); }
    finally { setInvesting(false); }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.green} />
        <Text style={styles.loadingText}>Loading startup profile…</Text>
      </SafeAreaView>
    );
  }

  if (!startup) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#CBD5E1" />
        <Text style={styles.notFoundText}>Startup not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const accentColor = INDUSTRY_COLORS[startup.industry] || '#64748B';
  const risk = getRiskVariant(startup.aiRiskLevel);
  const trust = startup.aiTrustScore || 0;
  const trustColor = trust >= 70 ? '#10B981' : trust >= 40 ? '#F59E0B' : '#EF4444';
  const teamMembers: any[] = startup.teamMembers || [];
  const milestones: any[] = startup.milestones || [];
  const profileScore = startup.profileCompletionScore || 0;
  const isFullyVerified = startup.businessRegistered && startup.kycCompleted;
  const isPartial = startup.businessRegistered || startup.kycCompleted;

  const verifyColor = isFullyVerified ? '#10B981' : isPartial ? '#D97706' : '#DC2626';
  const verifyBg = isFullyVerified ? '#ECFDF5' : isPartial ? '#FFFBEB' : '#FEF2F2';
  const verifyLabel = isFullyVerified ? 'Fully Verified' : isPartial ? 'Partially Verified' : 'Not Verified';
  const verifyIcon = isFullyVerified ? 'shield-check' : isPartial ? 'shield-half-full' : 'shield-off-outline';

  return (
    <View style={styles.root}>
      {/* Hero Banner */}
      <View style={[styles.heroBanner, { backgroundColor: accentColor, paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={20} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
        <View style={styles.heroContent}>
          <View style={styles.heroAvatar}>
            <Text style={styles.heroAvatarText}>{startup.name?.charAt(0) || 'S'}</Text>
          </View>
          <Text style={styles.heroName}>{startup.name}</Text>
          <View style={styles.heroMeta}>
            <InfoChip icon="domain" label={startup.industry || 'Unknown'} />
            <InfoChip icon="rocket-launch-outline" label={startup.stage || 'Early Stage'} />
            {startup.foundedYear ? <InfoChip icon="calendar-outline" label={`Est. ${startup.foundedYear}`} /> : null}
          </View>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

        {/* Status badges */}
        <View style={styles.statusRow}>
          <Badge variant={risk}>{risk === 'low' ? 'Low Risk' : risk === 'med' ? 'Med Risk' : 'High Risk'}</Badge>
          <View style={[styles.verifyPill, { backgroundColor: verifyBg }]}>
            <MaterialCommunityIcons name={verifyIcon as any} size={13} color={verifyColor} />
            <Text style={[styles.verifyPillText, { color: verifyColor }]}>{verifyLabel}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.description}>
            {startup.description || 'No description provided for this startup yet.'}
          </Text>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <MaterialCommunityIcons name="currency-inr" size={18} color={accentColor} />
            <Text style={styles.metricValue}>{startup.fundingGoal ? `₹${(startup.fundingGoal / 100000).toFixed(1)}L` : '—'}</Text>
            <Text style={styles.metricLabel}>Funding Goal</Text>
          </View>
          <View style={styles.metricCard}>
            <MaterialCommunityIcons name="account-group-outline" size={18} color={accentColor} />
            <Text style={styles.metricValue}>{teamMembers.length || '—'}</Text>
            <Text style={styles.metricLabel}>Team Size</Text>
          </View>
          <View style={styles.metricCard}>
            <MaterialCommunityIcons name="flag-checkered" size={18} color={accentColor} />
            <Text style={styles.metricValue}>{milestones.length}</Text>
            <Text style={styles.metricLabel}>Milestones</Text>
          </View>
          <View style={styles.metricCard}>
            <MaterialCommunityIcons name="chart-bar" size={18} color={accentColor} />
            <Text style={styles.metricValue}>{profileScore}%</Text>
            <Text style={styles.metricLabel}>Profile</Text>
          </View>
        </View>

        {/* Profile Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeaderRow}>
            <Text style={styles.progressCardLabel}>Profile Completion</Text>
            <Text style={[styles.progressCardPct, { color: profileScore >= 70 ? '#10B981' : profileScore >= 40 ? '#F59E0B' : '#EF4444' }]}>
              {profileScore}%
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.min(profileScore, 100)}%` as any, backgroundColor: accentColor }]} />
          </View>
        </View>

        {/* AI Trust Score */}
        <SectionHeader title="AI Trust Score" />
        <View style={styles.trustCard}>
          <View style={styles.trustLeft}>
            <View style={[styles.trustCircle, { borderColor: trustColor }]}>
              <Text style={[styles.trustNumber, { color: trustColor }]}>{trust}</Text>
              <Text style={styles.trustDenom}>/100</Text>
            </View>
          </View>
          <View style={styles.trustRight}>
            <Badge variant={risk}>{risk === 'low' ? 'Credible' : risk === 'med' ? 'Moderate Risk' : 'High Risk'}</Badge>
            <Text style={styles.trustDesc}>AI-powered score based on profile completeness, verification status, and team strength.</Text>

            {(startup.aiInsights || []).slice(0, 2).map((ins: string, i: number) => (
              <View key={i} style={styles.insightRow}>
                <View style={styles.insightDot} />
                <Text style={styles.insightText}>{ins}</Text>
              </View>
            ))}
            {(startup.aiWarnings || []).slice(0, 2).map((w: string, i: number) => (
              <View key={i} style={styles.warningRow}>
                <MaterialCommunityIcons name="alert-circle-outline" size={13} color="#D97706" />
                <Text style={styles.warningText}>{w}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Verification Checklist */}
        <SectionHeader title="Verification Checklist" />
        <View style={styles.card}>
          {[
            { label: 'Business Registration', value: startup.businessRegistered, icon: 'office-building-outline' },
            { label: 'Founder KYC', value: startup.kycCompleted, icon: 'account-check-outline' },
            { label: 'PAN Registered', value: !!startup.panId, icon: 'card-account-details-outline' },
            { label: 'GST Registered', value: !!startup.gstRegistration, icon: 'file-certificate-outline' },
          ].map((item, i) => (
            <View key={i} style={[styles.checkRow, i > 0 && styles.checkRowBorder]}>
              <MaterialCommunityIcons name={item.icon as any} size={18} color="#94A3B8" />
              <Text style={styles.checkLabel}>{item.label}</Text>
              <View style={[styles.checkStatus, { backgroundColor: item.value ? '#ECFDF5' : '#FEF2F2' }]}>
                <MaterialCommunityIcons
                  name={item.value ? 'check' : 'close'}
                  size={13}
                  color={item.value ? '#10B981' : '#DC2626'}
                />
                <Text style={[styles.checkStatusText, { color: item.value ? '#10B981' : '#DC2626' }]}>
                  {item.value ? 'Verified' : 'Pending'}
                </Text>
              </View>
            </View>
          ))}
          {startup.founderExperience ? (
            <View style={[styles.checkRow, styles.checkRowBorder]}>
              <MaterialCommunityIcons name="briefcase-outline" size={18} color="#94A3B8" />
              <Text style={styles.checkLabel}>Founder XP</Text>
              <Text style={styles.checkValue}>{startup.founderExperience}</Text>
            </View>
          ) : null}
        </View>

        {/* Team */}
        <SectionHeader title="Team" />
        {teamMembers.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons name="account-group-outline" size={32} color="#CBD5E1" />
            <Text style={styles.emptyCardText}>No team members listed yet</Text>
          </View>
        ) : (
          <View style={styles.card}>
            {teamMembers.map((m: any, i: number) => {
              const initials = m.name ? m.name.split(' ').map((p: string) => p[0]).join('').toUpperCase().slice(0, 2) : '?';
              return (
                <View key={i} style={[styles.memberRow, i > 0 && styles.checkRowBorder]}>
                  <View style={[styles.memberAvatar, { backgroundColor: accentColor + '22' }]}>
                    <Text style={[styles.memberAvatarText, { color: accentColor }]}>{initials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.memberName}>{m.name}</Text>
                    <Text style={styles.memberRole}>{m.role}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Milestones */}
        <SectionHeader title="Milestones" />
        {milestones.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons name="flag-outline" size={32} color="#CBD5E1" />
            <Text style={styles.emptyCardText}>No milestones defined yet</Text>
          </View>
        ) : (
          <View style={styles.card}>
            {milestones.map((m: any, i: number) => (
              <View key={i} style={[styles.milestoneRow, i > 0 && styles.checkRowBorder]}>
                <View style={[styles.milestoneDot, { backgroundColor: m.completed ? '#10B981' : '#E2E8F0' }]}>
                  <MaterialCommunityIcons
                    name={m.completed ? 'check' : 'dots-horizontal'}
                    size={12}
                    color={m.completed ? colors.white : '#94A3B8'}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.milestoneTitle, m.completed && { color: '#10B981' }]}>{m.title}</Text>
                  {m.targetDate ? <Text style={styles.milestoneDate}>Target: {m.targetDate}</Text> : null}
                </View>
                <View style={[styles.milestoneChip, { backgroundColor: m.completed ? '#ECFDF5' : '#F8FAFC' }]}>
                  <Text style={[styles.milestoneChipText, { color: m.completed ? '#10B981' : '#94A3B8' }]}>
                    {m.completed ? 'Done' : 'Pending'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

      </ScrollView>

      {/* Invest CTA — floating bottom bar */}
      {user?.role === 'investor' && (
        <View style={[styles.investBar, { paddingBottom: insets.bottom + 8 }]}>
          <View style={styles.investBarInner}>
            <View>
              <Text style={styles.investBarLabel}>Minimum Investment</Text>
              <Text style={styles.investBarAmount}>
                ₹{startup.fundingGoal ? ((startup.fundingGoal * 0.01) / 1000).toFixed(0) + 'K' : '10K'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.investBtn, { backgroundColor: invested ? '#64748B' : accentColor }]}
              onPress={handleInvest}
              disabled={investing || invested}
              activeOpacity={0.85}
            >
              {investing ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name={invested ? 'check-circle-outline' : 'currency-inr'}
                    size={18} color={colors.white}
                  />
                  <Text style={styles.investBtnText}>{invested ? 'Invested!' : 'Invest Now'}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F1F5F9' },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#F1F5F9' },
  loadingText: { fontSize: fontSize.sm, color: '#94A3B8' },
  notFoundText: { fontSize: fontSize.lg, fontWeight: '600', color: '#334155' },
  backLink: { marginTop: 8 },
  backLinkText: { color: colors.green, fontWeight: '600', fontSize: fontSize.base },

  heroBanner: { paddingHorizontal: spacing.lg, paddingBottom: 28 },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.15)', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  heroContent: { alignItems: 'center', gap: 10 },
  heroAvatar: {
    width: 80, height: 80, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)', borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroAvatarText: { fontSize: 34, fontWeight: '900', color: colors.white },
  heroName: { fontSize: 22, fontWeight: '800', color: colors.white, letterSpacing: -0.3 },
  heroMeta: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },

  infoChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20,
  },
  infoChipText: { fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },

  scroll: { flex: 1, marginTop: -12 },

  statusRow: {
    flexDirection: 'row', gap: 8, alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: 20, paddingBottom: 4,
  },
  verifyPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  verifyPillText: { fontSize: 12, fontWeight: '700' },

  section: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  description: { fontSize: 14, color: '#475569', lineHeight: 22 },

  metricsGrid: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: spacing.lg, marginBottom: spacing.md,
  },
  metricCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: 16,
    padding: 12, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  metricValue: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  metricLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },

  progressCard: {
    marginHorizontal: spacing.lg, backgroundColor: colors.white,
    borderRadius: 16, padding: 14, marginBottom: spacing.md,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  progressHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressCardLabel: { fontSize: 13, fontWeight: '600', color: '#334155' },
  progressCardPct: { fontSize: 13, fontWeight: '800' },
  progressTrack: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },

  sectionHeader: {
    fontSize: 13, fontWeight: '700', color: '#94A3B8',
    textTransform: 'uppercase', letterSpacing: 0.5,
    paddingHorizontal: spacing.lg, marginTop: spacing.md, marginBottom: 8,
  },

  trustCard: {
    marginHorizontal: spacing.lg, backgroundColor: colors.white,
    borderRadius: 16, padding: 16, flexDirection: 'row', gap: 16,
    borderWidth: 1, borderColor: '#E2E8F0', marginBottom: spacing.sm,
  },
  trustLeft: { alignItems: 'center', justifyContent: 'flex-start' },
  trustCircle: {
    width: 72, height: 72, borderRadius: 36, borderWidth: 5,
    alignItems: 'center', justifyContent: 'center',
  },
  trustNumber: { fontSize: 22, fontWeight: '900', lineHeight: 26 },
  trustDenom: { fontSize: 10, color: '#94A3B8', fontWeight: '600' },
  trustRight: { flex: 1, gap: 8 },
  trustDesc: { fontSize: 12, color: '#64748B', lineHeight: 18 },
  insightRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  insightDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginTop: 5 },
  insightText: { fontSize: 12, color: '#475569', flex: 1, lineHeight: 17 },
  warningRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 5 },
  warningText: { fontSize: 12, color: '#92400E', flex: 1, lineHeight: 17 },

  card: {
    marginHorizontal: spacing.lg, backgroundColor: colors.white,
    borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  checkRowBorder: { borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  checkLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: '#334155' },
  checkValue: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  checkStatus: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  checkStatusText: { fontSize: 11, fontWeight: '700' },

  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  memberAvatar: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  memberAvatarText: { fontSize: 15, fontWeight: '800' },
  memberName: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  memberRole: { fontSize: 12, color: '#64748B', marginTop: 2 },

  milestoneRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  milestoneDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  milestoneTitle: { fontSize: 14, fontWeight: '600', color: '#334155' },
  milestoneDate: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  milestoneChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  milestoneChipText: { fontSize: 11, fontWeight: '700' },

  emptyCard: {
    marginHorizontal: spacing.lg, backgroundColor: colors.white,
    borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0',
    padding: 32, alignItems: 'center', gap: 8, marginBottom: spacing.sm,
  },
  emptyCardText: { fontSize: 13, color: '#94A3B8' },

  investBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: '#E2E8F0',
    paddingHorizontal: spacing.lg, paddingTop: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.06, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  investBarInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  investBarLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  investBarAmount: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  investBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14,
  },
  investBtnText: { color: colors.white, fontSize: 15, fontWeight: '700' },
});