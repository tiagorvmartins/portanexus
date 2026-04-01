import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { RefreshControl as NativeRefreshControl } from 'react-native';
import { RefreshControl as WebRefreshControl } from 'react-native-web-refresh-control';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AppHeader from 'src/components/AppHeader';
import Footer from 'src/components/Footer';
import { useAuth } from 'src/store/useAuth';
import { useEndpoints } from 'src/store/useEndpoints';
import { showErrorToast } from 'src/utils/toast';
import EndpointEntity from 'src/types/EndpointEntity';

const RefreshControl = Platform.OS === 'web' ? WebRefreshControl : NativeRefreshControl;

const formatMemory = (bytes: number): string => {
  if (!bytes || bytes === 0) return 'N/A';
  const gb = bytes / (1024 ** 3);
  return gb >= 1 ? `${gb.toFixed(1)} GB` : `${(bytes / (1024 ** 2)).toFixed(0)} MB`;
};

const DashboardScreen = ({ navigation }: any) => {
  const { theme } = useAuth();
  const styles = createStyles(theme);
  const { endpoints, selectedEndpointId, fetchEndpoints, setSelectedEndpoint, setSelectedSwarmId } = useEndpoints();
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchEndpoints();
    } catch {
      showErrorToast('Failed to refresh endpoints', theme);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    refresh();
  }, []));

  const handleSelectEndpoint = useCallback(async (item: EndpointEntity) => {
    if (item.Status === 'DOWN') {
      showErrorToast('Endpoint is down. Please select another endpoint.', theme);
      return;
    }
    await setSelectedEndpoint(Number(item.Id));
    if (item.IsSwarm && item.SwarmId) {
      await setSelectedSwarmId(item.SwarmId);
    } else {
      await setSelectedSwarmId('0');
    }
    navigation.navigate('Containers');
  }, []);

  const totalRunning = endpoints.reduce(
    (sum, e) => sum + (e.Snapshots?.[0]?.RunningContainerCount ?? 0), 0
  );
  const totalStopped = endpoints.reduce(
    (sum, e) => sum + (e.Snapshots?.[0]?.StoppedContainerCount ?? 0), 0
  );

  const renderEndpoint = ({ item }: { item: EndpointEntity }) => {
    const snap = item.Snapshots?.[0];
    const running = snap?.RunningContainerCount ?? 0;
    const stopped = snap?.StoppedContainerCount ?? 0;
    const cpu = snap?.TotalCPU ?? 0;
    const memory = snap?.TotalMemory ?? 0;
    const isDown = item.Status === 'DOWN';

    const isSelected = Number(item.Id) === selectedEndpointId;

    return (
      <TouchableOpacity
        style={[styles.card, isDown && styles.cardDown, isSelected && styles.cardSelected]}
        onPress={() => handleSelectEndpoint(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardName} numberOfLines={1}>{item.Name}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{item.IsSwarm ? 'SWARM' : 'DOCKER'}</Text>
            </View>
            <View style={[styles.statusPill, isDown ? styles.statusDown : styles.statusUp]}>
              <Text style={styles.statusText}>{isDown ? 'DOWN' : 'UP'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={styles.dotRunning} />
            <Text style={styles.statValue}>{running}</Text>
            <Text style={styles.statLabel}> running</Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.dotStopped} />
            <Text style={styles.statValue}>{stopped}</Text>
            <Text style={styles.statLabel}> stopped</Text>
          </View>
        </View>

        {(cpu > 0 || memory > 0) && (
          <View style={styles.resourceRow}>
            {cpu > 0 && (
              <Text style={styles.resourceText}>CPU: {cpu} cores</Text>
            )}
            {cpu > 0 && memory > 0 && <Text style={styles.resourceDivider}>·</Text>}
            {memory > 0 && (
              <Text style={styles.resourceText}>RAM: {formatMemory(memory)}</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader navigation={navigation} />

      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{endpoints.length}</Text>
          <Text style={styles.summaryLabel}>Endpoints</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: '#00c853' }]}>{totalRunning}</Text>
          <Text style={styles.summaryLabel}>Running</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: '#ff4444' }]}>{totalStopped}</Text>
          <Text style={styles.summaryLabel}>Stopped</Text>
        </View>
      </View>

      <FlatList
        data={endpoints}
        keyExtractor={item => String(item.Id)}
        renderItem={renderEndpoint}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No endpoints available</Text>
          </View>
        }
      />

      <Footer navigation={navigation} activeTab="Dashboard" />
    </View>
  );
};

const createStyles = (theme: string) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme === 'light' ? '#f9f9f9' : '#121212',
  },
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: theme === 'light' ? '#FFFFFF' : '#1E1E1E',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: theme === 'light' ? '#DDDDDD' : '#444444',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme === 'light' ? '#333333' : '#e0e0e0',
  },
  summaryLabel: {
    fontSize: 11,
    color: theme === 'light' ? '#888888' : '#888888',
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: theme === 'light' ? '#DDDDDD' : '#444444',
    marginVertical: 4,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  card: {
    backgroundColor: theme === 'light' ? '#FFFFFF' : '#1E1E1E',
    borderColor: theme === 'light' ? '#DDDDDD' : '#444444',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardDown: {
    opacity: 0.5,
  },
  cardSelected: {
    borderColor: '#05E6F2',
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme === 'light' ? '#333333' : '#e0e0e0',
    flex: 1,
    marginRight: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeBadge: {
    borderWidth: 1.5,
    borderColor: theme === 'light' ? '#888888' : '#666666',
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: theme === 'light' ? '#555555' : '#aaaaaa',
  },
  statusPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  statusUp: {
    backgroundColor: '#28a745',
  },
  statusDown: {
    backgroundColor: '#dc3545',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotRunning: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00c853',
    marginRight: 5,
  },
  dotStopped: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff4444',
    marginRight: 5,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme === 'light' ? '#333333' : '#e0e0e0',
  },
  statLabel: {
    fontSize: 12,
    color: theme === 'light' ? '#888888' : '#888888',
  },
  resourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  resourceText: {
    fontSize: 11,
    color: theme === 'light' ? '#888888' : '#aaaaaa',
  },
  resourceDivider: {
    fontSize: 11,
    color: theme === 'light' ? '#888888' : '#aaaaaa',
    marginHorizontal: 6,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 15,
    color: theme === 'light' ? '#888888' : '#888888',
  },
});

export default DashboardScreen;
