import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';
import { Badge, ProgressBar } from '../components/ui';

interface Startup {
  id: string;
  initials: string;
  name: string;
  industry: string;
  stage: string;
  progress: number;
  risk: 'low' | 'med' | 'high';
  color: string;
}

const allStartups: Startup[] = [
  { id: '1', initials: 'NX', name: 'NexaHealth', industry: 'HealthTech', stage: 'Seed Stage', progress: 72, risk: 'low', color: colors.black },
  { id: '2', initials: 'FL', name: 'FlowLearn', industry: 'EdTech', stage: 'Pre-seed', progress: 45, risk: 'med', color: colors.grayMedium },
  { id: '3', initials: 'KR', name: 'Kredifi', industry: 'FinTech', stage: 'Series A', progress: 88, risk: 'low', color: colors.green },
  { id: '4', initials: 'AG', name: 'AgroVault', industry: 'AgriTech', stage: 'Seed Stage', progress: 30, risk: 'high', color: colors.grayBadge },
  { id: '5', initials: 'SR', name: 'Surgent AI', industry: 'AI/ML', stage: 'Pre-seed', progress: 58, risk: 'med', color: colors.black },
  { id: '6', initials: 'TB', name: 'TechBridge', industry: 'FinTech', stage: 'Series A', progress: 95, risk: 'low', color: colors.green },
  { id: '7', initials: 'MH', name: 'MediHub', industry: 'HealthTech', stage: 'Seed Stage', progress: 50, risk: 'med', color: colors.black },
];

const filters = ['All', 'FinTech', 'HealthTech', 'EdTech', 'AgriTech', 'Low Risk'];

export default function BrowseScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredStartups = allStartups.filter((startup) => {
    const matchesSearch = startup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      startup.industry.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'All') return matchesSearch;
    if (activeFilter === 'Low Risk') return matchesSearch && startup.risk === 'low';
    return matchesSearch && startup.industry === activeFilter;
  });

  const renderStartup = ({ item }: { item: Startup }) => (
    <TouchableOpacity
      style={styles.startupCard}
      onPress={() => router.push('/detail')}
    >
      <View style={styles.startupHeader}>
        <View style={[styles.startupAvatar, { backgroundColor: item.color }]}>
          <Text style={[styles.startupAvatarText, item.color === colors.grayBadge && { color: colors.grayDark }]}>
            {item.initials}
          </Text>
        </View>
        <View style={styles.startupInfo}>
          <Text style={styles.startupName}>{item.name}</Text>
          <Text style={styles.startupMeta}>{item.industry} · {item.stage}</Text>
        </View>
        <View style={styles.startupProgress}>
          <Text style={styles.progressPct}>{item.progress}%</Text>
          <Badge variant={item.risk}>{item.risk === 'low' ? 'Low' : item.risk === 'med' ? 'Medium' : 'High'}</Badge>
        </View>
      </View>
      <ProgressBar progress={item.progress} height={6} style={styles.progressBar} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Browse</Text>
        <Badge variant="low">Investor</Badge>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search startups..."
          placeholderTextColor={colors.grayDark}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
        style={styles.filterScroll}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[styles.filterChipText, activeFilter === filter && styles.filterChipTextActive]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredStartups}
        renderItem={renderStartup}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSize.heading,
    fontWeight: '700',
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
    color: colors.text,
    backgroundColor: colors.white,
  },
  filterScroll: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  filtersContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  filterChipActive: {
    backgroundColor: colors.black,
    borderColor: colors.black,
  },
  filterChipText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.grayDark,
  },
  filterChipTextActive: {
    color: colors.white,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  startupCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  startupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  startupAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startupAvatarText: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.white,
  },
  startupInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  startupName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  startupMeta: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  startupProgress: {
    alignItems: 'flex-end',
  },
  progressPct: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.green,
    marginBottom: 4,
  },
  progressBar: {
    marginTop: spacing.xs,
  },
});