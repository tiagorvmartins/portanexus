import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator, Pressable } from 'react-native';
import { RefreshControl as NativeRefreshControl } from 'react-native';
import { RefreshControl as WebRefreshControl } from 'react-native-web-refresh-control';
import { Workflow, CheckCircle2, AlertCircle, XCircle, Server, Box } from 'lucide-react-native';
import AppHeader from 'src/components/AppHeader';
import Footer from 'src/components/Footer';
import { useAuth } from 'src/store/useAuth';
import { useEndpoints } from 'src/store/useEndpoints';
import { useLoading } from 'src/store/useLoading';
import { getSwarmTasks } from 'src/features/swarm/swarmAPI';
import GetSwarmPayload from 'src/features/swarm/GetSwarmPayload';
import { showErrorToast } from 'src/utils/toast';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const RefreshControl = Platform.OS === 'web' ? WebRefreshControl : NativeRefreshControl;

const TasksScreen = ({navigation}: any) => {
  const { theme } = useAuth();
  const styles = createStyles(theme);
  const { selectedEndpointId, selectedSwarmId, endpoints } = useEndpoints();
  const { addLoadingComponent, removeLoadingComponent } = useLoading();

  // Check if current endpoint is actually a swarm endpoint
  const selectedEndpoint = endpoints?.find(e => Number(e.Id) === selectedEndpointId);
  const isSwarmEndpoint = selectedEndpoint?.IsSwarm ?? false;
  const isValidSwarmId = selectedSwarmId && 
                         selectedSwarmId !== '0' && 
                         selectedSwarmId !== 0 && 
                         String(selectedSwarmId) !== 'NaN';

  const [tasks, setTasks] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    // Only fetch if endpoint is actually a swarm endpoint
    if (!isSwarmEndpoint || !isValidSwarmId || selectedEndpointId === -1) {
      setTasks([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const payload: GetSwarmPayload = {
        endpointId: selectedEndpointId,
        swarmId: String(selectedSwarmId),
      };
      const response = await getSwarmTasks(payload);
      setTasks(response.results || []);
    } catch (err: any) {
      console.error("Failed to fetch tasks:", err);
      showErrorToast("Failed to fetch swarm tasks", theme);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [selectedEndpointId, selectedSwarmId, theme, isSwarmEndpoint, isValidSwarmId]);

  useEffect(() => {
    // Clear tasks when switching to non-swarm endpoint
    if (!isSwarmEndpoint || !isValidSwarmId) {
      setTasks([]);
      setLoading(false);
      return;
    }
    fetchTasks();
  }, [selectedEndpointId, selectedSwarmId, isSwarmEndpoint, isValidSwarmId]);

  useFocusEffect(
    useCallback(() => {
      if (!isSwarmEndpoint || !isValidSwarmId || selectedEndpointId === -1) {
        setTasks([]);
        setLoading(false);
        return;
      }
      fetchTasks();
    }, [selectedEndpointId, selectedSwarmId, isSwarmEndpoint, isValidSwarmId, fetchTasks])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  }, [fetchTasks]);

  const getTaskStatusColor = (state: string, desiredState: string) => {
    if (state === "running" && desiredState === "running") {
      return "#22c55e"; // green
    }
    if (state === "shutdown" || desiredState === "shutdown") {
      return "#6b7280"; // gray
    }
    if (state === "failed" || state === "rejected") {
      return "#ef4444"; // red
    }
    return "#f59e0b"; // yellow/orange for other states
  };

  const getTaskStatusIcon = (state: string, desiredState: string) => {
    if (state === "running" && desiredState === "running") {
      return <CheckCircle2 size={16} color="#22c55e" />;
    }
    if (state === "shutdown" || desiredState === "shutdown") {
      return <XCircle size={16} color="#6b7280" />;
    }
    if (state === "failed" || state === "rejected") {
      return <AlertCircle size={16} color="#ef4444" />;
    }
    return <Workflow size={16} color="#f59e0b" />;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  const TaskCard = ({ task }: { task: any }) => {
    const taskId = task.ID || "Unknown";
    const taskName = task.Name || taskId.substring(0, 12);
    const serviceId = task.ServiceID || "N/A";
    const nodeId = task.NodeID || "N/A";
    const slot = task.Slot !== undefined ? task.Slot : "N/A";
    const state = task.Status?.State || "unknown";
    const desiredState = task.DesiredState || "unknown";
    const createdAt = formatDate(task.CreatedAt);
    const updatedAt = formatDate(task.UpdatedAt);
    const error = task.Status?.Err || null;
    const containerId = task.Status?.ContainerStatus?.ContainerID || null;

    const statusColor = getTaskStatusColor(state, desiredState);
    const statusIcon = getTaskStatusIcon(state, desiredState);

    return (
      <View style={styles.taskCard}>
        <View style={styles.taskHeader}>
          <View style={styles.taskHeaderLeft}>
            <Workflow size={18} color={styles.primary.color} style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.taskName}>{taskName}</Text>
              <Text style={styles.taskId}>ID: {taskId.substring(0, 12)}</Text>
            </View>
          </View>
          <View style={styles.taskStatus}>
            {statusIcon}
          </View>
        </View>

        <View style={styles.taskDetails}>
          <View style={styles.taskDetailRow}>
            <Text style={styles.taskDetailLabel}>State:</Text>
            <Text style={[styles.taskDetailValue, { color: statusColor }]}>
              {state.charAt(0).toUpperCase() + state.slice(1)}
            </Text>
          </View>
          <View style={styles.taskDetailRow}>
            <Text style={styles.taskDetailLabel}>Desired:</Text>
            <Text style={styles.taskDetailValue}>{desiredState}</Text>
          </View>
          <View style={styles.taskDetailRow}>
            <Text style={styles.taskDetailLabel}>Service ID:</Text>
            <Text style={styles.taskDetailValue} numberOfLines={1} ellipsizeMode="middle">
              {serviceId.substring(0, 12)}
            </Text>
          </View>
          <View style={styles.taskDetailRow}>
            <Text style={styles.taskDetailLabel}>Node ID:</Text>
            <Text style={styles.taskDetailValue} numberOfLines={1} ellipsizeMode="middle">
              {nodeId !== "N/A" ? nodeId.substring(0, 12) : nodeId}
            </Text>
          </View>
          <View style={styles.taskDetailRow}>
            <Text style={styles.taskDetailLabel}>Slot:</Text>
            <Text style={styles.taskDetailValue}>{slot}</Text>
          </View>
          {containerId && (
            <View style={styles.taskDetailRow}>
              <Text style={styles.taskDetailLabel}>Container:</Text>
              <Text style={styles.taskDetailValue} numberOfLines={1} ellipsizeMode="middle">
                {containerId.substring(0, 12)}
              </Text>
            </View>
          )}
          <View style={styles.taskDetailRow}>
            <Text style={styles.taskDetailLabel}>Created:</Text>
            <Text style={styles.taskDetailValue}>{createdAt}</Text>
          </View>
          <View style={styles.taskDetailRow}>
            <Text style={styles.taskDetailLabel}>Updated:</Text>
            <Text style={styles.taskDetailValue}>{updatedAt}</Text>
          </View>
          {error && (
            <View style={styles.errorContainer}>
              <AlertCircle size={14} color="#ef4444" style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>

      </View>
    );
  };

  // Group tasks by state for summary
  const tasksByState = {
    running: tasks.filter((t: any) => t.Status?.State === "running" && t.DesiredState === "running").length,
    shutdown: tasks.filter((t: any) => t.Status?.State === "shutdown" || t.DesiredState === "shutdown").length,
    failed: tasks.filter((t: any) => t.Status?.State === "failed" || t.Status?.State === "rejected").length,
    other: tasks.filter((t: any) => {
      const state = t.Status?.State;
      return state !== "running" && state !== "shutdown" && state !== "failed" && state !== "rejected";
    }).length,
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, {paddingTop: insets.top }]}
      contentContainerStyle={{ paddingBottom: insets.bottom }}>
      <AppHeader navigation={navigation} screen="tasks" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && tasks.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme === 'light' ? '#333' : '#fff'} />
          </View>
        ) : tasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Workflow size={48} color={theme === 'light' ? '#9ca3af' : '#6b7280'} />
            <Text style={styles.emptyText}>No tasks found</Text>
          </View>
        ) : (
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Tasks Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Tasks:</Text>
                <Text style={styles.summaryValue}>{tasks.length}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Running:</Text>
                <Text style={[styles.summaryValue, { color: "#22c55e" }]}>{tasksByState.running}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shutdown:</Text>
                <Text style={[styles.summaryValue, { color: "#6b7280" }]}>{tasksByState.shutdown}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Failed:</Text>
                <Text style={[styles.summaryValue, { color: "#ef4444" }]}>{tasksByState.failed}</Text>
              </View>
              {tasksByState.other > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Other:</Text>
                  <Text style={[styles.summaryValue, { color: "#f59e0b" }]}>{tasksByState.other}</Text>
                </View>
              )}
            </View>

            {tasks.map((task, index) => (
              <TaskCard key={task.ID || index} task={task} />
            ))}
          </>
        )}
      </ScrollView>
      <Footer navigation={navigation} activeTab="Tasks" />
    </View>
  );
};

