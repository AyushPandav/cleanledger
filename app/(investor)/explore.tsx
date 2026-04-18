import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { Badge, ProgressBar } from '../../components/ui';

const allStartups = [
  { id: '1', initials: 'NX', name: 'NexaHealth', industry: 'HealthTech', stage: 'Seed Stage', progress: 72, risk: 'low' as const, color: colors.black, goal: '₹50L' },
  { id: '2', initials: 'FL', name: 'FlowLearn', industry: 'EdTech', stage: 'Pre-seed', progress: 45, risk: 'med' as const, color: '#4F46E5', goal: '₹20L' },
  { id: '3', initials: 'KR', name: 'Kredifi', industry: 'FinTech', stage: 'Series A', progress: 88, risk: 'low' as const, color: colors.green, goal: '₹2Cr' },
  { id: '4', initials: 'AG', name: 'AgroVault', industry: 'AgriTech', stage: 'Seed Stage', progress: 30, risk: 'high' as const, color: '#E11D48', goal: '₹35L' },
  { id: '5', initials: 'SR', name: 'Surgent AI', industry: 'AI/ML', stage: 'Pre-seed', progress: 58, risk: 'med' as const, color: '#0EA5E9', goal: '₹30L' },
  { id: '6', initials: 'TB', name: 'TechBridge', industry: 'FinTech', stage: 'Series A', progress: 95, risk: 'low' as const, color: '#10B981', goal: '₹1Cr' },
  { id: '7', initials: 'MH', name: 'MediHub', industry: 'HealthTech', stage: 'Seed Stage', progress: 50, risk: 'med' as const, color: colors.black, goal: '₹40L' },
];

const filters = ['All', 'FinTech', 'HealthTech', 'EdTech', 'AgriTech', 'AI/ML', 'Low Risk'];

export default function ExploreScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = allStartups.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.industry.toLowerCase().includes(search.toLowerCase());
    if (activeFilter === 'All') return matchSearch;
    if (activeFilter === 'Low Risk') return matchSearch && s.risk === 'low';
    return matchSearch && s.industry === activeFilter;
  });

  const handleSearch = (text: string) => {
    setSearch(text);
    // Automatically switch to 'All' tab if they are typing to avoid frustrating empty states
    if (text.length > 0 && activeFilter !== 'All') {
      setActiveFilter('All');
    }
  };

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
            <TouchableOpacity onPress={() => setSearch('')} style={styles.clearBtn} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
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
        keyExtractor={(item) => item.id}
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
                <View style={[styles.avatar, { backgroundColor: item.color }]}>
                  <Text style={styles.avatarText}>{item.initials}</Text>
                </View>
                <View style={{marginTop: 12}}>
                  <Badge variant={item.risk}>{item.risk === 'low' ? 'Low Risk' : item.risk === 'med' ? 'Med Risk' : 'High Risk'}</Badge>
                </View>
              </View>

              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardMeta}>{item.industry}  •  {item.stage}</Text>
              </View>

              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.goalText}>Raising: <Text style={styles.goalAmount}>{item.goal}</Text></Text>
                  <Text style={[styles.pct, { color: item.color }]}>{item.progress}%</Text>
                </View>
                <ProgressBar progress={item.progress} height={6} style={styles.bar} />
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
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 3 }
    })
  },
  searchContainer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg, height: 54,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 2 }
    })
  },
  searchIcon: { marginRight: spacing.sm },
  searchInput: { flex: 1, fontSize: fontSize.base, color: colors.text, fontWeight: '500' },
  clearBtn: { padding: spacing.xs },
  filterBar: { marginBottom: spacing.md },
  filterContent: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xs, gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.lg, paddingVertical: 12,
    borderRadius: borderRadius.full, backgroundColor: colors.white,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4 },
      android: { elevation: 1 }
    })
  },
  chipActive: { backgroundColor: colors.black },
  chipText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textSecondary },
  chipTextActive: { color: colors.white },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.xl },
  card: {
    backgroundColor: colors.white, borderRadius: 24,
    overflow: 'hidden', 
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16 },
      android: { elevation: 5 }
    })
  },
  cardBanner: { height: 70, width: '100%', opacity: 0.85 },
  cardBody: { padding: spacing.lg, paddingTop: 0 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: -28, marginBottom: spacing.md },
  avatar: { 
    width: 64, height: 64, borderRadius: 20, 
    alignItems: 'center', justifyContent: 'center', 
    borderWidth: 4, borderColor: colors.white, 
    backgroundColor: colors.white 
  },
  avatarText: { fontSize: 20, fontWeight: '800', color: colors.white },
  cardInfo: { marginBottom: spacing.lg, paddingHorizontal: 4 },
  cardName: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 4, letterSpacing: -0.3 },
  cardMeta: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '600' },
  progressSection: { backgroundColor: '#F8F9FA', padding: spacing.md, borderRadius: 16 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  goalText: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '500' },
  goalAmount: { color: colors.text, fontWeight: '800' },
  pct: { fontSize: fontSize.base, fontWeight: '800' },
  bar: { borderRadius: borderRadius.full },
  empty: { alignItems: 'center', paddingTop: 80, gap: spacing.md },
  emptyText: { fontSize: fontSize.base, color: colors.textSecondary, fontWeight: '500' },
});
