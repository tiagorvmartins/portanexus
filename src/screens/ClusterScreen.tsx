import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator, Pressable } from 'react-native';
import { RefreshControl as NativeRefreshControl } from 'react-native';
import { RefreshControl as WebRefreshControl } from 'react-native-web-refresh-control';
import { Cpu, SquareChartGantt, Activity, CheckCircle2, AlertCircle, Layers, Workflow } from 'lucide-react-native';
import Footer from "../components/Footer";
import AppHeader from "../components/AppHeader";
import { useAuth } from "src/store/useAuth";
import { useSwarm } from "src/store/useSwarm";
import { useEndpoints } from "src/store/useEndpoints";
import { showErrorToast } from 'src/utils/toast';
import { useFocusEffect } from '@react-navigation/native';

const ClusterScreen = ({navigation}: any) => {
  const { theme } = useAuth()
  const styles = createStyles(theme);
  const { selectedEndpointId, selectedSwarmId, endpoints } = useEndpoints()
  const { healthy, status, fetchSwarmStatus, fetchSwarmEvents, recentEvents, clearSwarmState } = useSwarm()

  // Check if current endpoint is actually a swarm endpoint
  const selectedEndpoint = endpoints?.find(e => Number(e.Id) === selectedEndpointId);
  const isSwarmEndpoint = selectedEndpoint?.IsSwarm ?? false;
  const isValidSwarmId = selectedSwarmId && 
                         selectedSwarmId !== '0' && 
                         selectedSwarmId !== 0 && 
                         String(selectedSwarmId) !== 'NaN';

  const RefreshControl = Platform.OS === 'web' ? WebRefreshControl : NativeRefreshControl;
  const [refreshing, setRefreshing] = useState(false);
  const [refreshEnabled, setRefreshEnabled] = useState(true);

  const fetchClusterData = async () => {
    // Only fetch if endpoint is actually a swarm endpoint
    if (!isSwarmEndpoint || !isValidSwarmId || selectedEndpointId === -1) {
      clearSwarmState();
      setRefreshing(false);
      return;
    }

    setRefreshing(true);
    try {
      await fetchSwarmStatus({ endpointId: selectedEndpointId, swarmId: String(selectedSwarmId) });
      await fetchSwarmEvents({ endpointId: selectedEndpointId, swarmId: String(selectedSwarmId) });
    } catch (err) {
      console.error("Failed to fetch cluster data:", err);
      // Don't show error toast for non-swarm endpoints
      if (isSwarmEndpoint && isValidSwarmId) {
        showErrorToast("Failed to fetch cluster data", theme);
      }
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Clear state immediately when switching to non-swarm endpoint
    if (!isSwarmEndpoint || !isValidSwarmId || selectedEndpointId === -1) {
      clearSwarmState();
      return;
    }
    fetchClusterData();
  }, [selectedEndpointId, selectedSwarmId, isSwarmEndpoint, isValidSwarmId]);

  useFocusEffect(
    useCallback(() => {
      if (!isSwarmEndpoint || !isValidSwarmId || selectedEndpointId === -1) {
        clearSwarmState();
        return;
      }
      fetchClusterData();
    }, [selectedEndpointId, selectedSwarmId, isSwarmEndpoint, isValidSwarmId])
  );

  const stats = [
    { label: 'Nodes', value: status?.totalNodes, status: `${status?.readyNodes} ready`, icon: Cpu, color: styles.primary, route: 'Nodes' },
    { label: 'Services', value: status?.servicesTotal, status: `${status?.servicesRunning} running`, icon: SquareChartGantt, color: styles.primary, route: 'Services' },
    { label: 'Tasks', value: status?.tasksTotal, status: `${status?.tasksRunning} running`, icon: Workflow, color: styles.primary, route: 'Tasks' },
    { label: 'Stacks', value: status?.stacksTotal, status: `${status?.stacksRunning} running`, icon: Layers, color: styles.primary, route: 'Stacks' },
  ];

  const clusterInfo = {
    name: endpoints.find(x => x.Id === selectedEndpointId)?.Name,
    manager: status?.leader,
    version: `Docker ${status?.managerEngineVersion}`,
    status: healthy ? 'healthy' : 'degraded',
  };

  // Map Docker event types to display and sort by most recent
  const activities = (recentEvents?.map((event: any) => {
    let action = event.Action || event.status || event.Type;
    let service = event.Actor?.Attributes?.name || event.Actor?.ID || event.id || '';
    let detail = event.Actor?.Attributes?.message || event.Actor?.Attributes?.image || '';
    let time = event.time ? `${Math.floor((Date.now()/1000 - event.time)/60)}m ago` : '';
    let type = (event.status === 'fail' || event.Action === 'die' || event.Action === 'fail') ? 'error' : 'success';
    return { action, service, detail, time, type, rawTime: event.time };
  }) || []).sort((a, b) => (b.rawTime ?? 0) - (a.rawTime ?? 0));

  // Platform-specific: For web, only Recent Activity is scrollable and refreshable. For native, whole screen is scrollable and refreshable.
  if (Platform.OS === 'web') {
    // Use a single ScrollView for the whole screen, but only Recent Activity is flex: 1 and scrollable visually
    return (
      <View style={[styles.parentContainer, { flex: 1 }]}> 
        <AppHeader navigation={navigation} screen="cluster" />
        <View style={{ flex: 1 }}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
            refreshControl={
              <WebRefreshControl
                refreshing={refreshing}
                onRefresh={fetchClusterData}
              />
            }
          >
            <View style={styles.container}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.cardTitle}>{clusterInfo.name}</Text>
                    <Text style={styles.cardSubtitle}>Manager: {clusterInfo.manager}</Text>
                  </View>
                  <View style={clusterInfo.status === 'healthy' ? styles.badgeSuccess : styles.badgeDegraded}>
                    {clusterInfo.status === 'healthy' ? (
                      <CheckCircle2 size={14} color="#22c55e" style={{ marginRight: 4 }} />
                    ) : (
                      <AlertCircle size={14} color="#ef4444" style={{ marginRight: 4 }} />
                    )}
                    <Text style={clusterInfo.status === 'healthy' ? styles.badgeTextSuccess : styles.badgeTextDegraded}>
                      {clusterInfo.status.charAt(0).toUpperCase() + clusterInfo.status.slice(1)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.versionText}>{clusterInfo.version}</Text>
              </View>
              <View style={styles.statsGrid}>
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  const isClickable = stat.route !== undefined;
                  const CardWrapper = isClickable ? Pressable : View;
                  return (
                    <CardWrapper
                      key={stat.label}
                      style={styles.statCard}
                      onPress={isClickable ? () => navigation.navigate(stat.route) : undefined}
                    >
                      <View style={styles.statHeader}>
                        <Icon size={16} color={stat.color.color} />
                        <Text style={styles.statLabel}>{stat.label}</Text>
                      </View>
                      <Text style={styles.statValue}>{stat.value}</Text>
                      <Text style={styles.statStatus}>{stat.status}</Text>
                    </CardWrapper>
                  );
                })}
              </View>
              <View style={[styles.card, { flex: 1, minHeight: 200, maxHeight: 400 }]}>
                <View style={styles.activityHeader}>
                  <Activity size={16} color="#3b82f6" />
                  <Text style={styles.activityTitle}>Recent Activity</Text>
                </View>
                {refreshing && activities.length === 0 && (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
                    <ActivityIndicator size="large" color={theme === 'light' ? '#333' : '#fff'} />
                  </View>
                )}
                <View style={{ flex: 1, overflow: 'scroll' }}>
                  {activities.map((activity, i) => (
                    <View key={i} style={[styles.activityItem, i < activities.length - 1 && styles.activityItemBorder]}>
                      <View
                        style={[
                          styles.statusDot,
                          activity.type === 'success' ? styles.successDot : styles.errorDot,
                        ]}
                      />
                      <View style={{ flex: 1 }}>
                        <View style={styles.activityRow}>
                          <Text style={styles.activityAction}>{activity.action}</Text>
                          <Text style={styles.activityTime}>{activity.time}</Text>
                        </View>
                        <Text style={styles.activityService}>{activity.service}</Text>
                        <Text style={styles.activityDetail}>{activity.detail}</Text>
                      </View>
                    </View>
                  ))}
                  {refreshing && activities.length > 0 && (
                    <View style={{ justifyContent: 'center', alignItems: 'center', minHeight: 60 }}>
                      <ActivityIndicator size="small" color={theme === 'light' ? '#333' : '#fff'} />
                    </View>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
        <Footer navigation={navigation} activeTab="Cluster" />
      </View>
    );
  } else {
    // Native: top-level ScrollView for RefreshControl, only Recent Activity visually scrollable
    return (
      <ScrollView
        style={[styles.parentContainer, { flex: 1 }]} 
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <NativeRefreshControl
            refreshing={refreshing}
            onRefresh={fetchClusterData}
            enabled={refreshEnabled}
          />
        }
      >
        <AppHeader navigation={navigation} screen="cluster" />
        <View style={[styles.container, { flex: 1 }]}> 
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>{clusterInfo.name}</Text>
                <Text style={styles.cardSubtitle}>Manager: {clusterInfo.manager}</Text>
              </View>
              <View style={clusterInfo.status === 'healthy' ? styles.badgeSuccess : styles.badgeDegraded}>
                {clusterInfo.status === 'healthy' ? (
                  <CheckCircle2 size={14} color="#22c55e" style={{ marginRight: 4 }} />
                ) : (
                  <AlertCircle size={14} color="#ef4444" style={{ marginRight: 4 }} />
                )}
                <Text style={clusterInfo.status === 'healthy' ? styles.badgeTextSuccess : styles.badgeTextDegraded}>
                  {clusterInfo.status.charAt(0).toUpperCase() + clusterInfo.status.slice(1)}
                </Text>
              </View>
            </View>
            <Text style={styles.versionText}>{clusterInfo.version}</Text>
          </View>

          <View style={styles.statsGrid}>
            {stats.map((stat) => {
              const Icon = stat.icon;
              const isClickable = stat.route !== undefined;
              const CardWrapper = isClickable ? Pressable : View;
              return (
                <CardWrapper
                  key={stat.label}
                  style={styles.statCard}
                  onPress={isClickable ? () => navigation.navigate(stat.route) : undefined}
                >
                  <View style={styles.statHeader}>
                    <Icon size={16} color={stat.color.color} />
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                  <Text style={styles.statValue}>{String(stat.value)}</Text>
                  <Text style={styles.statStatus}>{String(stat.status)}</Text>
                </CardWrapper>
              );
            })}
          </View>

          <View style={[styles.card, { minHeight: 200, maxHeight: 400, flex: 1 }]}> 
            <View style={styles.activityHeader}>
              <Activity size={16} color="#3b82f6" />
              <Text style={styles.activityTitle}>Recent Activity</Text>
            </View>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 40 }}
              onScrollBeginDrag={() => setRefreshEnabled(false)}
              onScrollEndDrag={() => setRefreshEnabled(true)}
            >
              {refreshing && activities.length === 0 && (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
                  <ActivityIndicator size="large" color={theme === 'light' ? '#333' : '#fff'} />
                </View>
              )}
              {activities.map((activity, i) => (
                <View key={i} style={[styles.activityItem, i < activities.length - 1 && styles.activityItemBorder]}>
                  <View
                    style={[
                      styles.statusDot,
                      activity.type === 'success' ? styles.successDot : styles.errorDot,
                    ]}
                  />
                  <View style={{ flex: 1 }}>
                    <View style={styles.activityRow}>
                      <Text style={styles.activityAction}>{String(activity.action)}</Text>
                      <Text style={styles.activityTime}>{String(activity.time)}</Text>
                    </View>
                    <Text style={styles.activityService}>{String(activity.service)}</Text>
                    <Text style={styles.activityDetail}>{String(activity.detail)}</Text>
                  </View>
                </View>
              ))}
              {refreshing && activities.length > 0 && (
                <View style={{ justifyContent: 'center', alignItems: 'center', minHeight: 60 }}>
                  <ActivityIndicator size="small" color={theme === 'light' ? '#333' : '#fff'} />
                </View>
              )}
            </ScrollView>
          </View>
        </View>
        <Footer navigation={navigation} activeTab="Cluster" />
      </ScrollView>
    );
  }
}