const createStyles = (theme: string) => {
  const isLight = theme === 'light';

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isLight ? '#f9f9f9' : '#121212',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 200,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 200,
    },
    emptyText: {
      marginTop: 16,
      fontSize: 16,
      color: isLight ? '#6b7280' : '#9ca3af',
    },
    summaryCard: {
      backgroundColor: isLight ? '#ffffff' : '#1a1a1e',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: isLight ? 1 : 0,
      borderColor: isLight ? '#e5e7eb' : 'transparent',
    },
    summaryTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isLight ? '#111827' : '#fff',
      marginBottom: 12,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 6,
    },
    summaryLabel: {
      fontSize: 14,
      color: isLight ? '#6b7280' : '#a1a1aa',
    },
    summaryValue: {
      fontSize: 14,
      fontWeight: '600',
      color: isLight ? '#111827' : '#fff',
    },
    taskCard: {
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
    taskHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    taskHeaderLeft: {
      flexDirection: 'row',
      flex: 1,
      alignItems: 'flex-start',
    },
    taskName: {
      fontSize: 16,
      fontWeight: '600',
      color: isLight ? '#111827' : '#fff',
      marginBottom: 4,
    },
    taskId: {
      fontSize: 12,
      color: isLight ? '#6b7280' : '#9ca3af',
    },
    taskStatus: {
      marginLeft: 12,
    },
    taskDetails: {
      marginBottom: 8,
    },
    taskDetailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 4,
    },
    taskDetailLabel: {
      fontSize: 13,
      color: isLight ? '#6b7280' : '#a1a1aa',
      width: 100,
    },
    taskDetailValue: {
      fontSize: 13,
      fontWeight: '500',
      color: isLight ? '#111827' : '#fff',
      flex: 1,
      textAlign: 'right',
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: isLight ? '#fee2e2' : '#7f1d1d',
      padding: 8,
      borderRadius: 6,
      marginTop: 8,
    },
    errorText: {
      fontSize: 12,
      color: '#ef4444',
      flex: 1,
    },
    primary: { color: '#3b82f6' },
    secondary: { color: '#6b7280' },
  });
};

export default TasksScreen;

