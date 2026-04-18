import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { Badge, ProgressBar } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';

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

const startups: Startup[] = [
  { id: '1', initials: 'NX', name: 'NexaHealth', industry: 'HealthTech', stage: 'Seed Stage', progress: 72, risk: 'low', color: colors.black },
  { id: '2', initials: 'FL', name: 'FlowLearn', industry: 'EdTech', stage: 'Pre-seed', progress: 45, risk: 'med', color: colors.grayMedium },
  { id: '3', initials: 'KR', name: 'Kredifi', industry: 'FinTech', stage: 'Series A', progress: 88, risk: 'low', color: colors.green },
  { id: '4', initials: 'AG', name: 'AgroVault', industry: 'AgriTech', stage: 'Seed Stage', progress: 30, risk: 'high', color: colors.grayBadge },
  { id: '5', initials: 'SR', name: 'Surgent AI', industry: 'AI/ML', stage: 'Pre-seed', progress: 58, risk: 'med', color: colors.black },
];

export default function HomeScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to log out?')) {
        await logout();
        router.replace('/');
      }
    } else {
      Alert.alert('Log out', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]);
    }
  };


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
        <View>
          <Text style={styles.greeting}>Good morning, {user?.name?.split(' ')[0]}</Text>
          <Text style={styles.headerTitle}>Discover</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        {['All', 'FinTech', 'HealthTech', 'EdTech', 'Low Risk'].map((filter, idx) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterChip, idx === 0 && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, idx === 0 && styles.filterChipTextActive]}>{filter}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={startups}
        renderItem={renderStartup}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
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
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  greeting: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  headerTitle: {
    fontSize: fontSize.heading,
    fontWeight: '700',
    color: colors.text,
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.white,
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
    padding: spacing.lg,
    gap: spacing.md,
  },
  startupCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
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
