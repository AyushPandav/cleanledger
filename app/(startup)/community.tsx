import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { useAuth, API_HOST_PYTHON, API_HOST_NODE } from '../../context/AuthContext';

export default function StartupCommunityScreen() {
    const { user } = useAuth();
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [answeringId, setAnsweringId] = useState<string | null>(null);
    const [answerText, setAnswerText] = useState('');
    const [hasCommunity, setHasCommunity] = useState(false);
    const [settingUp, setSettingUp] = useState(false);

    useEffect(() => {
        if (!user?.id) return;
        fetch(`${API_HOST_NODE}/api/user/${user.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.user) setHasCommunity(data.user.hasCommunity);
            });
        fetchQuestions();
    }, [user]);

    const fetchQuestions = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_HOST_PYTHON}/questions/startup/${user.id}`);
            const data = await res.json();
            if (data.status === 'success') {
                setQuestions(data.questions);
            }
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to fetch community questions.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCommunity = async () => {
        setSettingUp(true);
        try {
            const res = await fetch(`${API_HOST_NODE}/api/user/${user?.id}/community`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hasCommunity: true })
            });
            const data = await res.json();
            if (data.success) {
                setHasCommunity(true);
            }
        } catch (e) {
            Alert.alert('Error', 'Failed to create community');
        } finally {
            setSettingUp(false);
        }
    };

    const handleAnswerSubmit = async (questionId: string) => {
        if (!answerText.trim()) return;
        try {
            const res = await fetch(`${API_HOST_PYTHON}/questions/${questionId}/answer`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answer: answerText })
            });
            const data = await res.json();
            if (data.status === 'success') {
                setAnswerText('');
                setAnsweringId(null);
                fetchQuestions();
            }
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to submit answer.');
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.green} />
            </SafeAreaView>
        );
    }

    if (!hasCommunity) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Startup Community</Text>
                </View>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyTitle}>Start Your Community</Text>
                    <Text style={styles.emptyDesc}>Enable community features so investors can join your room and ask you direct questions.</Text>
                    <TouchableOpacity onPress={handleCreateCommunity} style={[styles.submitBtn, { marginTop: spacing.xl }]} disabled={settingUp}>
                        {settingUp ? <ActivityIndicator color={colors.white} /> : <Text style={styles.submitText}>Create Community</Text>}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Community Q&A</Text>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                {questions.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyTitle}>No Questions yet</Text>
                        <Text style={styles.emptyDesc}>When investors ask questions, they will appear here for you to answer publically.</Text>
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
                                    <Text style={styles.answerLabel}>Your Answer:</Text>
                                    <Text style={styles.answerText}>{q.answer}</Text>
                                </View>
                            ) : answeringId === q._id ? (
                                <View style={styles.replyBox}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Write your answer..."
                                        placeholderTextColor={colors.textSecondary}
                                        multiline
                                        value={answerText}
                                        onChangeText={setAnswerText}
                                    />
                                    <View style={styles.actionRow}>
                                        <TouchableOpacity onPress={() => setAnsweringId(null)} style={styles.cancelBtn}>
                                            <Text style={styles.cancelText}>Cancel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleAnswerSubmit(q._id)} style={styles.submitBtn}>
                                            <Text style={styles.submitText}>Submit Answer</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <TouchableOpacity onPress={() => setAnsweringId(q._id)} style={styles.replyBtn}>
                                    <Text style={styles.replyBtnText}>Answer Question</Text>
                                </TouchableOpacity>
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
    headerTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
    content: { padding: spacing.md, gap: spacing.md },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
    emptyTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
    emptyDesc: { fontSize: fontSize.base, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: spacing.xl },
    card: { backgroundColor: colors.white, padding: spacing.lg, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border },
    qHeader: { marginBottom: spacing.sm },
    investorName: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textSecondary },
    questionText: { fontSize: fontSize.base, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
    answerBox: { backgroundColor: colors.green + '15', padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.green + '40' },
    answerLabel: { fontSize: fontSize.xs, fontWeight: '700', color: colors.green, marginBottom: 4, textTransform: 'uppercase' },
    answerText: { fontSize: fontSize.base, color: colors.text, lineHeight: 22 },
    replyBtn: { alignSelf: 'flex-start', paddingVertical: spacing.sm, paddingHorizontal: spacing.md, backgroundColor: colors.black, borderRadius: borderRadius.full },
    replyBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: '600' },
    replyBox: { gap: spacing.sm },
    input: { backgroundColor: colors.background, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, minHeight: 80, textAlignVertical: 'top', fontSize: fontSize.base, color: colors.text },
    actionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.md },
    cancelBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
    cancelText: { color: colors.textSecondary, fontWeight: '600' },
    submitBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, backgroundColor: colors.green, borderRadius: borderRadius.full },
    submitText: { color: colors.white, fontWeight: '600' }
});
