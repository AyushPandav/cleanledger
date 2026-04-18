import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { useAuth, API_HOST_PYTHON, API_HOST_NODE } from '../../context/AuthContext';

export default function InvestorCommunityScreen() {
    const { user } = useAuth();

    // States
    const [startups, setStartups] = useState<any[]>([]);
    const [selectedStartup, setSelectedStartup] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchingQ, setFetchingQ] = useState(false);

    // Form inside active community
    const [newQuestion, setNewQuestion] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);

    useEffect(() => {
        fetchStartups();
    }, []);

    const fetchStartups = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_HOST_NODE}/api/startups`);
            const data = await res.json();
            if (data.success) {
                // Filter only startups that have enabled their community room
                setStartups(data.startups.filter((s: any) => s.hasCommunity));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const joinCommunity = async (startup: any) => {
        setSelectedStartup(startup);
        setFetchingQ(true);
        try {
            const res = await fetch(`${API_HOST_PYTHON}/questions/startup/${startup.id}`);
            const data = await res.json();
            if (data.status === 'success') {
                setQuestions(data.questions);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setFetchingQ(false);
        }
    };

    const handleAskSubmit = async () => {
        if (!newQuestion.trim() || !selectedStartup) return;
        try {
            const res = await fetch(`${API_HOST_PYTHON}/questions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    startupId: selectedStartup.id,
                    investorId: user?.id || 'demo_investor',
                    question: newQuestion,
                    isAnonymous: isAnonymous
                })
            });
            const data = await res.json();
            if (data.status === 'success') {
                setNewQuestion('');
                Alert.alert('Success', 'Question posted to community!');
                joinCommunity(selectedStartup); // refresh
            }
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to ask question.');
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.green} />
            </SafeAreaView>
        );
    }

    // Step 1: Show list of Startup Communities to join
    if (!selectedStartup) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Startup Communities</Text>
                </View>
                <ScrollView contentContainerStyle={styles.content}>
                    {startups.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyDesc}>No startups have enabled their community rooms yet.</Text>
                        </View>
                    ) : (
                        startups.map(s => (
                            <TouchableOpacity key={s.id} style={styles.communityCard} onPress={() => joinCommunity(s)}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>{s.name?.charAt(0) || 'S'}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.communityName}>{s.name}</Text>
                                    <Text style={styles.communityMeta}>{s.industry} • Q&A Room</Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={24} color={colors.grayDark} />
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            </SafeAreaView>
        );
    }

    // Step 2: Show specific Community Room
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.roomHeader}>
                <TouchableOpacity onPress={() => setSelectedStartup(null)} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{selectedStartup.name} Q&A</Text>
                <View style={{ width: 24 }} />
            </View>
            <ScrollView contentContainerStyle={styles.content}>

                <View style={styles.askSection}>
                    <Text style={styles.sectionTitle}>Ask {selectedStartup.name} a Question</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="What would you like to know?"
                        placeholderTextColor={colors.textSecondary}
                        multiline
                        value={newQuestion}
                        onChangeText={setNewQuestion}
                    />
                    <View style={styles.askActionRow}>
                        <TouchableOpacity onPress={() => setIsAnonymous(!isAnonymous)} style={styles.anonToggle}>
                            <View style={[styles.checkbox, isAnonymous && styles.checkboxActive]} />
                            <Text style={styles.anonText}>Ask Anonymously</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleAskSubmit} style={styles.submitBtn}>
                            <Text style={styles.submitText}>Ask</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Community Feed</Text>

                {fetchingQ ? (
                    <ActivityIndicator style={{ marginTop: 20 }} color={colors.green} />
                ) : questions.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyDesc}>No questions have been asked yet. Be the first!</Text>
                    </View>
                ) : (
                    questions.map(q => (
                        <View key={q._id} style={styles.card}>
                            <View style={styles.qHeader}>
                                <Text style={styles.investorName}>{q.isAnonymous ? 'Anonymous Investor' : 'Investor'}</Text>
                            </View>
                            <Text style={styles.questionText}>Q: {q.question}</Text>

                            {q.isAnswered ? (
                                <View style={styles.answerBox}>
                                    <Text style={styles.answerLabel}>Startup Answer:</Text>
                                    <Text style={styles.answerText}>{q.answer}</Text>
                                </View>
                            ) : (
                                <View style={styles.pendingBox}>
                                    <Text style={styles.pendingText}>Waiting for startup to answer...</Text>
                                </View>
                            )}
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { padding: spacing.lg, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
    roomHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
    backBtn: { padding: spacing.xs },
    headerTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
    content: { padding: spacing.md, gap: spacing.md },

    communityCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, padding: spacing.lg, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, gap: spacing.md },
    avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.green + '20', alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: fontSize.lg, fontWeight: '700', color: colors.green },
    communityName: { fontSize: fontSize.base, fontWeight: '700', color: colors.text, marginBottom: 4 },
    communityMeta: { fontSize: fontSize.sm, color: colors.textSecondary },

    askSection: { backgroundColor: colors.white, padding: spacing.lg, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border },
    sectionTitle: { fontSize: fontSize.base, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
    input: { backgroundColor: colors.background, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, minHeight: 80, textAlignVertical: 'top', fontSize: fontSize.base, color: colors.text, marginBottom: spacing.md },
    askActionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    anonToggle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1, borderColor: colors.grayDark },
    checkboxActive: { backgroundColor: colors.black, borderColor: colors.black },
    anonText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '500' },
    submitBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, backgroundColor: colors.green, borderRadius: borderRadius.full },
    submitText: { color: colors.white, fontWeight: '600' },

    emptyContainer: { padding: spacing.lg, alignItems: 'center', marginTop: 40 },
    emptyDesc: { fontSize: fontSize.base, color: colors.textSecondary, textAlign: 'center' },

    card: { backgroundColor: colors.white, padding: spacing.lg, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border },
    qHeader: { marginBottom: spacing.sm },
    investorName: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textSecondary },
    questionText: { fontSize: fontSize.base, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
    answerBox: { backgroundColor: colors.green + '15', padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.green + '40' },
    answerLabel: { fontSize: fontSize.xs, fontWeight: '700', color: colors.green, marginBottom: 4, textTransform: 'uppercase' },
    answerText: { fontSize: fontSize.base, color: colors.text, lineHeight: 22 },
    pendingBox: { backgroundColor: colors.grayLight, padding: spacing.md, borderRadius: borderRadius.md },
    pendingText: { color: colors.textSecondary, fontSize: fontSize.sm, fontStyle: 'italic' }
});
