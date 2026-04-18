import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { Badge, ProgressBar } from '../../components/ui';
import { API_HOST_NODE } from '../../context/AuthContext';

const filters = ['All', 'FinTech', 'HealthTech', 'EdTech', 'AgriTech', 'AI/ML', 'Low Risk'];

// Helper to determine badge color from risk string
const getRiskColor = (riskStr: string) => {
  const r = riskStr?.toLowerCase() || '';
  if (r.includes('low')) return 'low';
  if (r.includes('med')) return 'med';
  return 'high';
};

// Helper for UI colors per dynamic item
const getColorForIndex = (index: number) => {
  const c = [colors.black, '#4F46E5', colors.green, '#E11D48', '#0EA5E9', '#10B981'];
  return c[index % c.length];
};

export default function ExploreScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [startups, setStartups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_HOST_NODE}/api/startups`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.startups) {
          // The API already sorts by trust score descending!
          // We just need to map them to inject ranking and colors.
          const mapped = data.startups.map((s: any, idx: number) => ({
            ...s,
            rank: idx + 1,
            color: getColorForIndex(idx),
            risk: getRiskColor(s.aiRiskLevel)
          }));
          setStartups(mapped);
        }
      })
      .catch(err => console.log('Explore fetch Error:', err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = startups.filter((s) => {
    const matchSearch = (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.industry || '').toLowerCase().includes(search.toLowerCase());

    if (activeFilter === 'All') return matchSearch;
    if (activeFilter === 'Low Risk') return matchSearch && s.risk === 'low';
    return matchSearch && s.industry === activeFilter;
  });

  const handleSearch = (text: string) => {
    setSearch(text);
    if (text.length > 0 && activeFilter !== 'All') {
      setActiveFilter('All');
    }
  };

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
          <Text style={styles.headerTitle}>Explore</Text>
          <Text style={styles.headerSub}>Discover {filtered.length} trending startups</Text>
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <MaterialCommunityIcons name="blur" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <MaterialCommunityIcons name="magnify" size={20} color={colors.grayDark} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
            placeholder="Search startups, industries..."
            placeholderTextColor={colors.grayDark}
            value={search}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} style={styles.clearBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialCommunityIcons name="close-circle" size={18} color={colors.grayDark} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={styles.filterContent}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, activeFilter === f && styles.chipActive]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id || Math.random().toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="magnify" size={48} color={colors.grayBadge} />
            <Text style={styles.emptyText}>No startups found matching your criteria</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push('/detail')} activeOpacity={0.95}>
            <View style={[styles.cardBanner, { backgroundColor: item.color }]} />

            <View style={styles.cardBody}>
              <View style={styles.cardTopRow}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm }}>
                  <View style={[styles.avatar, { backgroundColor: item.color }]}>
                    <Text style={styles.avatarText}>{item.name ? item.name.charAt(0) : 'U'}</Text>
                  </View>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#{item.rank}</Text>
                  </View>
                  {item.businessRegistered && item.kycCompleted ? (
                    <View style={[styles.rankBadge, { backgroundColor: colors.green, borderColor: colors.green }]}>
                      <Text style={[styles.rankText, { color: colors.white }]}>Fully Verified</Text>
                    </View>
                  ) : item.businessRegistered || item.kycCompleted ? (
                    <View style={[styles.rankBadge, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
                      <Text style={[styles.rankText, { color: '#B45309' }]}>Partially Verified</Text>
                    </View>
                  ) : (
                    <View style={[styles.rankBadge, { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }]}>
                      <Text style={[styles.rankText, { color: '#B91C1C' }]}>Not Verified</Text>
                    </View>
                  )}
                </View>
                <View style={{ marginTop: 12, alignItems: 'flex-end', gap: 4 }}>
                  <Badge variant={item.risk}>{item.risk === 'low' ? 'Low Risk' : item.risk === 'med' ? 'Med Risk' : 'High Risk'}</Badge>
                  <Text style={styles.trustScore}>🤖 Trust {item.aiTrustScore || 0}/100</Text>
                </View>
              </View>

              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardMeta}>{item.industry}  •  {item.stage || 'Startup'}</Text>
              </View>

              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.goalText}>Raising: <Text style={styles.goalAmount}>₹{item.fundingGoal}</Text></Text>
                  <Text style={[styles.pct, { color: item.color }]}>{item.profileCompletionScore}% setup</Text>
                </View>
                <ProgressBar progress={item.profileCompletionScore || 0} height={6} style={styles.bar} />
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg,
    backgroundColor: '#F8F9FA',
  },
  headerTitle: { fontSize: 32, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  headerSub: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 4, fontWeight: '500' },
  filterBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: colors.black, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 2 },
      web: { boxShadow: '0 4px 8px rgba(0,0,0,0.05)' }
    }),
  },
  searchContainer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    borderRadius: borderRadius.full, paddingHorizontal: spacing.md,
    borderWidth: 1, borderColor: colors.border, height: 48,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: fontSize.base, color: colors.text, height: '100%' },
  clearBtn: { padding: 4 },
  filterBar: { flexGrow: 0, marginBottom: spacing.md },
  filterContent: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: 4 },
  chip: {
    paddingHorizontal: spacing.lg, paddingVertical: 10, borderRadius: borderRadius.full,
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.black, borderColor: colors.black },
  chipText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textSecondary },
  chipTextActive: { color: colors.white },
  list: { padding: spacing.lg, paddingBottom: 100, gap: spacing.lg },
  card: {
    backgroundColor: colors.white, borderRadius: borderRadius.xl,
    overflow: 'hidden', borderWidth: 1, borderColor: colors.border,
    ...Platform.select({
      ios: { shadowColor: colors.black, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 16 },
      android: { elevation: 3 },
      web: { boxShadow: '0 8px 16px rgba(0,0,0,0.04)' }
    }),
  },
  cardBanner: { height: 8, width: '100%' },
  cardBody: { padding: spacing.lg },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  avatar: {
    width: 64, height: 64, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    transform: [{ translateY: -20 }], marginBottom: -20,
    borderWidth: 3, borderColor: colors.white,
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: colors.white },
  rankBadge: { backgroundColor: colors.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: borderRadius.sm, borderWidth: 1, borderColor: colors.border },
  rankText: { fontSize: fontSize.xs, fontWeight: '700', color: colors.text },
  trustScore: { fontSize: fontSize.sm, fontWeight: '700', color: colors.green },
  cardInfo: { marginBottom: spacing.lg },
  cardName: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text, marginBottom: 4 },
  cardMeta: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '500' },
  progressSection: { backgroundColor: '#F8F9FA', padding: spacing.md, borderRadius: borderRadius.md },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: spacing.sm },
  goalText: { fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: '500' },
  goalAmount: { fontSize: fontSize.base, color: colors.text, fontWeight: '700', marginLeft: 4 },
  pct: { fontSize: fontSize.sm, fontWeight: '700' },
  bar: { backgroundColor: '#E5E7EB' },
  empty: { padding: spacing.xl, alignItems: 'center', marginTop: 40 },
  emptyText: { marginTop: spacing.md, fontSize: fontSize.base, color: colors.grayDark, textAlign: 'center' },
});
