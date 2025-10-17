import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Server, Box, Activity, CheckCircle2 } from 'lucide-react-native';
import Footer from "../components/Footer";
import AppHeader from "../components/AppHeader";
import { useAuth } from "src/store/useAuth";
import { useSwarm } from "src/store/useSwarm";
import { useEndpoints } from "src/store/useEndpoints";

const ClusterScreen = ({navigation}: any) => {
  const { theme } = useAuth()
  const styles = createStyles(theme);
  const { selectedEndpointId, selectedSwarmId, endpoints } = useEndpoints()
  const { healthy, status, fetchSwarmStatus } = useSwarm()

  useEffect(() => {
      const callFetchSwarmStatus = async() => {
        await fetchSwarmStatus({endpointId: selectedEndpointId, swarmId: selectedSwarmId})
      }

      callFetchSwarmStatus()
  }, [selectedEndpointId]);

  const stats = [
    { label: 'Nodes', value: status?.totalNodes, status: `${status?.readyNodes} ready`, icon: Server, color: styles.primary },
    { label: 'Services', value: status?.servicesTotal, status: `${status?.servicesRunning} running`, icon: Box, color: styles.primary },
    { label: 'Tasks', value: status?.tasksTotal, status: `${status?.tasksRunning} running`, icon: Activity, color: styles.primary },
    { label: 'Stacks', value: status?.stacksTotal, status: `${status?.stacksRunning} running`, icon: CheckCircle2, color: styles.success },
  ];

  const clusterInfo = {
    name: endpoints.find(x => x.Id === selectedEndpointId)?.Name,
    manager: status?.leader,
    version: `Docker ${status?.managerEngineVersion}`,
    status: healthy ? 'healthy' : 'degraded',
  };

  const activities = [
    { action: 'Service scaled', service: 'web-frontend', detail: '3 → 5 replicas', time: '2m ago', type: 'success' },
    { action: 'Node joined', service: 'worker-04', detail: 'Ready', time: '15m ago', type: 'success' },
    { action: 'Task failed', service: 'api-backend.3', detail: 'Exit code 1', time: '1h ago', type: 'error' },
  ];

  return (
      <View style={styles.parentContainer} >
        <AppHeader navigation={navigation} screen="cluster" />
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Cluster Status */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>{clusterInfo.name}</Text>
                <Text style={styles.cardSubtitle}>Manager: {clusterInfo.manager}</Text>
              </View>
              <View style={styles.badgeSuccess}>
                <CheckCircle2 size={14} color="#22c55e" style={{ marginRight: 4 }} />
                <Text style={styles.badgeText}>Healthy</Text>
              </View>
            </View>
            <Text style={styles.versionText}>{clusterInfo.version}</Text>
          </View>

          {/* Stats grid */}
          <View style={styles.statsGrid}>
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <View key={stat.label} style={styles.statCard}>
                    <View style={styles.statHeader}>
                      <Icon size={16} color={stat.color.color} />
                      <Text style={styles.statLabel}>{stat.label}</Text>
                    </View>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statStatus}>{stat.status}</Text>
                  </View>
                );
            })}
          </View>

          {/* Recent Activity */}
          <View style={styles.card}>
            <View style={styles.activityHeader}>
              <Activity size={16} color="#3b82f6" />
              <Text style={styles.activityTitle}>Recent Activity</Text>
            </View>

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
          </View>
        </ScrollView>
        <Footer navigation={navigation} activeTab="Cluster" />
    </View>
  );
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
    badgeText: {
      color: '#22c55e',
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