import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { useRouter } from 'expo-router';
import { API_HOST_NODE, API_HOST_PYTHON } from '../../context/AuthContext';
import { Badge } from '../../components/ui';

const INDUSTRY_COLORS: Record<string, string> = {
  FinTech: '#6366F1', HealthTech: '#10B981', EdTech: '#0EA5E9',
  AgriTech: '#22C55E', 'AI/ML': '#8B5CF6', Logistics: '#F59E0B',
  SaaS: '#EC4899', Other: '#64748B',
};

const getRisk = (r: string): 'low' | 'med' | 'high' => {
  const s = r?.toLowerCase() || '';
  if (s.includes('low')) return 'low';
  if (s.includes('med')) return 'med';
  return 'high';
};

function StatBar({ label, value, max = 100, color }: { label: string; value: number; max?: number; color: string }) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  return (
    <View style={barStyles.row}>
      <Text style={barStyles.label}>{label}</Text>
      <View style={barStyles.track}>
        <View style={[barStyles.fill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={[barStyles.val, { color }]}>{value}</Text>
    </View>
  );
}

const barStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { width: 64, fontSize: 11, color: '#64748B', fontWeight: '600' },
  track: { flex: 1, height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  val: { width: 28, fontSize: 12, fontWeight: '800', textAlign: 'right' },
});