const createStyles = (theme: string) => {
  const isLight = theme === 'light';
  const primary = '#05E6F2';

  return StyleSheet.create({
    parentContainer: {
      backgroundColor: isLight ? '#f9f9f9' : '#121212',
      flex: 1,
    },
    container: {
      padding: 16,
      backgroundColor: isLight ? '#ffffff' : '#0b0b0f',
    },
    card: {
      backgroundColor: isLight ? '#ffffff' : '#1a1a1e',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: isLight ? 1 : 0,
      borderColor: isLight ? '#e5e7eb' : 'transparent',
      shadowColor: isLight ? '#000' : '#000',
      shadowOpacity: isLight ? 0.05 : 0.3,
      shadowRadius: 4,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isLight ? '#111827' : '#fff',
    },
    cardSubtitle: {
      fontSize: 13,
      color: isLight ? '#6b7280' : '#a1a1aa',
    },
    badgeSuccess: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isLight ? '#22c55e22' : '#22c55e33',
      borderColor: isLight ? '#22c55e44' : '#22c55e55',
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    badgeDegraded: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isLight ? '#ef444422' : '#ef444433',
      borderColor: isLight ? '#ef444444' : '#ef444455',
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    badgeTextSuccess: {
      color: '#22c55e',
      fontSize: 12,
      fontWeight: '500',
    },
    badgeTextDegraded: {
      color: '#ef4444',
      fontSize: 12,
      fontWeight: '500',
    },
    versionText: {
      fontSize: 12,
      color: isLight ? '#6b7280' : '#a1a1aa',
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    statCard: {
      backgroundColor: isLight ? '#ffffff' : '#1a1a1e',
      borderRadius: 12,
      padding: 16,
      width: '48%',
      marginBottom: 8,
      borderWidth: isLight ? 1 : 0,
      borderColor: isLight ? '#e5e7eb' : 'transparent',
    },
    statHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 14,
      color: isLight ? '#6b7280' : '#a1a1aa',
    },
    statValue: {
      fontSize: 24,
      fontWeight: '700',
      color: isLight ? '#111827' : '#fff',
    },
    statStatus: {
      fontSize: 12,
      color: isLight ? '#6b7280' : '#a1a1aa',
    },
    activityHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 12,
    },
    activityTitle: {
      fontWeight: '600',
      fontSize: 16,
      color: isLight ? '#111827' : '#fff',
    },
    activityItem: {
      flexDirection: 'row',
      gap: 8,
      paddingBottom: 8,
      marginBottom: 8,
    },
    activityItemBorder: {
      borderBottomWidth: 1,
      borderBottomColor: isLight ? '#e5e7eb' : '#2a2a2e',
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginTop: 4,
    },
    successDot: { backgroundColor: '#22c55e' },
    errorDot: { backgroundColor: '#ef4444' },
    activityRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    activityAction: {
      color: isLight ? '#111827' : '#fff',
      fontWeight: '500',
      fontSize: 14,
    },
    activityTime: {
      color: isLight ? '#6b7280' : '#a1a1aa',
      fontSize: 12,
    },
    activityService: {
      color: isLight ? '#6b7280' : '#a1a1aa',
      fontSize: 13,
    },
    activityDetail: {
      color: isLight ? '#9ca3af' : '#71717a',
      fontSize: 12,
    },
    primary: { color: primary },
    success: { color: '#22c55e' },
  });
};

export default ClusterScreen;