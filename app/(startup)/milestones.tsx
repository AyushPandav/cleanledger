import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { useAuth, API_HOST_NODE } from '../../context/AuthContext';

export default function StartupMilestonesScreen() {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // modal states
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`${API_HOST_NODE}/api/user/${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user.milestones) {
          setMilestones(data.user.milestones);
        }
      })
      .catch(err => console.log('Milestone fetch err', err))
      .finally(() => setLoading(false));
  }, [user]);

  const handleAddMilestone = async () => {
    if (!newTitle.trim() || !newDate.trim()) {
      Alert.alert('Required', 'Please fill in title and target date');
      return;
    }
    setAdding(true);
    try {
      const updatedMilestones = [...milestones, { title: newTitle.trim(), targetDate: newDate.trim() }];
      const res = await fetch(`${API_HOST_NODE}/api/startup/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, milestones: updatedMilestones })
      });
      const data = await res.json();
      if (data.success) {
        setMilestones(updatedMilestones);
        setShowModal(false);
        setNewTitle('');
        setNewDate('');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to add milestone');
    } finally {
      setAdding(false);
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
        <Text style={styles.headerTitle}>Milestones</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
          <MaterialCommunityIcons name="plus" size={20} color={colors.white} />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {milestones.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No milestones found.</Text>
          </View>
        ) : (
          milestones.map((m, idx) => (
            <View key={idx} style={styles.card}>
              <View style={styles.milestoneHeader}>
                <Text style={styles.milestoneTitle}>{m.title}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>In Progress</Text>
                </View>
              </View>
              <Text style={styles.milestoneDesc}>Target: {m.targetDate}</Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Milestone Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Milestone</Text>
            <TextInput
              style={styles.input}
              placeholder="Milestone Title"
              placeholderTextColor={colors.grayDark}
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Target Date (e.g. Q4 2026)"
              placeholderTextColor={colors.grayDark}
              value={newDate}
              onChangeText={setNewDate}
            />
            <View style={styles.modalActionRow}>
              <TouchableOpacity onPress={() => setShowModal(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddMilestone} disabled={adding}>
                {adding ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: fontSize.heading, fontWeight: '700', color: colors.text },
  addButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.black,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.md,
  },
  addButtonText: { color: colors.white, fontWeight: '600', marginLeft: 4 },
  content: { padding: spacing.lg, gap: spacing.md },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: colors.textSecondary, fontSize: fontSize.base },
  card: {
    backgroundColor: colors.white, borderRadius: borderRadius.lg,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  milestoneHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  milestoneTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.text },
  statusBadge: { backgroundColor: colors.yellowLight, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.sm },
  statusText: { fontSize: fontSize.xs, color: colors.yellow, fontWeight: '700', textTransform: 'uppercase' },
  milestoneDesc: { fontSize: fontSize.sm, color: colors.textSecondary },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.xl },
  modalContent: { backgroundColor: colors.white, borderRadius: borderRadius.xl, padding: spacing.xl, gap: spacing.md },
  modalTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: spacing.md, backgroundColor: colors.background },
  modalActionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.md, marginTop: spacing.sm },
  cancelBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  cancelText: { color: colors.textSecondary, fontWeight: '600' },
  saveBtn: { backgroundColor: colors.green, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, borderRadius: borderRadius.full, justifyContent: 'center' },
  saveText: { color: colors.white, fontWeight: '600' }
});
