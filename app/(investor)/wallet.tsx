import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, Alert, TextInput, Platform, Modal
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { API_HOST_NODE } from '../../context/AuthContext';
import { WebView } from 'react-native-webview';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';

const RAZORPAY_KEY_ID = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || '';

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 25000];

interface Transaction {
    _id: string;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    paymentId?: string;
    createdAt: string;
}

interface Wallet {
    balance: number;
    transactions: Transaction[];
}

export default function WalletScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();

    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [customAmount, setCustomAmount] = useState('');
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

    const [showSandbox, setShowSandbox] = useState(false);
    const [sandboxOrder, setSandboxOrder] = useState<any>(null);

    const fetchWallet = useCallback(async () => {
        if (!user?.id) return;
        try {
            const res = await fetch(`${API_HOST_NODE}/api/wallet/${user.id}`);
            const data = await res.json();
            if (data.success) setWallet(data.wallet);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [user]);

    useEffect(() => { fetchWallet(); }, [fetchWallet]);

    const finalAmount = selectedAmount ?? (parseInt(customAmount) || 0);

    const handleAddMoney = async () => {
        if (finalAmount < 1) {
            Alert.alert('Minimum ₹1', 'Please enter at least ₹1 to add to your wallet.');
            return;
        }
        setShowModal(false);
        setPaying(true);

        try {
            // Step 1 — create Razorpay order
            const orderRes = await fetch(`${API_HOST_NODE}/api/wallet/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: finalAmount, userId: user!.id }),
            });
            const orderData = await orderRes.json();
            if (!orderData.success || !orderData.order) throw new Error(orderData.error || 'Order creation failed');

            // Step 2 — Show Custom Sandbox UI
            setSandboxOrder(orderData.order);
            setShowSandbox(true);
            setPaying(false);
        } catch (e: any) {
            setPaying(false);
            Alert.alert('Error', e?.message || 'Something went wrong.');
        }
    };

    const handleSandboxPayment = async (status: 'success' | 'cancelled') => {
        try {
            if (status === 'success' && sandboxOrder) {
                setShowSandbox(false);
                setPaying(true);

                // Step 3 — verify on backend + credit wallet (using dummy signature)
                const addRes = await fetch(`${API_HOST_NODE}/api/wallet/add-money`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user!.id,
                        razorpay_order_id: sandboxOrder.id,
                        razorpay_payment_id: 'pay_sandbox_' + Date.now(),
                        razorpay_signature: 'dummy_signature',
                        amount: finalAmount,
                    }),
                });
                const addData = await addRes.json();
                if (addData.success) {
                    setWallet(addData.wallet);
                    Alert.alert('Money Added! 🎉', `₹${finalAmount.toLocaleString('en-IN')} has been added to your wallet.`);
                    setCustomAmount('');
                    setSelectedAmount(null);
                } else {
                    Alert.alert('Failed', addData.error || 'Could not add money.');
                }
            } else if (status === 'cancelled') {
                setShowSandbox(false);
            }
        } catch (e: any) {
            Alert.alert('Error', 'Payment verification failed.');
        } finally {
            setPaying(false);
            setSandboxOrder(null);
        }
    };

    const balance = wallet?.balance ?? 0;
    const transactions: Transaction[] = wallet?.transactions ?? [];

    return (
        <View style={[styles.root, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={22} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Wallet</Text>
                <View style={{ width: 36 }} />
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

                {/* Balance Hero Card */}
                <View style={styles.balanceCard}>
                    <View style={styles.balanceTop}>
                        <MaterialCommunityIcons name="wallet-outline" size={28} color="rgba(255,255,255,0.8)" />
                        <Text style={styles.balanceTopLabel}>Available Balance</Text>
                    </View>
                    <Text style={styles.balanceAmount}>
                        ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                    <Text style={styles.balanceUser}>{user?.name || 'Investor'}</Text>

                    <View style={styles.balanceActions}>
                        <TouchableOpacity
                            style={styles.balanceBtn}
                            onPress={() => setShowModal(true)}
                            disabled={paying}
                        >
                            {paying ? (
                                <ActivityIndicator color="#6366F1" size="small" />
                            ) : (
                                <>
                                    <MaterialCommunityIcons name="plus" size={18} color="#6366F1" />
                                    <Text style={styles.balanceBtnText}>Add Money</Text>
                                </>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.balanceBtn, styles.balanceBtnSecondary]}>
                            <MaterialCommunityIcons name="swap-horizontal" size={18} color="rgba(255,255,255,0.8)" />
                            <Text style={[styles.balanceBtnText, { color: 'rgba(255,255,255,0.9)' }]}>Withdraw</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Stats row */}
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statVal}>
                            {transactions.filter(t => t.type === 'credit').length}
                        </Text>
                        <Text style={styles.statLbl}>Top-ups</Text>
                    </View>
                    <View style={[styles.statBox, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#E2E8F0' }]}>
                        <Text style={[styles.statVal, { color: '#10B981' }]}>
                            ₹{transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0).toLocaleString('en-IN')}
                        </Text>
                        <Text style={styles.statLbl}>Total Added</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={[styles.statVal, { color: '#EF4444' }]}>
                            ₹{transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0).toLocaleString('en-IN')}
                        </Text>
                        <Text style={styles.statLbl}>Total Used</Text>
                    </View>
                </View>

                {/* Transactions */}
                <Text style={styles.txnTitle}>Transaction History</Text>

                {loading ? (
                    <View style={styles.centered}>
                        <ActivityIndicator color="#6366F1" />
                    </View>
                ) : transactions.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="receipt" size={48} color="#CBD5E1" />
                        <Text style={styles.emptyTitle}>No transactions yet</Text>
                        <Text style={styles.emptySubtitle}>Add money to your wallet to get started</Text>
                    </View>
                ) : (
                    <View style={styles.txnList}>
                        {transactions.map((txn, i) => (
                            <View key={txn._id || i} style={[styles.txnRow, i > 0 && { borderTopWidth: 1, borderTopColor: '#F1F5F9' }]}>
                                <View style={[styles.txnIcon, { backgroundColor: txn.type === 'credit' ? '#ECFDF5' : '#FEF2F2' }]}>
                                    <MaterialCommunityIcons
                                        name={txn.type === 'credit' ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline'}
                                        size={22}
                                        color={txn.type === 'credit' ? '#10B981' : '#EF4444'}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.txnDesc}>{txn.description || (txn.type === 'credit' ? 'Money Added' : 'Money Used')}</Text>
                                    <Text style={styles.txnDate}>
                                        {new Date(txn.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                    {txn.paymentId ? <Text style={styles.txnId}>ID: {txn.paymentId}</Text> : null}
                                </View>
                                <Text style={[styles.txnAmount, { color: txn.type === 'credit' ? '#10B981' : '#EF4444' }]}>
                                    {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Add Money Modal */}
            <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 16 }]}>
                        <View style={styles.modalHandle} />
                        <Text style={styles.modalTitle}>Add Money to Wallet</Text>
                        <Text style={styles.modalSubtitle}>Select an amount or enter a custom one</Text>

                        <View style={styles.quickGrid}>
                            {QUICK_AMOUNTS.map(amt => (
                                <TouchableOpacity
                                    key={amt}
                                    style={[styles.quickChip, selectedAmount === amt && styles.quickChipActive]}
                                    onPress={() => { setSelectedAmount(amt); setCustomAmount(''); }}
                                >
                                    <Text style={[styles.quickChipText, selectedAmount === amt && styles.quickChipTextActive]}>
                                        ₹{(amt / 1000).toFixed(amt >= 1000 ? 0 : 1)}{amt >= 1000 ? 'K' : ''}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.customRow}>
                            <Text style={styles.customRupee}>₹</Text>
                            <TextInput
                                style={styles.customInput}
                                placeholder="Enter custom amount"
                                placeholderTextColor="#94A3B8"
                                keyboardType="numeric"
                                value={customAmount}
                                onChangeText={t => { setCustomAmount(t); setSelectedAmount(null); }}
                                returnKeyType="done"
                            />
                        </View>

                        {finalAmount > 0 && (
                            <Text style={styles.summaryText}>
                                You will add <Text style={{ fontWeight: '800', color: '#6366F1' }}>₹{finalAmount.toLocaleString('en-IN')}</Text> to your wallet
                            </Text>
                        )}

                        <TouchableOpacity
                            style={[styles.payBtn, finalAmount < 1 && styles.payBtnDisabled]}
                            onPress={handleAddMoney}
                            disabled={finalAmount < 1}
                            activeOpacity={0.85}
                        >
                            <MaterialCommunityIcons name="currency-inr" size={18} color={colors.white} />
                            <Text style={styles.payBtnText}>Pay with Razorpay</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>

                        <Text style={styles.testModeNote}>
                            🔒 Secured by Razorpay · Test Mode · No real money charged
                        </Text>
                    </View>
                </View>
            </Modal>

            {/* Custom Sandbox Payment Modal */}
            <Modal visible={showSandbox} animationType="slide" transparent>
                <View style={{ flex: 1, backgroundColor: 'rgba(15,23,42,0.7)', justifyContent: 'center', padding: 24 }}>
                    <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 32, alignItems: 'center' }}>
                        <MaterialCommunityIcons name="shield-check" size={54} color="#10B981" />
                        <Text style={{ fontSize: 22, fontWeight: '800', marginTop: 16, color: '#0F172A' }}>Test Sandbox</Text>
                        <Text style={{ textAlign: 'center', color: '#64748B', marginTop: 8, fontSize: 13, paddingHorizontal: 16 }}>
                            A secure simulation environment for testing top-ups.
                        </Text>

                        <View style={{ backgroundColor: '#F8FAFC', padding: 20, borderRadius: 16, width: '100%', marginVertical: 28, borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ fontWeight: '600', color: '#64748B', fontSize: 15 }}>Amount</Text>
                            <Text style={{ fontWeight: '800', fontSize: 22, color: '#0F172A' }}>₹{finalAmount}</Text>
                        </View>

                        <TouchableOpacity
                            style={{ backgroundColor: '#10B981', padding: 18, borderRadius: 16, width: '100%', alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
                            onPress={() => handleSandboxPayment('success')}
                        >
                            <MaterialCommunityIcons name="check-circle" size={20} color="#fff" />
                            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Simulate Success</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{ padding: 16, marginTop: 12 }}
                            onPress={() => handleSandboxPayment('cancelled')}
                        >
                            <Text style={{ color: '#94A3B8', fontWeight: '700', fontSize: 15 }}>Cancel Verification</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F1F5F9' },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: spacing.lg, paddingVertical: 12,
        backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
    },
    backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },

    scroll: { flex: 1 },

    balanceCard: {
        margin: spacing.lg,
        backgroundColor: '#6366F1',
        borderRadius: 24, padding: 24, gap: 4,
        ...Platform.select({
            ios: { shadowColor: '#6366F1', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16 },
            android: { elevation: 8 },
        }),
    },
    balanceTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    balanceTopLabel: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },
    balanceAmount: { fontSize: 38, fontWeight: '900', color: colors.white, letterSpacing: -1 },
    balanceUser: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 2, marginBottom: 16 },

    balanceActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
    balanceBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        backgroundColor: colors.white, paddingVertical: 12, borderRadius: 14,
    },
    balanceBtnSecondary: { backgroundColor: 'rgba(255,255,255,0.15)' },
    balanceBtnText: { fontSize: 14, fontWeight: '700', color: '#6366F1' },

    statsRow: {
        flexDirection: 'row', backgroundColor: colors.white,
        marginHorizontal: spacing.lg, borderRadius: 16,
        borderWidth: 1, borderColor: '#E2E8F0', marginBottom: spacing.md,
    },
    statBox: { flex: 1, alignItems: 'center', padding: 14, gap: 2 },
    statVal: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
    statLbl: { fontSize: 10, color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase' },

    txnTitle: {
        fontSize: 12, fontWeight: '700', color: '#94A3B8',
        textTransform: 'uppercase', letterSpacing: 0.5,
        paddingHorizontal: spacing.lg, marginBottom: 8,
    },

    centered: { paddingVertical: 40, alignItems: 'center' },
    emptyState: { alignItems: 'center', paddingVertical: 40, gap: 8 },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: '#334155' },
    emptySubtitle: { fontSize: 13, color: '#94A3B8' },

    txnList: {
        marginHorizontal: spacing.lg, backgroundColor: colors.white,
        borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden',
    },
    txnRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
    txnIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    txnDesc: { fontSize: 13, fontWeight: '600', color: '#334155' },
    txnDate: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
    txnId: { fontSize: 10, color: '#CBD5E1', marginTop: 1 },
    txnAmount: { fontSize: 15, fontWeight: '800' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'flex-end' },
    modalSheet: {
        backgroundColor: colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: 24, gap: 12,
    },
    modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: 4 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', textAlign: 'center' },
    modalSubtitle: { fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 4 },

    quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    quickChip: {
        width: '30.5%', paddingVertical: 12, borderRadius: 12, alignItems: 'center',
        backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0',
    },
    quickChipActive: { backgroundColor: '#EEF2FF', borderColor: '#6366F1' },
    quickChipText: { fontSize: 15, fontWeight: '700', color: '#64748B' },
    quickChipTextActive: { color: '#6366F1' },

    customRow: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0',
        paddingHorizontal: 14, paddingVertical: 4,
    },
    customRupee: { fontSize: 20, fontWeight: '700', color: '#64748B' },
    customInput: {
        flex: 1, fontSize: 18, fontWeight: '700', color: '#0F172A', paddingVertical: 10,
        ...(Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}),
    },

    summaryText: { fontSize: 13, color: '#64748B', textAlign: 'center' },

    payBtn: {
        backgroundColor: '#6366F1', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    },
    payBtnDisabled: { backgroundColor: '#CBD5E1' },
    payBtnText: { color: colors.white, fontSize: 15, fontWeight: '800' },

    cancelBtn: { alignItems: 'center', paddingVertical: 8 },
    cancelText: { fontSize: 14, color: '#94A3B8', fontWeight: '600' },

    testModeNote: { fontSize: 11, color: '#94A3B8', textAlign: 'center' },
});
