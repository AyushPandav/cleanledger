import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { API_HOST_NODE } from '../../context/AuthContext';

interface Investment {
  _id: string;
  investorId: string;
  investorName: string;
  investorEmail: string;
  amountInvested: number;
  milestonePaymentStatus: string;
  blockchainTxHash?: string;
  blockchainNetwork?: string;
  createdAt: string;
}

interface Wallet {
  balance: number;
  transactions: {
    _id: string;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    createdAt: string;
  }[];
}

export default function StartupFundUsageScreen() {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const safeJson = async (res: Response) => {
        const text = await res.text();
        try { return JSON.parse(text); } catch { return null; }
      };
      const [invRes, walletRes] = await Promise.all([
        fetch(`${API_HOST_NODE}/api/startup-investments/${user.id}`),
        fetch(`${API_HOST_NODE}/api/wallet/${user.id}`),
      ]);
      const invData = await safeJson(invRes);
      const walletData = await safeJson(walletRes);
      if (invData?.success) setInvestments(invData.investments);
      if (walletData?.success) setWallet(walletData.wallet);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalRaised = investments.reduce((sum, inv) => sum + (inv.amountInvested || 0), 0);
  const walletBalance = wallet?.balance ?? 0;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatAmount = (n: number) => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
    return `₹${n}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Funds Raised</Text>
        <Text style={styles.headerSub}>Live dashboard powered by MongoDB</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.green} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={colors.green} />}
          showsVerticalScrollIndicator={false}
        >
          {/* Wallet Balance Hero */}
          <View style={styles.heroCard}>
            <MaterialCommunityIcons name="bank-outline" size={32} color="#fff" style={{ marginBottom: 8 }} />
            <Text style={styles.heroAmount}>{formatAmount(walletBalance)}</Text>
            <Text style={styles.heroLabel}>Startup Wallet Balance</Text>
            <View style={styles.heroDivider} />
            <View style={styles.heroRow}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{formatAmount(totalRaised)}</Text>
                <Text style={styles.heroStatLabel}>Total Raised</Text>
              </View>
              <View style={[styles.heroStat, { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.3)' }]}>
                <Text style={styles.heroStatValue}>{investments.length}</Text>
                <Text style={styles.heroStatLabel}>Investors</Text>
              </View>
            </View>
          </View>

          {/* Investors List */}
          <Text style={styles.sectionTitle}>Investor Transactions</Text>

          {investments.length === 0 ? (
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons name="clock-outline" size={42} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No investments yet</Text>
              <Text style={styles.emptyText}>Investments from investors will appear here in real-time.</Text>
            </View>
          ) : (
            investments.map((inv, idx) => (
              <View key={inv._id || idx} style={styles.investorCard}>
                <View style={styles.investorAvatar}>
                  <Text style={styles.investorAvatarText}>{inv.investorName?.charAt(0) || 'I'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.investorName}>{inv.investorName}</Text>
                  <Text style={styles.investorEmail}>{inv.investorEmail}</Text>
                  <Text style={styles.investorDate}>{formatDate(inv.createdAt)}</Text>
                  {inv.blockchainTxHash ? (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(`https://amoy.polygonscan.com/tx/${inv.blockchainTxHash}`)}
                      style={styles.chainBadge}
                    >
                      <MaterialCommunityIcons name="link-variant" size={11} color="#6366F1" />
                      <Text style={styles.chainText}>🔗 On-chain verified  ↗</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
                <View style={styles.investorRight}>
                  <Text style={styles.investorAmount}>+{formatAmount(inv.amountInvested)}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: '#ECFDF5' }]}>
                    <Text style={[styles.statusText, { color: '#10B981' }]}>Received</Text>
                  </View>
                </View>
              </View>
            ))
          )}

          {/* Recent Wallet Transactions */}
          {wallet && wallet.transactions.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Wallet History</Text>
              {wallet.transactions.slice(0, 10).map((tx, i) => (
                <View key={tx._id || i} style={styles.txRow}>
                  <View style={[styles.txIcon, { backgroundColor: tx.type === 'credit' ? '#ECFDF5' : '#FEF2F2' }]}>
                    <MaterialCommunityIcons
                      name={tx.type === 'credit' ? 'arrow-down-circle' : 'arrow-up-circle'}
                      size={20} color={tx.type === 'credit' ? '#10B981' : '#EF4444'}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.txDesc}>{tx.description || (tx.type === 'credit' ? 'Investment received' : 'Debit')}</Text>
                    <Text style={styles.txDate}>{formatDate(tx.createdAt)}</Text>
                  </View>
                  <Text style={[styles.txAmount, { color: tx.type === 'credit' ? '#10B981' : '#EF4444' }]}>
                    {tx.type === 'credit' ? '+' : '-'}{formatAmount(tx.amount)}
                  </Text>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  header: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: fontSize.heading, fontWeight: '800', color: colors.text },
  headerSub: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: spacing.lg, paddingBottom: 100, gap: spacing.md },

  heroCard: {
    backgroundColor: '#10B981',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heroAmount: { fontSize: 38, fontWeight: '800', color: '#fff' },
  heroLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4, marginBottom: 16 },
  heroDivider: { width: '80%', height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 16 },
  heroRow: { flexDirection: 'row', width: '80%', justifyContent: 'space-around' },
  heroStat: { alignItems: 'center', paddingHorizontal: 20 },
  heroStatValue: { fontSize: 20, fontWeight: '800', color: '#fff' },
  heroStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 },

  sectionTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', color: '#64748B', letterSpacing: 1, marginBottom: 4 },

  emptyCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 32, alignItems: 'center',
    borderWidth: 1, borderColor: '#E2E8F0', gap: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#334155' },
  emptyText: { fontSize: 13, color: '#94A3B8', textAlign: 'center' },

  investorCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  investorAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center',
  },
  investorAvatarText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  investorName: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  investorEmail: { fontSize: 12, color: '#64748B', marginTop: 1 },
  investorDate: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  investorRight: { alignItems: 'flex-end', gap: 4 },
  investorAmount: { fontSize: 16, fontWeight: '800', color: '#10B981' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '600' },

  txRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 12, padding: 14, gap: 12, borderWidth: 1, borderColor: '#E2E8F0',
  },
  txIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  txDesc: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  txDate: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: '800' },

  chainBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 3 },
  chainText: { fontSize: 11, color: '#6366F1', fontWeight: '600' },
});
