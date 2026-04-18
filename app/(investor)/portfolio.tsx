import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { Badge, ProgressBar, Card } from '../../components/ui';

interface Investment {
  id: string;
  name: string;
  amount: number;
  progress: number;
  status: 'active' | 'completed';
  milestone: string;
  color: string;
}

const investments: Investment[] = [
  { id: '1', name: 'NexaHealth', amount: 15000, progress: 72, status: 'active', milestone: 'Milestone 2 pending', color: colors.black },
  { id: '2', name: 'Kredifi', amount: 25000, progress: 88, status: 'completed', milestone: '3 / 3 milestones done', color: colors.green },
];

export default function PortfolioScreen() {
  const totalInvested = 150000;
  const totalValue = 162500;
  const totalGain = totalValue - totalInvested;
  const gainPercentage = ((totalGain / totalInvested) * 100).toFixed(1);

  const growthData = [
    { month: 'Jan', val: 100 },
    { month: 'Feb', val: 110 },
    { month: 'Mar', val: 105 },
    { month: 'Apr', val: 130 },
    { month: 'May', val: 150 },
    { month: 'Jun', val: 162 },
  ];
  const maxVal = 162;

  const allocation = [
    { name: 'NexaHealth', percentage: 45, color: colors.black },
    { name: 'Kredifi', percentage: 35, color: colors.green },
    { name: 'FlowLearn', percentage: 15, color: '#94A3B8' },
    { name: 'Others', percentage: 5, color: '#E2E8F0' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Portfolio</Text>
        <Badge variant="low">Investor</Badge>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Invested</Text>
            <Text style={styles.metricValue}>₹{(totalInvested / 1000).toFixed(0)}K</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Current Value</Text>
            <Text style={[styles.metricValue, { color: colors.green }]}>₹{(totalValue / 1000).toFixed(1)}K</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Gain</Text>
            <Text style={[styles.metricValue, { color: colors.green }]}>+₹{(totalGain / 1000).toFixed(0)}K</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Return</Text>
            <Text style={[styles.metricValue, { color: colors.green }]}>+{gainPercentage}%</Text>
          </View>
        </View>

        {/* Growth Line Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Portfolio Growth</Text>
          <View style={styles.chartCard}>
            <LineChart
              data={{
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                datasets: [{ data: [100, 110, 105, 130, 150, 162.5] }]
              }}
              width={Dimensions.get('window').width - spacing.lg * 2 - spacing.lg * 2} // Screen width minus padding
              height={220}
              yAxisLabel="₹"
              yAxisSuffix="K"
              yAxisInterval={1}
              chartConfig={{
                backgroundColor: colors.white,
                backgroundGradientFrom: colors.white,
                backgroundGradientTo: colors.white,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                labelColor: (opacity = 1) => colors.grayDark,
                style: { borderRadius: 16 },
                propsForDots: { r: "5", strokeWidth: "2", stroke: colors.green }
              }}
              bezier
              style={{ marginVertical: 8, borderRadius: 16 }}
            />
          </View>
        </View>

        {/* Allocation Pie Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Allocation</Text>
          <View style={styles.chartCard}>
            <PieChart
              data={[
                { name: 'NexaHealth', percentage: 45, color: colors.black, legendFontColor: colors.textSecondary, legendFontSize: 13 },
                { name: 'Kredifi', percentage: 35, color: colors.green, legendFontColor: colors.textSecondary, legendFontSize: 13 },
                { name: 'FlowLearn', percentage: 15, color: '#94A3B8', legendFontColor: colors.textSecondary, legendFontSize: 13 },
                { name: 'Others', percentage: 5, color: '#E2E8F0', legendFontColor: colors.textSecondary, legendFontSize: 13 },
              ]}
              width={Dimensions.get('window').width - spacing.lg * 2 - spacing.lg * 2}
              height={200}
              chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
              accessor="percentage"
              backgroundColor="transparent"
              paddingLeft="0"
              absolute
            />
          </View>
        </View>

        {/* Investments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Investments</Text>
          {investments.map((investment) => (
            <TouchableOpacity key={investment.id} style={styles.investmentCard}>
              <View style={styles.investmentHeader}>
                <View style={styles.investmentTitleRow}>
                  <View style={[styles.investmentAvatar, { backgroundColor: investment.color }]}>
                    <Text style={[styles.investmentAvatarText, investment.color === colors.grayBadge && { color: colors.text }]}>
                      {investment.name.substring(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.investmentName}>{investment.name}</Text>
                    <Text style={styles.investmentAmount}>₹{(investment.amount / 1000).toFixed(0)}K invested</Text>
                  </View>
                </View>
                <Badge variant={investment.status === 'completed' ? 'done' : 'pending'}>
                  {investment.status === 'completed' ? 'Completed' : 'Active'}
                </Badge>
              </View>
              <ProgressBar progress={investment.progress} style={styles.investmentProgress} />
              <Text style={styles.investmentStatus}>{investment.progress}% of goal reached · {investment.milestone}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance</Text>
          <Card variant="grey">
            <View style={styles.performanceRow}>
              <Text style={styles.performanceLabel}>Best Performer</Text>
              <Text style={styles.performanceName}>Kredifi</Text>
              <Text style={styles.performanceGain}>+18%</Text>
            </View>
            <View style={[styles.performanceRow, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md, marginTop: spacing.md }]}>
              <Text style={styles.performanceLabel}>Most Invested</Text>
              <Text style={styles.performanceName}>NexaHealth</Text>
              <Text style={styles.performanceAmount}>45%</Text>
            </View>
          </Card>
        </View>
      </ScrollView>
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
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSize.heading,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  metricCard: {
    width: '48%',
    backgroundColor: colors.gray,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  metricLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  metricValue: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  chartCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  investmentCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  investmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  investmentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  investmentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  investmentAvatarText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.white,
  },
  investmentName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  investmentAmount: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  investmentProgress: {
    marginBottom: spacing.sm,
  },
  investmentStatus: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  performanceLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  performanceName: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  performanceGain: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.green,
  },
  performanceAmount: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text,
  },
});
