import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  TextInput, ScrollView, Platform, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { Badge } from '../../components/ui';
import { API_HOST_NODE } from '../../context/AuthContext';

const FILTERS = ['All', 'FinTech', 'HealthTech', 'EdTech', 'AgriTech', 'AI/ML', 'Low Risk', 'Verified'];

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
const getIndustryColor = (industry: string) => INDUSTRY_COLORS[industry] || '#64748B';

export default function ExploreScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [startups, setStartups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_HOST_NODE}/api/startups`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.startups) {
          setStartups(data.startups.map((s: any, idx: number) => ({
            ...s,
            rank: idx + 1,
            accentColor: getIndustryColor(s.industry),
            risk: getRiskVariant(s.aiRiskLevel),
          })));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = startups.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = (s.name || '').toLowerCase().includes(q) ||
      (s.industry || '').toLowerCase().includes(q);
    if (activeFilter === 'All') return matchSearch;
    if (activeFilter === 'Low Risk') return matchSearch && s.risk === 'low';
    if (activeFilter === 'Verified') return matchSearch && (s.businessRegistered || s.kycCompleted);
    return matchSearch && s.industry === activeFilter;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Explore</Text>
          <Text style={styles.headerSub}>{filtered.length} startups ranked by AI</Text>
        </View>
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons name="chart-timeline-variant" size={20} color={colors.green} />
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#94A3B8" style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.searchInput, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
          placeholder="Search startups, industries…"
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={t => { setSearch(t); if (t && activeFilter !== 'All') setActiveFilter('All'); }}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <MaterialCommunityIcons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={styles.filterBar} contentContainerStyle={styles.filterContent}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f}
            style={[styles.chip, activeFilter === f && styles.chipActive]}
            onPress={() => setActiveFilter(f)} activeOpacity={0.7}>
            <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.green} />
          <Text style={styles.loadingText}>Ranking startups by AI…</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id || item._id || Math.random().toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="telescope" size={56} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptySubtitle}>Try a different search or filter</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isVerified = item.businessRegistered && item.kycCompleted;
            const isPartialVerified = item.businessRegistered || item.kycCompleted;
            const trust = item.aiTrustScore || 0;
            const trustColor = trust >= 70 ? '#10B981' : trust >= 40 ? '#F59E0B' : '#EF4444';

            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push({ pathname: '/detail', params: { id: item.id || item._id } })}
                activeOpacity={0.93}
              >
                {/* Colored top strip */}
                <View style={[styles.cardStrip, { backgroundColor: item.accentColor }]} />

                <View style={styles.cardContent}>
                  {/* Avatar + Rank row */}
                  <View style={styles.cardHeader}>
                    <View style={[styles.avatar, { backgroundColor: item.accentColor }]}>
                      <Text style={styles.avatarText}>{item.name?.charAt(0) || 'S'}</Text>
                    </View>

                    <View style={styles.cardHeaderMid}>
                      <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.cardMeta}>{item.industry || 'Unknown'}  ·  {item.stage || 'Early Stage'}</Text>
                    </View>

                    <View style={styles.rankPill}>
                      <Text style={styles.rankText}>#{item.rank}</Text>
                    </View>
                  </View>

                  {/* Tags row */}
                  <View style={styles.tagsRow}>
                    <Badge variant={item.risk}>
                      {item.risk === 'low' ? 'Low Risk' : item.risk === 'med' ? 'Med Risk' : 'High Risk'}
                    </Badge>

                    {isVerified ? (
                      <View style={styles.verifyBadge}>
                        <MaterialCommunityIcons name="shield-check" size={12} color="#10B981" />
                        <Text style={[styles.verifyText, { color: '#10B981' }]}>Fully Verified</Text>
                      </View>
                    ) : isPartialVerified ? (
                      <View style={[styles.verifyBadge, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
                        <MaterialCommunityIcons name="shield-half-full" size={12} color="#D97706" />
                        <Text style={[styles.verifyText, { color: '#D97706' }]}>Partial</Text>
                      </View>
                    ) : (
                      <View style={[styles.verifyBadge, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
                        <MaterialCommunityIcons name="shield-off-outline" size={12} color="#DC2626" />
                        <Text style={[styles.verifyText, { color: '#DC2626' }]}>Unverified</Text>
                      </View>
                    )}
                  </View>

                  {/* Stats row */}
                  <View style={styles.statsRow}>
                    {/* Trust score */}
                    <View style={styles.statBox}>
                      <View style={styles.statLabelRow}>
                        <MaterialCommunityIcons name="robot-outline" size={12} color="#94A3B8" />
                        <Text style={styles.statLabel}>AI Trust</Text>
                      </View>
                      <Text style={[styles.statValue, { color: trustColor }]}>{trust}<Text style={styles.statUnit}>/100</Text></Text>
                    </View>

                    {/* Funding goal */}
                    <View style={[styles.statBox, styles.statBoxMid]}>
                      <View style={styles.statLabelRow}>
                        <MaterialCommunityIcons name="currency-inr" size={12} color="#94A3B8" />
                        <Text style={styles.statLabel}>Goal</Text>
                      </View>
                      <Text style={styles.statValue}>
                        {item.fundingGoal ? `₹${(item.fundingGoal / 100000).toFixed(1)}L` : 'N/A'}
                      </Text>
                    </View>

                    {/* Completion */}
                    <View style={styles.statBox}>
                      <View style={styles.statLabelRow}>
                        <MaterialCommunityIcons name="progress-check" size={12} color="#94A3B8" />
                        <Text style={styles.statLabel}>Profile</Text>
                      </View>
                      <Text style={styles.statValue}>{item.profileCompletionScore || 0}<Text style={styles.statUnit}>%</Text></Text>
                    </View>
                  </View>

                  {/* Progress bar */}
                  <View style={styles.progressBg}>
                    <View style={[styles.progressFill, {
                      width: `${Math.min(item.profileCompletionScore || 0, 100)}%` as any,
                      backgroundColor: item.accentColor,
                    }]} />
                  </View>

                  {/* Tap hint */}
                  <View style={styles.tapHint}>
                    <Text style={styles.tapHintText}>View full profile</Text>
                    <MaterialCommunityIcons name="chevron-right" size={14} color="#94A3B8" />
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm,
    backgroundColor: '#F1F5F9',
  },
  headerTitle: { fontSize: 30, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
  headerSub: { fontSize: fontSize.sm, color: '#64748B', marginTop: 2, fontWeight: '500' },
  headerIcon: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: colors.white, borderWidth: 1, borderColor: '#E2E8F0',
    alignItems: 'center', justifyContent: 'center',
  },

  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: 14,
    marginHorizontal: spacing.lg, marginBottom: spacing.sm,
    paddingHorizontal: spacing.md, paddingVertical: 12,
    borderWidth: 1, borderColor: '#E2E8F0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  searchInput: { flex: 1, fontSize: fontSize.base, color: '#0F172A' },

  filterBar: { flexGrow: 0, marginBottom: spacing.md },
  filterContent: { paddingHorizontal: spacing.lg, gap: 8, paddingBottom: 2 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: colors.white, borderWidth: 1, borderColor: '#E2E8F0',
  },
  chipActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  chipTextActive: { color: colors.white },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: fontSize.sm, color: '#94A3B8' },

  list: { paddingHorizontal: spacing.lg, paddingBottom: 110, gap: 14 },

  emptyState: { paddingTop: 60, alignItems: 'center', gap: 12 },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: '700', color: '#334155' },
  emptySubtitle: { fontSize: fontSize.sm, color: '#94A3B8' },

  card: {
    backgroundColor: colors.white, borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: '#E2E8F0',
    ...Platform.select({
      ios: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12 },
      android: { elevation: 3 },
    }),
  },
  cardStrip: { height: 4 },
  cardContent: { padding: 16, gap: 12 },

  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: '800', color: colors.white },
  cardHeaderMid: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: '700', color: '#0F172A', letterSpacing: -0.2 },
  cardMeta: { fontSize: 12, color: '#64748B', marginTop: 2, fontWeight: '500' },
  rankPill: {
    backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0',
  },
  rankText: { fontSize: 12, fontWeight: '800', color: '#334155' },

  tagsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  verifyBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
  },
  verifyText: { fontSize: 11, fontWeight: '700' },

  statsRow: { flexDirection: 'row', gap: 8 },
  statBox: {
    flex: 1, backgroundColor: '#F8FAFC', borderRadius: 12,
    padding: 10, borderWidth: 1, borderColor: '#F1F5F9',
  },
  statBoxMid: { borderLeftWidth: 0, borderRightWidth: 0 },
  statLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 4 },
  statLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  statValue: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  statUnit: { fontSize: 11, fontWeight: '600', color: '#94A3B8' },

  progressBg: { height: 4, backgroundColor: '#F1F5F9', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, borderRadius: 2 },

  tapHint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 2, marginTop: -4 },
  tapHintText: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
});
