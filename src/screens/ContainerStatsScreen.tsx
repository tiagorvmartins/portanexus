import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AppHeader from 'src/components/AppHeader';
import Footer from 'src/components/Footer';
import { useAuth } from 'src/store/useAuth';
import { useContainer } from 'src/store/useContainer';
import { useEndpoints } from 'src/store/useEndpoints';
import GetContainerStatsResponse from 'src/types/GetContainerStatsResponse';

const MAX_POINTS = 20;
// scroll padding (20×2) + section border (1×2) — chart fills card edge-to-edge via negative margin on wrapper
const CHART_WIDTH = Dimensions.get('window').width - 42;
const CHART_HEIGHT = 160;

const StatBar = ({ label, value, color, theme }: any) => {
  const styles = barStyles(theme);
  const pct = Math.min(Math.max(parseFloat(value) || 0, 0), 100);
  const barColor = pct > 80 ? '#ff4444' : color;
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color: barColor }]}>{pct.toFixed(1)}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` as any, backgroundColor: barColor }]} />
      </View>
    </View>
  );
};

const barStyles = (theme: string) => StyleSheet.create({
  container: { marginBottom: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { fontSize: 13, fontWeight: '600', color: theme === 'light' ? '#555' : '#aaa' },
  value: { fontSize: 14, fontWeight: 'bold' },
  track: { height: 8, backgroundColor: theme === 'light' ? '#e0e0e0' : '#333', borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
});

const ContainerStatsScreen = ({ route, navigation }: any) => {
  const { containerId, containerName } = route.params;
  const { theme, logsRefreshInterval, getRefreshInterval } = useAuth();
  const styles = createStyles(theme);
  const { fetchContainerStats } = useContainer();
  const { selectedEndpointId } = useEndpoints();
  const insets = useSafeAreaInsets();

  const [cpuHistory, setCpuHistory] = useState<number[]>([]);
  const [memHistory, setMemHistory] = useState<number[]>([]);
  const [currentCpu, setCurrentCpu] = useState<string>('—');
  const [currentMem, setCurrentMem] = useState<string>('—');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const pollStats = useCallback(async () => {
    const result: any = await fetchContainerStats({ endpointId: selectedEndpointId, containerId });
    if (result?.payload) {
      const { results } = result.payload as GetContainerStatsResponse;
      results.forEach(stat => {
        const val = parseFloat(stat.value);
        if (isNaN(val)) return;
        if (stat.label === 'CPU %') {
          setCurrentCpu(val.toFixed(1));
          setCpuHistory(prev => [...prev.slice(-(MAX_POINTS - 1)), val]);
        } else if (stat.label === 'MEM %') {
          setCurrentMem(val.toFixed(1));
          setMemHistory(prev => [...prev.slice(-(MAX_POINTS - 1)), val]);
        }
      });
    }
  }, [containerId, selectedEndpointId]);

  useFocusEffect(
    useCallback(() => {
      getRefreshInterval();
      pollStats();
      intervalRef.current = setInterval(pollStats, logsRefreshInterval);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setCpuHistory([]);
        setMemHistory([]);
      };
    }, [pollStats, logsRefreshInterval])
  );

  const chartConfig = {
    backgroundGradientFrom: theme === 'light' ? '#FFFFFF' : '#1E1E1E',
    backgroundGradientTo: theme === 'light' ? '#FFFFFF' : '#1E1E1E',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(5, 230, 242, ${opacity})`,
    labelColor: () => theme === 'light' ? '#888888' : '#888888',
    strokeWidth: 2,
    propsForDots: { r: '2' },
    propsForBackgroundLines: {
      stroke: theme === 'light' ? '#e0e0e0' : '#333333',
      strokeDasharray: '',
    },
  };

  const safeData = (arr: number[]) =>
    arr.length >= 2 ? arr.map(v => (isNaN(v) ? 0 : v)) : [0, 0];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader navigation={navigation} />
      <ScrollView contentContainerStyle={styles.scroll}>

        <Text style={styles.title} numberOfLines={1}>{containerName}</Text>

        {/* Current values */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live</Text>
          <StatBar label="CPU %" value={currentCpu} color="#05E6F2" theme={theme} />
          <StatBar label="MEM %" value={currentMem} color="#bb86fc" theme={theme} />
        </View>

        {/* CPU chart */}
        <View style={styles.section}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>CPU History</Text>
            <Text style={styles.currentBadge}>{currentCpu}%</Text>
          </View>
          <View style={styles.chartWrapper}>
            <LineChart
              data={{
                labels: [],
                datasets: [{ data: safeData(cpuHistory), color: (o = 1) => `rgba(5, 230, 242, ${o})`, strokeWidth: 2 }],
              }}
              width={CHART_WIDTH}
              height={CHART_HEIGHT}
              chartConfig={chartConfig}
              bezier
              withDots={false}
              withInnerLines
              withOuterLines={false}
              withHorizontalLabels
              withVerticalLabels={false}
              style={styles.chart}
            />
          </View>
        </View>

        {/* Memory chart */}
        <View style={styles.section}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>Memory History</Text>
            <Text style={[styles.currentBadge, { color: '#bb86fc' }]}>{currentMem}%</Text>
          </View>
          <View style={styles.chartWrapper}>
            <LineChart
              data={{
                labels: [],
                datasets: [{ data: safeData(memHistory), color: (o = 1) => `rgba(187, 134, 252, ${o})`, strokeWidth: 2 }],
              }}
              width={CHART_WIDTH}
              height={CHART_HEIGHT}
              chartConfig={{
                ...chartConfig,
                color: (o = 1) => `rgba(187, 134, 252, ${o})`,
              }}
              bezier
              withDots={false}
              withInnerLines
              withOuterLines={false}
              withHorizontalLabels
              withVerticalLabels={false}
              style={styles.chart}
            />
          </View>
        </View>

      </ScrollView>
      <Footer navigation={navigation} activeTab="Containers" />
    </View>
  );
};

const createStyles = (theme: string) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme === 'light' ? '#f9f9f9' : '#121212',
  },
  scroll: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme === 'light' ? '#333333' : '#e0e0e0',
    marginBottom: 20,
  },
  section: {
    backgroundColor: theme === 'light' ? '#FFFFFF' : '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme === 'light' ? '#DDDDDD' : '#444444',
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme === 'light' ? '#888888' : '#888888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentBadge: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#05E6F2',
  },
  chartWrapper: {
    marginHorizontal: -16,
    marginBottom: -16,
    marginTop: 4,
  },
  chart: {
    borderRadius: 8,
  },
});

export default ContainerStatsScreen;
