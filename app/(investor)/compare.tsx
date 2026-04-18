import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { useRouter } from 'expo-router';
import { BarChart } from 'react-native-chart-kit';
import { API_HOST_PYTHON } from '../../context/AuthContext';

const startups = [
  { id: '1', name: 'NexaHealth', industry: 'HealthTech', stage: 'Seed', description: 'AI-driven health monitoring system. High R&D costs, strong potential market.', metrics: { risk: 75, trust: 80, growth: 90 } },
  { id: '2', name: 'Kredifi', industry: 'FinTech', stage: 'Series A', description: 'Credit building for underbanked. Growing user base, moderate regulatory risk.', metrics: { risk: 50, trust: 85, growth: 70 } },
  { id: '3', name: 'Surgent AI', industry: 'AI/ML', stage: 'Pre-seed', description: 'Generative AI for marketing copy. Crowded space, high technical talent.', metrics: { risk: 90, trust: 60, growth: 85 } },
  { id: '4', name: 'AgroVault', industry: 'AgriTech', stage: 'Seed', description: 'IoT based crop management. Physical hardware costs, steady stable growth.', metrics: { risk: 40, trust: 90, growth: 50 } },
];

export default function CompareScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const toggleSelect = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(i => i !== id));
    } else {
      if (selected.length < 2) {
        setSelected([...selected, id]);
      }
    }
  };

  const handleCompare = async () => {
    if (selected.length !== 2) return;
    setLoading(true);
    setResult(null);

    const s1 = startups.find(s => s.id === selected[0]);
    const s2 = startups.find(s => s.id === selected[1]);

    try {
      const res = await fetch(`${API_HOST_PYTHON}/api/compare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startup1: s1,
          startup2: s2
        }),
      });

      const data = await res.json();
      setResult(data.comparison);
    } catch (e) {
      console.error(e);
      setResult("Error contacting AI server. Please ensure the Python FastAPI backend is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelected([]);
    setResult(null);
  };

  const s1 = startups.find(s => s.id === selected[0]);
  const s2 = startups.find(s => s.id === selected[1]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Compare</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.instruction}>Select 2 startups to perform an AI-driven comparison of Risk, Trust Score, and Growth.</Text>

        <View style={styles.grid}>
          {startups.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={[
                styles.startupCard,
                selected.includes(s.id) && styles.selectedCard
              ]}
              onPress={() => toggleSelect(s.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.sName, selected.includes(s.id) && { color: colors.white }]}>{s.name}</Text>
              <Text style={[styles.sInd, selected.includes(s.id) && { color: colors.white }]}>{s.industry}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.compareBtn, selected.length !== 2 && styles.disabledBtn]}
          disabled={selected.length !== 2 || loading}
          onPress={handleCompare}
        >
          {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.compareBtnText}>Compare using Mistral AI</Text>}
        </TouchableOpacity>

        {result && s1 && s2 && (
          <View style={styles.resultBox}>
            <View style={styles.resultHeader}>
              <MaterialCommunityIcons name="robot-outline" size={20} color={colors.green} />
              <Text style={styles.resultTitle}>Mistral AI Analysis</Text>
            </View>
            <Text style={styles.resultText}>{result}</Text>

            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Performance Metrics Comparison</Text>
              <BarChart
                data={{
                  labels: ["Risk", "Trust", "Growth"],
                  datasets: [
                    {
                      data: [s1.metrics.risk, s1.metrics.trust, s1.metrics.growth]
                    },
                    {
                      data: [s2.metrics.risk, s2.metrics.trust, s2.metrics.growth]
                    }
                  ]
                }}
                width={Dimensions.get("window").width - spacing.lg * 4}
                height={220}
                yAxisLabel=""
                yAxisSuffix="%"
                chartConfig={{
                  backgroundColor: colors.white,
                  backgroundGradientFrom: colors.white,
                  backgroundGradientTo: colors.white,
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: { borderRadius: 8 },
                  barPercentage: 0.6,
                }}
                style={{ marginVertical: 8, borderRadius: 8 }}
                showValuesOnTopOfBars
              />

              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: `rgba(16, 185, 129, 1)` }]} />
                  <Text style={styles.legendText}>{s1.name}</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: `rgba(16, 185, 129, 0.5)` }]} />
                  <Text style={styles.legendText}>{s2.name}</Text>
                </View>
              </View>
            </View>

            {/* Compare Again Button */}
            <TouchableOpacity style={styles.compareAgainBtn} onPress={handleReset}>
              <MaterialCommunityIcons name="refresh" size={20} color={colors.white} />
              <Text style={styles.compareBtnText}>Compare Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { padding: spacing.xs },
  headerTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  content: { padding: spacing.lg },
  instruction: { fontSize: fontSize.base, color: colors.textSecondary, marginBottom: spacing.lg, lineHeight: 22 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xl },
  startupCard: { width: '47%', padding: spacing.lg, backgroundColor: colors.white, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border },
  selectedCard: { backgroundColor: colors.black, borderColor: colors.black },
  sName: { fontSize: fontSize.base, fontWeight: '700', color: colors.text, marginBottom: 4 },
  sInd: { fontSize: fontSize.sm, color: colors.textSecondary },
  compareBtn: { backgroundColor: colors.green, padding: spacing.lg, borderRadius: borderRadius.md, alignItems: 'center' },
  disabledBtn: { backgroundColor: '#CBD5E1' },
  compareBtnText: { color: colors.white, fontSize: fontSize.base, fontWeight: '700' },
  resultBox: { marginTop: spacing.xl, padding: spacing.lg, backgroundColor: colors.white, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  resultTitle: { fontSize: fontSize.base, fontWeight: '700', color: colors.green },
  resultText: { fontSize: fontSize.base, color: colors.text, lineHeight: 24, marginBottom: spacing.xl },
  chartContainer: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  chartTitle: { fontSize: fontSize.base, fontWeight: '600', color: colors.text, marginBottom: spacing.md, textAlign: 'center' },
  legendContainer: { flexDirection: 'row', justifyContent: 'center', gap: spacing.lg, marginTop: spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendColor: { width: 12, height: 12, borderRadius: 2 },
  legendText: { fontSize: fontSize.sm, color: colors.textSecondary },
  compareAgainBtn: { backgroundColor: colors.black, marginTop: spacing.xl, padding: spacing.lg, borderRadius: borderRadius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm }
});
