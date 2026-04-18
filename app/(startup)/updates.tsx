import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';

export default function StartupUpdatesScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Updates & Progress</Text>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.placeholder}>Update feed coming soon...</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { padding: spacing.lg, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
    headerTitle: { fontSize: fontSize.heading, fontWeight: '700', color: colors.text },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
    placeholder: { fontSize: fontSize.base, color: colors.textSecondary }
});