export default function CompareScreen() {
  const router = useRouter();
  const [startups, setStartups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_HOST_NODE}/api/startups`)
      .then(r => r.json())
      .then(d => { if (d.success) setStartups(d.startups); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleSelect = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(i => i !== id));
    } else if (selected.length < 2) {
      setSelected([...selected, id]);
    }
  };

  const handleCompare = async () => {
    if (selected.length !== 2) return;
    setComparing(true);
    setResult(null);
    const s1 = startups.find(s => (s.id || s._id) === selected[0]);
    const s2 = startups.find(s => (s.id || s._id) === selected[1]);

    try {
      const res = await fetch(`${API_HOST_PYTHON}/api/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startup1: s1, startup2: s2 }),
      });
      const data = await res.json();
      setResult(data.comparison || 'Comparison complete.');
    } catch {
      setResult(`No AI comparison available right now, but here's what we know:\n\n${s1?.name} has a trust score of ${s1?.aiTrustScore || 0}/100 vs ${s2?.name} at ${s2?.aiTrustScore || 0}/100.\n\n${(s1?.aiTrustScore || 0) >= (s2?.aiTrustScore || 0) ? s1?.name : s2?.name} leads in AI trust score.`);
    } finally {
      setComparing(false);
    }
  };

  const s1 = startups.find(s => (s.id || s._id) === selected[0]);
  const s2 = startups.find(s => (s.id || s._id) === selected[1]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#334155" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Compare</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.instruction}>
          Select <Text style={{ fontWeight: '800', color: '#0F172A' }}>2 startups</Text> from your platform to run an AI-powered side-by-side comparison.
        </Text>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.green} />
            <Text style={styles.loadingText}>Loading startups…</Text>
          </View>
        ) : startups.length === 0 ? (
          <View style={styles.centered}>
            <MaterialCommunityIcons name="telescope" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No startups have built profiles yet.</Text>
          </View>
        ) : (
          <>
            {/* Selection count */}
            <View style={styles.selectionBar}>
              <MaterialCommunityIcons
                name={selected.length === 2 ? 'check-circle' : 'circle-outline'}
                size={16}
                color={selected.length === 2 ? '#10B981' : '#94A3B8'}
              />
              <Text style={[styles.selectionText, selected.length === 2 && { color: '#10B981' }]}>
                {selected.length}/2 selected
              </Text>
            </View>

            {/* Startup grid */}
            <View style={styles.grid}>
              {startups.map((s, idx) => {
                const sid = s.id || s._id;
                const isSelected = selected.includes(sid);
                const accent = INDUSTRY_COLORS[s.industry] || '#64748B';
                const selIdx = selected.indexOf(sid);
                return (
                  <TouchableOpacity
                    key={sid || idx}
                    style={[styles.startupCard, isSelected && { borderColor: accent, backgroundColor: accent + '12' }]}
                    onPress={() => toggleSelect(sid)}
                    activeOpacity={0.8}
                  >
                    {isSelected && (
                      <View style={[styles.selBadge, { backgroundColor: accent }]}>
                        <Text style={styles.selBadgeText}>{selIdx + 1}</Text>
                      </View>
                    )}
                    <View style={[styles.cardAvatar, { backgroundColor: accent }]}>
                      <Text style={styles.cardAvatarText}>{s.name?.charAt(0) || 'S'}</Text>
                    </View>
                    <Text style={[styles.cardName, isSelected && { color: '#0F172A' }]} numberOfLines={1}>{s.name}</Text>
                    <Text style={styles.cardInd}>{s.industry}</Text>
                    <Text style={[styles.cardTrust, { color: (s.aiTrustScore || 0) >= 70 ? '#10B981' : '#F59E0B' }]}>
                      {s.aiTrustScore || 0}/100
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Side-by-side quick preview when 2 selected */}
            {s1 && s2 && !result && (
              <View style={styles.previewRow}>
                {[s1, s2].map((s, i) => {
                  const accent = INDUSTRY_COLORS[s.industry] || '#64748B';
                  return (
                    <View key={i} style={[styles.previewCard, { borderColor: accent + '40' }]}>
                      <View style={[styles.previewAvatar, { backgroundColor: accent }]}>
                        <Text style={styles.previewAvatarText}>{s.name?.charAt(0)}</Text>
                      </View>
                      <Text style={styles.previewName} numberOfLines={1}>{s.name}</Text>
                      <Badge variant={getRisk(s.aiRiskLevel)}>
                        {getRisk(s.aiRiskLevel) === 'low' ? 'Low Risk' : getRisk(s.aiRiskLevel) === 'med' ? 'Med Risk' : 'High Risk'}
                      </Badge>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Compare button */}
            <TouchableOpacity
              style={[styles.compareBtn, (selected.length !== 2 || comparing) && styles.disabledBtn]}
              disabled={selected.length !== 2 || comparing}
              onPress={handleCompare}
              activeOpacity={0.85}
            >
              {comparing ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <MaterialCommunityIcons name="robot-outline" size={18} color={colors.white} />
                  <Text style={styles.compareBtnText}>
                    {selected.length < 2 ? `Select ${2 - selected.length} more` : 'Compare with Mistral AI'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* AI Result */}
            {result && s1 && s2 && (
              <View style={styles.resultBox}>
                <View style={styles.resultHeader}>
                  <MaterialCommunityIcons name="robot-outline" size={20} color={colors.green} />
                  <Text style={styles.resultTitle}>AI Analysis</Text>
                </View>

                <Text style={styles.resultText}>{result}</Text>

                {/* Stats comparison */}
                <View style={styles.statsSection}>
                  <Text style={styles.statsTitle}>Side-by-Side Metrics</Text>
                  {[
                    { label: 'AI Trust Score', s1val: s1.aiTrustScore || 0, s2val: s2.aiTrustScore || 0, max: 100 },
                    { label: 'Profile Score', s1val: s1.profileCompletionScore || 0, s2val: s2.profileCompletionScore || 0, max: 100 },
                    { label: 'Team Size', s1val: (s1.teamMembers?.length || 0) * 10, s2val: (s2.teamMembers?.length || 0) * 10, max: 50 },
                    { label: 'Milestones', s1val: (s1.milestones?.length || 0) * 10, s2val: (s2.milestones?.length || 0) * 10, max: 50 },
                  ].map(row => (
                    <View key={row.label} style={styles.statsRow}>
                      <Text style={styles.statsLabel}>{row.label}</Text>
                      <View style={{ flex: 1 }}>
                        <View style={styles.doubleBarRow}>
                          <Text style={styles.doubleBarName} numberOfLines={1}>{s1.name}</Text>
                          <StatBar label="" value={row.s1val} max={row.max} color={INDUSTRY_COLORS[s1.industry] || '#6366F1'} />
                        </View>
                        <View style={styles.doubleBarRow}>
                          <Text style={styles.doubleBarName} numberOfLines={1}>{s2.name}</Text>
                          <StatBar label="" value={row.s2val} max={row.max} color={INDUSTRY_COLORS[s2.industry] || '#10B981'} />
                        </View>
                      </View>
                    </View>
                  ))}
                </View>

                <TouchableOpacity style={styles.resetBtn} onPress={() => { setSelected([]); setResult(null); }}>
                  <MaterialCommunityIcons name="refresh" size={18} color={colors.white} />
                  <Text style={styles.resetBtnText}>Compare Again</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  content: { padding: spacing.lg, paddingBottom: 100, gap: spacing.lg },

  instruction: { fontSize: 14, color: '#64748B', lineHeight: 22 },

  centered: { alignItems: 'center', gap: 12, paddingVertical: 40 },
  loadingText: { fontSize: fontSize.sm, color: '#94A3B8' },
  emptyText: { fontSize: fontSize.sm, color: '#94A3B8', textAlign: 'center' },

  selectionBar: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.white, padding: 10, borderRadius: 10,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  selectionText: { fontSize: 13, fontWeight: '700', color: '#94A3B8' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  startupCard: {
    width: '47%', padding: 14, backgroundColor: colors.white,
    borderRadius: 16, borderWidth: 2, borderColor: '#E2E8F0',
    alignItems: 'center', gap: 6, position: 'relative',
  },
  selBadge: {
    position: 'absolute', top: -6, right: -6,
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  selBadgeText: { fontSize: 11, fontWeight: '900', color: colors.white },
  cardAvatar: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardAvatarText: { fontSize: 20, fontWeight: '800', color: colors.white },
  cardName: { fontSize: 13, fontWeight: '700', color: '#334155', textAlign: 'center' },
  cardInd: { fontSize: 11, color: '#94A3B8' },
  cardTrust: { fontSize: 14, fontWeight: '800' },

  previewRow: { flexDirection: 'row', gap: 12 },
  previewCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: 14,
    padding: 14, alignItems: 'center', gap: 8, borderWidth: 2,
  },
  previewAvatar: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  previewAvatarText: { fontSize: 20, fontWeight: '800', color: colors.white },
  previewName: { fontSize: 13, fontWeight: '700', color: '#0F172A' },

  compareBtn: {
    backgroundColor: '#10B981', padding: 16, borderRadius: 14,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
  },
  disabledBtn: { backgroundColor: '#CBD5E1' },
  compareBtnText: { color: colors.white, fontSize: 15, fontWeight: '700' },

  resultBox: {
    backgroundColor: colors.white, borderRadius: 20,
    borderWidth: 1, borderColor: '#E2E8F0', padding: 18, gap: 16,
  },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  resultTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  resultText: { fontSize: 14, color: '#334155', lineHeight: 22 },

  statsSection: { gap: 14 },
  statsTitle: { fontSize: 13, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 },
  statsRow: { gap: 6 },
  statsLabel: { fontSize: 12, fontWeight: '700', color: '#334155' },
  doubleBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  doubleBarName: { width: 60, fontSize: 11, color: '#64748B', fontWeight: '500' },

  resetBtn: {
    backgroundColor: '#0F172A', borderRadius: 12, padding: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  resetBtnText: { color: colors.white, fontSize: 14, fontWeight: '700' },
});
