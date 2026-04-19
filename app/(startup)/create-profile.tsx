import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
    ActivityIndicator, Platform, Alert, KeyboardAvoidingView, Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { useAuth, API_HOST_NODE, API_HOST_PYTHON } from '../../context/AuthContext';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

const STAGES = ['Pre-seed', 'Seed', 'Series A', 'Series B', 'Growth'];
const INDUSTRIES = ['FinTech', 'HealthTech', 'EdTech', 'AgriTech', 'AI/ML', 'Logistics', 'SaaS', 'Other'];

interface TeamMember { name: string; role: string; }
interface Milestone { title: string; targetDate: string; }

export default function CreateStartupProfileScreen() {
    const router = useRouter();
    const { user } = useAuth();

    // Form fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [industry, setIndustry] = useState('');
    const [fundingGoal, setFundingGoal] = useState('');
    const [stage, setStage] = useState('');
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [newMember, setNewMember] = useState({ name: '', role: '' });
    const [newMilestone, setNewMilestone] = useState({ title: '', targetDate: '' });

    // Trust Flags
    const [foundedYear, setFoundedYear] = useState('');
    const [founderExperience, setFounderExperience] = useState('');
    const [businessRegistered, setBusinessRegistered] = useState(false);
    const [kycCompleted, setKycCompleted] = useState(false);
    const [panId, setPanId] = useState('');
    const [gstRegistration, setGstRegistration] = useState('');
    const [pitchVideoUrl, setPitchVideoUrl] = useState('');

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [loadingDoc, setLoadingDoc] = useState('');
    const [businessFileName, setBusinessFileName] = useState('');
    const [kycFileName, setKycFileName] = useState('');

    const handleDocumentUpload = async (docName: string, setVerifiedState: (v: boolean) => void) => {
        try {
            const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: false });
            if (res.canceled) return;

            const file = res.assets[0];
            const fileName = file.name;
            const docType = docName === 'Business Registration' ? 'business' : 'kyc';

            setLoadingDoc(docName);

            // Track filename for AI backend analysis
            if (docName === 'Business Registration') setBusinessFileName(fileName);
            if (docName === 'KYC Document') setKycFileName(fileName);

            // Extract base64 for real Image Analysis if it's an image
            let base64Data: string | null = null;
            if (file.mimeType?.startsWith('image') || fileName.match(/\.(jpg|jpeg|png)$/i)) {
                try {
                    base64Data = await FileSystem.readAsStringAsync(file.uri, {
                        encoding: 'base64',
                    });
                } catch (e) {
                    console.error("Failed to read base64", e);
                }
            }

            // ── Real AI verification call ──────────────────────────
            const verifyRes = await fetch(`${API_HOST_PYTHON}/verify-document`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-platform-secret': 'FINTECH_SECURE_123',
                },
                body: JSON.stringify({ fileName, docType, base64Data }),
            });

            const verifyData = await verifyRes.json();
            setLoadingDoc('');

            if (verifyData.verified === true) {
                setVerifiedState(true);
                Alert.alert(
                    '✅ AI Document Verified',
                    `"${fileName}" passed our AI compliance check.\n\nConfidence: ${verifyData.confidence ?? '—'}%\n${verifyData.reason ?? ''}`
                );
            } else {
                setVerifiedState(false);
                if (docName === 'Business Registration') setBusinessFileName('');
                if (docName === 'KYC Document') setKycFileName('');
                Alert.alert(
                    `🚨 Verification Failed — ${verifyData.label ?? 'REJECTED'}`,
                    `"${fileName}" was rejected by our AI compliance engine.\n\nReason: ${verifyData.reason ?? 'Unrelated or fraudulent document detected.'}\n\nPlease upload the correct legal document.`
                );
            }
        } catch (error) {
            setLoadingDoc('');
            Alert.alert('Upload Error', 'Could not verify document. Please try again.');
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetch(`${API_HOST_NODE}/api/user/${user.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && (data.user.profileComplete || data.user.name)) {
                        const existing = data.user;
                        setName(existing.name || '');
                        setDescription(existing.description || '');
                        setIndustry(existing.industry || '');
                        setFundingGoal(existing.fundingGoal ? existing.fundingGoal.toString() : '');
                        setStage(existing.stage || '');
                        setTeamMembers(existing.teamMembers || []);
                        setMilestones(existing.milestones || []);
                        setFoundedYear(existing.foundedYear || '');
                        setFounderExperience(existing.founderExperience || '');
                        setBusinessRegistered(existing.businessRegistered || false);
                        setKycCompleted(existing.kycCompleted || false);
                        setPanId(existing.panId || '');
                        setGstRegistration(existing.gstRegistration || '');
                        setPitchVideoUrl(existing.pitchVideoUrl || '');
                    }
                })
                .catch(err => console.log('Fetch mystartup err:', err))
                .finally(() => setInitialLoading(false));
        } else {
            setInitialLoading(false);
        }
    }, [user]);

    // ── Score Indicator  ──────────────────────────────────────────────────
    const localScore = (() => {
        let s = 0;
        if (name) s += 10;
        if (description) s += 20;
        if (industry) s += 10;
        if (fundingGoal) s += 15;
        if (teamMembers.length > 0) s += 20;
        if (milestones.length > 0) s += 25;
        if (foundedYear) s += 5;
        if (founderExperience) s += 5;
        if (businessRegistered) s += 15;
        if (kycCompleted) s += 15;
        if (panId) s += 10;
        if (gstRegistration) s += 10;
        if (pitchVideoUrl) s += 20;
        return s;
    })();

    const scoreColor = localScore >= 70 ? colors.green : localScore >= 40 ? '#F59E0B' : '#EF4444';

    // ── Handlers ──────────────────────────────────────────────────────────
    const addTeamMember = () => {
        if (!newMember.name || !newMember.role) return;
        setTeamMembers([...teamMembers, { ...newMember }]);
        setNewMember({ name: '', role: '' });
    };

    const addMilestone = () => {
        if (!newMilestone.title) return;
        setMilestones([...milestones, { ...newMilestone }]);
        setNewMilestone({ title: '', targetDate: '' });
    };

    const handleSubmit = async () => {
        if (!name || !description) {
            Alert.alert('Required Fields', 'Please fill in at least Name and Description.');
            return;
        }
        if (!user?.id) {
            Alert.alert('Not logged in', 'Please log in again before submitting.');
            return;
        }
        setLoading(true);
        try {
            // ── Step 1: Save profile to MongoDB via Node.js server ──
            const saveRes = await fetch(`${API_HOST_NODE}/api/startup/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    name,
                    description,
                    industry,
                    fundingGoal: fundingGoal ? parseFloat(fundingGoal) : null,
                    stage,
                    teamMembers,
                    milestones,
                    foundedYear,
                    founderExperience,
                    businessRegistered,
                    kycCompleted,
                    panId,
                    gstRegistration,
                    profileCompletionScore: localScore,
                    profileComplete: localScore >= 60,
                }),
            });

            if (!saveRes.ok) {
                const err = await saveRes.json();
                throw new Error(err.error || 'Failed to save profile');
            }

            // ── Step 2: Fire AI analysis in background (non-blocking) ──
            fetch(`${API_HOST_PYTHON}/startup/analyze`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-platform-secret': 'FINTECH_SECURE_123'
                },
                body: JSON.stringify({
                    description,
                    industry,
                    fundingGoal: fundingGoal ? parseFloat(fundingGoal) : null,
                    teamMembers,
                    milestones,
                    foundedYear,
                    founderExperience,
                    businessRegistered,
                    kycCompleted,
                    panId,
                    gstRegistration,
                    pitchVideoUrl,
                    businessFileName,
                    kycFileName,
                    profileCompletionScore: localScore,
                }),
            })
                .then(r => r.json())
                .then(aiData => {
                    // Write AI scorecard back to MongoDB once it's ready
                    fetch(`${API_HOST_NODE}/api/startup/profile`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: user.id,
                            aiRiskLevel: aiData.riskLevel,
                            aiTrustScore: aiData.trustScore,
                            aiInsights: aiData.insights,
                            aiWarnings: aiData.warnings,
                            aiSuggestions: aiData.suggestions,
                        }),
                    }).catch(() => { });
                })
                .catch(() => { }); // fully non-blocking

            setSubmitted(true);
            setTimeout(() => {
                setSubmitted(false);
            }, 2000);
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.green} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Startup Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    {/* Completion Score Bar */}
                    <View style={styles.scoreRow}>
                        <Text style={styles.scoreLabel}>Profile Strength</Text>
                        <Text style={[styles.scoreValue, { color: scoreColor }]}>{localScore}%</Text>
                    </View>
                    <View style={styles.scoreBarBg}>
                        <View style={[styles.scoreBarFill, { width: `${localScore}%` as any, backgroundColor: scoreColor }]} />
                    </View>

                    {/* ── Basic Info ───────────────────────────────────────── */}
                    <Text style={styles.sectionTitle}>Basic Information</Text>

                    <View style={styles.field}>
                        <Text style={styles.label}>Startup Name *</Text>
                        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. NexaHealth" placeholderTextColor={colors.textSecondary} />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Pitch Video URL</Text>
                        <TextInput style={styles.input} value={pitchVideoUrl} onChangeText={setPitchVideoUrl} placeholder="Google Drive or YouTube link to your pitch" placeholderTextColor={colors.textSecondary} />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Description *</Text>
                        <TextInput
                            style={[styles.input, styles.textarea]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="What does your startup do? What problem does it solve?"
                            placeholderTextColor={colors.textSecondary}
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Funding Goal (₹)</Text>
                        <TextInput style={styles.input} value={fundingGoal} onChangeText={setFundingGoal} placeholder="e.g. 5000000" placeholderTextColor={colors.textSecondary} keyboardType="numeric" />
                    </View>

                    {/* Industry picker */}
                    <View style={styles.field}>
                        <Text style={styles.label}>Industry</Text>
                        <View style={styles.chipRow}>
                            {INDUSTRIES.map((ind) => (
                                <TouchableOpacity
                                    key={ind}
                                    style={[styles.optionChip, industry === ind && styles.optionChipActive]}
                                    onPress={() => setIndustry(ind)}
                                >
                                    <Text style={[styles.optionChipText, industry === ind && styles.optionChipTextActive]}>{ind}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Stage picker */}
                    <View style={styles.field}>
                        <Text style={styles.label}>Stage</Text>
                        <View style={styles.chipRow}>
                            {STAGES.map((s) => (
                                <TouchableOpacity
                                    key={s}
                                    style={[styles.optionChip, stage === s && styles.optionChipActive]}
                                    onPress={() => setStage(s)}
                                >
                                    <Text style={[styles.optionChipText, stage === s && styles.optionChipTextActive]}>{s}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* ── Team Members ──────────────────────────────────────── */}
                    <Text style={styles.sectionTitle}>Team Members</Text>
                    {teamMembers.map((m, i) => (
                        <View key={i} style={styles.tagRow}>
                            <MaterialCommunityIcons name="account-circle-outline" size={18} color={colors.text} />
                            <Text style={styles.tagText}>{m.name} — {m.role}</Text>
                            <TouchableOpacity onPress={() => setTeamMembers(teamMembers.filter((_, j) => j !== i))}>
                                <MaterialCommunityIcons name="close-circle" size={18} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    ))}
                    <View style={styles.addRow}>
                        <TextInput style={[styles.input, { flex: 1 }]} value={newMember.name} onChangeText={(t) => setNewMember({ ...newMember, name: t })} placeholder="Name" placeholderTextColor={colors.textSecondary} />
                        <TextInput style={[styles.input, { flex: 1 }]} value={newMember.role} onChangeText={(t) => setNewMember({ ...newMember, role: t })} placeholder="Role" placeholderTextColor={colors.textSecondary} />
                        <TouchableOpacity style={styles.addBtn} onPress={addTeamMember}>
                            <MaterialCommunityIcons name="plus" size={20} color={colors.white} />
                        </TouchableOpacity>
                    </View>

                    {/* ── Milestones ────────────────────────────────────────── */}
                    <Text style={styles.sectionTitle}>Milestones</Text>
                    {milestones.map((m, i) => (
                        <View key={i} style={styles.tagRow}>
                            <MaterialCommunityIcons name="flag-outline" size={18} color={colors.green} />
                            <Text style={styles.tagText}>{m.title}{m.targetDate ? ` · ${m.targetDate}` : ''}</Text>
                            <TouchableOpacity onPress={() => setMilestones(milestones.filter((_, j) => j !== i))}>
                                <MaterialCommunityIcons name="close-circle" size={18} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    ))}
                    <View style={styles.addRow}>
                        <TextInput style={[styles.input, { flex: 1.5 }]} value={newMilestone.title} onChangeText={(t) => setNewMilestone({ ...newMilestone, title: t })} placeholder="Milestone title" placeholderTextColor={colors.textSecondary} />
                        <TextInput style={[styles.input, { flex: 1 }]} value={newMilestone.targetDate} onChangeText={(t) => setNewMilestone({ ...newMilestone, targetDate: t })} placeholder="Target date" placeholderTextColor={colors.textSecondary} />
                        <TouchableOpacity style={styles.addBtn} onPress={addMilestone}>
                            <MaterialCommunityIcons name="plus" size={20} color={colors.white} />
                        </TouchableOpacity>
                    </View>

                    {/* ── Verification & Legitimacy ────────────────────────────────────────── */}
                    <Text style={styles.sectionTitle}>Verification & Trust Flags</Text>

                    <View style={styles.field}>
                        <Text style={styles.label}>Founded Year</Text>
                        <TextInput style={styles.input} value={foundedYear} onChangeText={setFoundedYear} placeholder="e.g. 2023" placeholderTextColor={colors.textSecondary} keyboardType="numeric" maxLength={4} />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Founder Experience</Text>
                        <TextInput style={styles.input} value={founderExperience} onChangeText={setFounderExperience} placeholder="e.g. 5+ years in FinTech" placeholderTextColor={colors.textSecondary} />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>PAN ID (Tax Identifier)</Text>
                        <TextInput style={styles.input} value={panId} onChangeText={setPanId} placeholder="e.g. ABCDE1234F" placeholderTextColor={colors.textSecondary} autoCapitalize="characters" />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>GST Registration (Optional)</Text>
                        <TextInput style={styles.input} value={gstRegistration} onChangeText={setGstRegistration} placeholder="e.g. GSTIN Format" placeholderTextColor={colors.textSecondary} autoCapitalize="characters" />
                    </View>

                    <View style={[styles.field, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, backgroundColor: colors.white, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.label, { color: colors.text }]}>Business Registration Certificate</Text>
                            <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 4 }}>Verify your legal business entity via AI OCR.</Text>
                        </View>
                        {businessRegistered ? (
                            <MaterialCommunityIcons name="check-decagram" size={28} color={colors.green} />
                        ) : loadingDoc === 'Business Registration' ? (
                            <ActivityIndicator size="small" color={colors.green} />
                        ) : (
                            <TouchableOpacity style={{ backgroundColor: colors.black, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }} onPress={() => handleDocumentUpload('Business Registration', setBusinessRegistered)}>
                                <Text style={{ color: colors.white, fontSize: 12, fontWeight: '700' }}>Upload & Verify</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={[styles.field, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, backgroundColor: colors.white, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.label, { color: colors.text }]}>Founder Aadhaar / PAN</Text>
                            <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 4 }}>Verify your personal identity.</Text>
                        </View>
                        {kycCompleted ? (
                            <MaterialCommunityIcons name="check-decagram" size={28} color={colors.green} />
                        ) : loadingDoc === 'KYC Document' ? (
                            <ActivityIndicator size="small" color={colors.green} />
                        ) : (
                            <TouchableOpacity style={{ backgroundColor: colors.black, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }} onPress={() => handleDocumentUpload('KYC Document', setKycCompleted)}>
                                <Text style={{ color: colors.white, fontSize: 12, fontWeight: '700' }}>Upload & Verify</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* ── Submit CTA ────────────────────────────────────────── */}
                    {!submitted ? (
                        <TouchableOpacity style={styles.analyzeBtn} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
                            {loading
                                ? <ActivityIndicator color={colors.white} />
                                : <>
                                    <MaterialCommunityIcons name="send-outline" size={20} color={colors.white} />
                                    <Text style={styles.analyzeBtnText}>Submit Profile</Text>
                                </>
                            }
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.successBox}>
                            <MaterialCommunityIcons name="check-circle-outline" size={40} color={colors.green} />
                            <Text style={styles.successTitle}>Profile Submitted!</Text>
                            <Text style={styles.successSub}>Our AI is evaluating your startup in the background. Your ranking will appear in the Investor Explore section shortly.</Text>
                            <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
                                <Text style={styles.doneBtnText}>Back to Dashboard</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
    backBtn: { padding: spacing.xs },
    headerTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
    content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 80 },
    scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    scoreLabel: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '600' },
    scoreValue: { fontSize: fontSize.base, fontWeight: '800' },
    scoreBarBg: { height: 8, backgroundColor: colors.border, borderRadius: 4, marginBottom: spacing.lg, overflow: 'hidden' },
    scoreBarFill: { height: 8, borderRadius: 4 },
    sectionTitle: { fontSize: fontSize.base, fontWeight: '700', color: colors.text, marginTop: spacing.md, textTransform: 'uppercase', letterSpacing: 0.5 },
    field: { gap: 6 },
    label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textSecondary },
    input: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: 12, fontSize: fontSize.base, color: colors.text },
    textarea: { minHeight: 100, textAlignVertical: 'top', paddingTop: 12 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    optionChip: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: borderRadius.full, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
    optionChipActive: { backgroundColor: colors.black, borderColor: colors.black },
    optionChipText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
    optionChipTextActive: { color: colors.white },
    tagRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.white, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border },
    tagText: { flex: 1, fontSize: fontSize.sm, color: colors.text },
    addRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
    addBtn: { width: 44, height: 44, borderRadius: borderRadius.md, backgroundColor: colors.black, alignItems: 'center', justifyContent: 'center' },
    analyzeBtn: { backgroundColor: colors.green, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.lg, borderRadius: borderRadius.md, marginTop: spacing.lg },
    analyzeBtnText: { color: colors.white, fontSize: fontSize.base, fontWeight: '700' },
    successBox: { marginTop: spacing.xl, backgroundColor: colors.white, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, alignItems: 'center', gap: spacing.md },
    successTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
    successSub: { fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
    doneBtn: { backgroundColor: colors.black, borderRadius: borderRadius.md, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, marginTop: spacing.sm },
    doneBtnText: { color: colors.white, fontWeight: '700', fontSize: fontSize.base },
});
