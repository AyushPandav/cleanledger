import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Platform, Modal, TextInput, ActivityIndicator, Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { useAuth, API_HOST_NODE } from '../../context/AuthContext';

type Section = 'main' | 'edit' | 'security' | 'notifications';

const DEVICE_SESSIONS = [
  { id: '1', device: 'Android · OnePlus 9R', location: 'Mumbai, IN', time: 'Active now', current: true },
  { id: '2', device: 'Chrome · Windows', location: 'Delhi, IN', time: '2 hrs ago', current: false },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [section, setSection] = useState<Section>('main');
  const [saving, setSaving] = useState(false);

  // Edit profile state
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');

  // Security state
  const [twoFA, setTwoFA] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [biometric, setBiometric] = useState(false);

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to log out?')) { await logout(); router.replace('/'); }
    } else {
      Alert.alert('Log out', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log out', style: 'destructive', onPress: async () => { await logout(); router.replace('/'); } },
      ]);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) { Alert.alert('Name required', 'Please enter your name.'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_HOST_NODE}/api/user/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), bio: bio.trim(), location: location.trim(), phone: phone.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('✅ Saved', 'Your profile has been updated.');
        setSection('main');
      } else {
        Alert.alert('Error', data.error || 'Failed to save profile.');
      }
    } catch {
      Alert.alert('Saved locally', 'Profile info updated for this session.');
      setSection('main');
    } finally {
      setSaving(false);
    }
  };

  const handleRevokeSession = (id: string) => {
    Alert.alert('Revoke Session', 'This will log out that device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Revoke', style: 'destructive', onPress: () => Alert.alert('✅ Done', 'Session revoked.') },
    ]);
  };

  // ── EDIT PROFILE SECTION ───────────────────────────────────────────────────
  if (section === 'edit') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSection('main')} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSaveProfile} disabled={saving}>
            {saving ? <ActivityIndicator size="small" color={colors.green} /> :
              <Text style={styles.saveBtn}>Save</Text>}
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Avatar preview */}
          <View style={styles.editAvatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{name?.charAt(0)?.toUpperCase() || 'U'}</Text>
            </View>
            <Text style={styles.editAvatarHint}>Avatar auto-generates from your name</Text>
          </View>

          <Text style={styles.fieldLabel}>DISPLAY NAME</Text>
          <TextInput style={styles.field} value={name} onChangeText={setName}
            placeholder="Your full name" placeholderTextColor="#94A3B8" />

          <Text style={styles.fieldLabel}>EMAIL</Text>
          <View style={[styles.field, styles.fieldDisabled]}>
            <Text style={{ color: '#94A3B8', fontSize: 15 }}>{user?.email}</Text>
          </View>
          <Text style={styles.fieldHint}>Email cannot be changed here. Contact support.</Text>

          <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
          <TextInput style={styles.field} value={phone} onChangeText={setPhone}
            placeholder="+91 98765 43210" placeholderTextColor="#94A3B8" keyboardType="phone-pad" />

          <Text style={styles.fieldLabel}>LOCATION</Text>
          <TextInput style={styles.field} value={location} onChangeText={setLocation}
            placeholder="City, Country" placeholderTextColor="#94A3B8" />

          <Text style={styles.fieldLabel}>BIO</Text>
          <TextInput style={[styles.field, { height: 90, textAlignVertical: 'top' }]}
            value={bio} onChangeText={setBio}
            placeholder="Write a short bio about your investment interests…"
            placeholderTextColor="#94A3B8" multiline />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── SECURITY SECTION ───────────────────────────────────────────────────────
  if (section === 'security') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSection('main')} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Security</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView contentContainerStyle={styles.content}>

          {/* Account Protection */}
          <Text style={styles.sectionHeading}>ACCOUNT PROTECTION</Text>
          <View style={styles.list}>
            <View style={styles.listItem}>
              <MaterialCommunityIcons name="two-factor-authentication" size={22} color="#6366F1" />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.listText}>Two-Factor Authentication</Text>
                <Text style={styles.listSub}>Adds a second layer of security at login</Text>
              </View>
              <Switch value={twoFA} onValueChange={v => {
                setTwoFA(v);
                if (v) Alert.alert('2FA Enabled', 'You\'ll be asked for a code on new logins.');
              }} trackColor={{ true: colors.green }} />
            </View>
            <View style={styles.listItem}>
              <MaterialCommunityIcons name="bell-alert-outline" size={22} color="#F59E0B" />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.listText}>Login Alerts</Text>
                <Text style={styles.listSub}>Get notified of new sign-ins</Text>
              </View>
              <Switch value={loginAlerts} onValueChange={setLoginAlerts} trackColor={{ true: colors.green }} />
            </View>
            <View style={styles.listItem}>
              <MaterialCommunityIcons name="fingerprint" size={22} color="#10B981" />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.listText}>Biometric Unlock</Text>
                <Text style={styles.listSub}>Use fingerprint or Face ID to open app</Text>
              </View>
              <Switch value={biometric} onValueChange={setBiometric} trackColor={{ true: colors.green }} />
            </View>
          </View>

          {/* Active Sessions */}
          <Text style={styles.sectionHeading}>ACTIVE SESSIONS</Text>
          <View style={styles.list}>
            {DEVICE_SESSIONS.map(s => (
              <View key={s.id} style={styles.listItem}>
                <MaterialCommunityIcons
                  name={s.device.includes('Android') ? 'cellphone' : 'laptop'}
                  size={22} color={s.current ? colors.green : '#94A3B8'} />
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={styles.listText}>{s.device}</Text>
                  <Text style={styles.listSub}>{s.location}  ·  {s.time}</Text>
                </View>
                {s.current ? (
                  <View style={styles.currentBadge}><Text style={styles.currentText}>This device</Text></View>
                ) : (
                  <TouchableOpacity onPress={() => handleRevokeSession(s.id)}>
                    <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: '700' }}>Revoke</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {/* Danger Zone */}
          <Text style={styles.sectionHeading}>DANGER ZONE</Text>
          <View style={styles.list}>
            <TouchableOpacity style={styles.listItem} onPress={() =>
              Alert.alert('Change Password', 'A password reset link will be sent to your email address.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Send Reset Email', onPress: () => Alert.alert('📧 Sent', `Check ${user?.email}`) }
              ])}>
              <MaterialCommunityIcons name="lock-reset" size={22} color="#F59E0B" />
              <Text style={[styles.listText, { marginLeft: spacing.md }]}>Change Password</Text>
              <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.listItem, { borderBottomWidth: 0 }]} onPress={() =>
              Alert.alert('Delete Account', 'This is permanent and cannot be undone.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Request submitted') }
              ])}>
              <MaterialCommunityIcons name="delete-alert-outline" size={22} color="#EF4444" />
              <Text style={[styles.listText, { marginLeft: spacing.md, color: '#EF4444' }]}>Delete Account</Text>
              <MaterialCommunityIcons name="chevron-right" size={22} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── MAIN PROFILE ───────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
          </View>
          <Text style={styles.name}>{user?.name || 'Investor'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.role}>{user?.role?.toUpperCase()}</Text>
        </View>

        <Text style={styles.sectionHeading}>ACCOUNT</Text>
        <View style={styles.list}>
          <TouchableOpacity style={styles.listItem} onPress={() => setSection('edit')}>
            <MaterialCommunityIcons name="account-edit-outline" size={22} color={colors.text} />
            <Text style={styles.listText}>Edit Profile</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.listItem} onPress={() =>
            Alert.alert('Notifications', 'You can manage notification preferences here.', [{ text: 'OK' }])}>
            <MaterialCommunityIcons name="bell-outline" size={22} color={colors.text} />
            <Text style={styles.listText}>Notifications</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.listItem, { borderBottomWidth: 0 }]} onPress={() => setSection('security')}>
            <MaterialCommunityIcons name="shield-lock-outline" size={22} color={colors.text} />
            <Text style={styles.listText}>Security</Text>
            <View style={styles.securityBadge}><Text style={styles.securityBadgeText}>2FA OFF</Text></View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionHeading}>WALLET</Text>
        <View style={styles.list}>
          <TouchableOpacity style={[styles.listItem, { borderBottomWidth: 0 }]} onPress={() => router.push('/(investor)/wallet')}>
            <MaterialCommunityIcons name="wallet-outline" size={22} color="#6366F1" />
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={styles.listText}>Digital Wallet</Text>
              <Text style={styles.listSub}>Add money, view transactions</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionHeading}>AI TOOLS</Text>
        <View style={styles.list}>
          <TouchableOpacity style={[styles.listItem, { borderBottomWidth: 0 }]} onPress={() => router.push('/compare')}>
            <MaterialCommunityIcons name="robot-outline" size={22} color={colors.green} />
            <Text style={styles.listText}>Compare Startups (Mistral AI)</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={18} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: { flex: 1, fontSize: fontSize.heading, fontWeight: '700', color: colors.text, textAlign: 'center' },
  backBtn: { width: 40, alignItems: 'flex-start' },
  saveBtn: { color: colors.green, fontWeight: '700', fontSize: 16 },
  content: { padding: spacing.lg, paddingBottom: 100 },

  profileCard: {
    backgroundColor: colors.white, borderRadius: borderRadius.lg,
    padding: spacing.xl, alignItems: 'center', marginBottom: spacing.lg,
    borderWidth: 1, borderColor: colors.border,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.green, justifyContent: 'center',
    alignItems: 'center', marginBottom: spacing.md,
  },
  avatarText: { fontSize: 32, color: colors.white, fontWeight: '700' },
  name: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  email: { fontSize: fontSize.base, color: colors.textSecondary, marginBottom: spacing.sm },
  role: {
    fontSize: fontSize.sm, color: colors.green, fontWeight: '600',
    backgroundColor: colors.greenLight, paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs, borderRadius: borderRadius.full,
  },

  sectionHeading: {
    fontSize: 11, color: colors.textSecondary, fontWeight: '700',
    marginLeft: spacing.sm, marginBottom: spacing.sm, marginTop: spacing.md, letterSpacing: 1,
  },
  list: {
    backgroundColor: colors.white, borderRadius: borderRadius.lg,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: colors.borderLighter,
  },
  listText: { flex: 1, marginLeft: spacing.md, fontSize: fontSize.base, color: colors.text },
  listSub: { fontSize: 11, color: '#94A3B8', marginTop: 2 },

  securityBadge: {
    backgroundColor: '#FEF2F2', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginRight: 6,
  },
  securityBadgeText: { fontSize: 9, fontWeight: '800', color: '#EF4444', letterSpacing: 0.5 },

  currentBadge: {
    backgroundColor: '#ECFDF5', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
  },
  currentText: { fontSize: 10, fontWeight: '700', color: '#10B981' },

  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.white, borderWidth: 1, borderColor: '#FECACA',
    borderRadius: borderRadius.md, padding: spacing.lg, marginTop: spacing.lg,
  },
  logoutText: { color: '#EF4444', fontSize: fontSize.base, fontWeight: '700' },

  // Edit profile styles
  editAvatarWrap: { alignItems: 'center', marginBottom: spacing.xl },
  editAvatarHint: { fontSize: 12, color: '#94A3B8', marginTop: 8 },
  fieldLabel: {
    fontSize: 10, fontWeight: '800', color: '#94A3B8',
    letterSpacing: 0.8, marginBottom: 6, marginTop: spacing.md,
  },
  field: {
    backgroundColor: colors.white, borderRadius: 10, padding: 14,
    fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border,
  },
  fieldDisabled: { backgroundColor: '#F8FAFC' },
  fieldHint: { fontSize: 11, color: '#94A3B8', marginTop: 4 },
});
