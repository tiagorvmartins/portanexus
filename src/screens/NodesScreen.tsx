import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator, Pressable, Alert } from 'react-native';
import { RefreshControl as NativeRefreshControl } from 'react-native';
import { RefreshControl as WebRefreshControl } from 'react-native-web-refresh-control';
import { Cpu, Star, AlertCircle, CheckCircle2, LogOut, Play, Pause, ArrowDownCircle, Trash2 } from 'lucide-react-native';
import Footer from "../components/Footer";
import AppHeader from "../components/AppHeader";
import { useAuth } from "src/store/useAuth";
import { useEndpoints } from "src/store/useEndpoints";
import { useLoading } from "src/store/useLoading";
import { showErrorToast, showSuccessToast } from 'src/utils/toast';
import { getSwarmNodes, leaveSwarm, updateNodeAvailability } from 'src/features/swarm/swarmAPI';
import GetSwarmPayload from 'src/features/swarm/GetSwarmPayload';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NodesScreen = ({navigation}: any) => {
  const { theme } = useAuth();
  const styles = createStyles(theme);
  const { selectedEndpointId, selectedSwarmId, endpoints } = useEndpoints();
  const { addLoadingComponent, removeLoadingComponent } = useLoading();
  
  const RefreshControl = Platform.OS === 'web' ? WebRefreshControl : NativeRefreshControl;
  const [refreshing, setRefreshing] = useState(false);
  const [nodes, setNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Check if current endpoint is actually a swarm endpoint
  const selectedEndpoint = endpoints?.find(e => Number(e.Id) === selectedEndpointId);
  const isSwarmEndpoint = selectedEndpoint?.IsSwarm ?? false;
  const isValidSwarmId = selectedSwarmId && 
                         selectedSwarmId !== '0' && 
                         selectedSwarmId !== 0 && 
                         String(selectedSwarmId) !== 'NaN';

  const fetchNodes = async () => {
    // Only fetch if endpoint is actually a swarm endpoint
    if (!isSwarmEndpoint || !isValidSwarmId || selectedEndpointId === -1) {
      setNodes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const payload: GetSwarmPayload = {
        endpointId: selectedEndpointId,
        swarmId: String(selectedSwarmId),
      };
      const nodesData = await getSwarmNodes(payload);
      setNodes(nodesData || []);
    } catch (error) {
      console.error("Failed to fetch nodes:", error);
      showErrorToast("Failed to fetch nodes", theme);
      setNodes([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNodes();
    setRefreshing(false);
  };

  useEffect(() => {
    // Clear nodes when switching to non-swarm endpoint
    if (!isSwarmEndpoint || !isValidSwarmId) {
      setNodes([]);
      setLoading(false);
      return;
    }
    fetchNodes();
  }, [selectedEndpointId, selectedSwarmId, isSwarmEndpoint, isValidSwarmId]);

  const handleUpdateAvailability = async (nodeId: string, hostname: string, availability: "active" | "drain" | "pause", nodeVersion?: number) => {
    try {
      addLoadingComponent();
      const payload = {
        endpointId: selectedEndpointId,
        swarmId: String(selectedSwarmId),
        nodeId: nodeId,
        availability: availability,
        version: nodeVersion,
      };
      await updateNodeAvailability(payload);
      const availabilityLabel = availability === "active" ? "Start" : availability === "drain" ? "Drain" : "Pause";
      showSuccessToast(`Node "${hostname}" set to ${availabilityLabel.toLowerCase()}`, theme);
      await fetchNodes();
    } catch (error: any) {
      console.error(`Failed to update node availability to ${availability}:`, error);
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || (error.response?.status ? `Server error (${error.response.status})` : null)
        || error.message 
        || `Failed to update node availability`;
      showErrorToast(errorMessage, theme);
    } finally {
      removeLoadingComponent();
    }
  };

  const handleDeleteNode = (nodeId: string, hostname: string, nodeVersion?: number) => {
    Alert.alert(
      "Delete Node",
      `Are you sure you want to delete node "${hostname}"? The node will be automatically drained first, then removed from the swarm. This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              addLoadingComponent();
              showSuccessToast("Draining node first, then removing...", theme);
              const payload = {
                endpointId: selectedEndpointId,
                swarmId: String(selectedSwarmId),
                nodeId: nodeId,
                force: false,
                version: nodeVersion,
              };
              await leaveSwarm(payload);
              showSuccessToast("Node removed from swarm successfully", theme);
              await fetchNodes();
            } catch (error: any) {
              console.error("Failed to delete node:", error);
              const errorMessage = error.response?.data?.message 
                || error.response?.data?.error 
                || (error.response?.status ? `Server error (${error.response.status})` : null)
                || error.message 
                || "Failed to delete node";
              showErrorToast(errorMessage, theme);
            } finally {
              removeLoadingComponent();
            }
          },
        },
      ]
    );
  };

  const getNodeStatusColor = (state: string, availability: string, reachability?: string) => {
    if (state === "ready" && availability === "active" && (!reachability || reachability === "reachable")) {
      return "#22c55e"; // green
    }
    return "#ef4444"; // red
  };

  const getNodeStatusIcon = (state: string, availability: string, reachability?: string) => {
    if (state === "ready" && availability === "active" && (!reachability || reachability === "reachable")) {
      return <CheckCircle2 size={16} color="#22c55e" />;
    }
    return <AlertCircle size={16} color="#ef4444" />;
  };

  const NodeCard = ({ node }: { node: any }) => {
    const isManager = node.Spec?.Role === "manager";
    const isLeader = node.ManagerStatus?.Leader === true;
    const state = node.Status?.State || "unknown";
    const availability = node.Spec?.Availability || "unknown";
    const reachability = node.ManagerStatus?.Reachability;
    const hostname = node.Description?.Hostname || node.ID?.substring(0, 12) || "Unknown";
    const engineVersion = node.Description?.Engine?.EngineVersion || "Unknown";
    const platform = node.Description?.Platform?.Architecture || "Unknown";
    const nodeId = node.ID || "";
    const nodeVersion = node.Version?.Index;

    const statusColor = getNodeStatusColor(state, availability, reachability);
    const statusIcon = getNodeStatusIcon(state, availability, reachability);

    return (
      <View style={styles.nodeCard}>
        <View style={styles.nodeHeader}>
          <View style={styles.nodeHeaderLeft}>
            {isLeader ? (
              <Star size={18} color="#f59e0b" style={{ marginRight: 8 }} fill="#f59e0b" />
            ) : isManager ? (
              <Cpu size={18} color={styles.primary.color} style={{ marginRight: 8 }} />
            ) : (
              <Cpu size={18} color={styles.secondary.color} style={{ marginRight: 8 }} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.nodeHostname}>{hostname}</Text>
              <View style={styles.nodeBadges}>
                {isLeader && (
                  <View style={styles.badgeLeader}>
                    <Text style={styles.badgeLeaderText}>Leader</Text>
                  </View>
                )}
                {isManager && !isLeader && (
                  <View style={styles.badgeManager}>
                    <Text style={styles.badgeManagerText}>Manager</Text>
                  </View>
                )}
                {!isManager && (
                  <View style={styles.badgeWorker}>
                    <Text style={styles.badgeWorkerText}>Worker</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          <View style={styles.nodeStatus}>
            {statusIcon}
          </View>
        </View>

        <View style={styles.nodeDetails}>
          <View style={styles.nodeDetailRow}>
            <Text style={styles.nodeDetailLabel}>State:</Text>
            <Text style={[styles.nodeDetailValue, { color: statusColor }]}>
              {state.charAt(0).toUpperCase() + state.slice(1)}
            </Text>
          </View>
          <View style={styles.nodeDetailRow}>
            <Text style={styles.nodeDetailLabel}>Availability:</Text>
            <Text style={styles.nodeDetailValue}>{availability}</Text>
          </View>
          {isManager && reachability && (
            <View style={styles.nodeDetailRow}>
              <Text style={styles.nodeDetailLabel}>Reachability:</Text>
              <Text style={[styles.nodeDetailValue, { color: reachability === "reachable" ? "#22c55e" : "#ef4444" }]}>
                {reachability}
              </Text>
            </View>
          )}
          <View style={styles.nodeDetailRow}>
            <Text style={styles.nodeDetailLabel}>Engine:</Text>
            <Text style={styles.nodeDetailValue}>{engineVersion}</Text>
          </View>
          <View style={styles.nodeDetailRow}>
            <Text style={styles.nodeDetailLabel}>Platform:</Text>
            <Text style={styles.nodeDetailValue}>{platform}</Text>
          </View>
        </View>

        <View style={styles.actionButtonsContainer}>
          <Pressable
            style={[styles.actionButton, styles.startButton, availability === "active" && styles.actionButtonDisabled]}
            onPress={() => handleUpdateAvailability(nodeId, hostname, "active", nodeVersion)}
            disabled={availability === "active"}
          >
            <Play size={14} color={availability === "active" ? "#9ca3af" : "#22c55e"} style={{ marginRight: 6 }} />
            <Text style={[styles.actionButtonText, availability === "active" && styles.actionButtonTextDisabled]}>Start</Text>
          </Pressable>
          
          <Pressable
            style={[styles.actionButton, styles.pauseButton, availability === "pause" && styles.actionButtonDisabled]}
            onPress={() => handleUpdateAvailability(nodeId, hostname, "pause", nodeVersion)}
            disabled={availability === "pause"}
          >
            <Pause size={14} color={availability === "pause" ? "#9ca3af" : "#f59e0b"} style={{ marginRight: 6 }} />
            <Text style={[styles.actionButtonText, availability === "pause" && styles.actionButtonTextDisabled]}>Pause</Text>
          </Pressable>
          
          <Pressable
            style={[styles.actionButton, styles.drainButton, availability === "drain" && styles.actionButtonDisabled]}
            onPress={() => handleUpdateAvailability(nodeId, hostname, "drain", nodeVersion)}
            disabled={availability === "drain"}
          >
            <ArrowDownCircle size={14} color={availability === "drain" ? "#9ca3af" : "#3b82f6"} style={{ marginRight: 6 }} />
            <Text style={[styles.actionButtonText, availability === "drain" && styles.actionButtonTextDisabled]}>Drain</Text>
          </Pressable>
          
          <Pressable
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteNode(nodeId, hostname, nodeVersion)}
          >
            <Trash2 size={14} color="#ef4444" style={{ marginRight: 6 }} />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { flex: 1, paddingTop: insets.top }]} contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom }}>
      <AppHeader navigation={navigation} screen="nodes" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && nodes.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme === 'light' ? '#333' : '#fff'} />
          </View>
        ) : nodes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Cpu size={48} color={theme === 'light' ? '#9ca3af' : '#6b7280'} />
            <Text style={styles.emptyText}>No nodes found</Text>
          </View>
        ) : (
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Nodes Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Nodes:</Text>
                <Text style={styles.summaryValue}>{nodes.length}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Managers:</Text>
                <Text style={styles.summaryValue}>
                  {nodes.filter(n => n.Spec?.Role === "manager").length}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Workers:</Text>
                <Text style={styles.summaryValue}>
                  {nodes.filter(n => n.Spec?.Role === "worker").length}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Ready:</Text>
                <Text style={styles.summaryValue}>
                  {nodes.filter(n => n.Status?.State === "ready" && n.Spec?.Availability === "active").length}
                </Text>
              </View>
            </View>

            {nodes.slice() // avoid mutating original array
              .sort((a, b) => {
                const aLeader = a.ManagerStatus?.Leader ? 1 : 0;
                const bLeader = b.ManagerStatus?.Leader ? 1 : 0;

                // Put leader first → sort descending
                return bLeader - aLeader;
              })
              .map((node, index) => (
                <NodeCard key={node.ID || index} node={node} />
              ))
            }
          </>
        )}
      </ScrollView>
      <Footer navigation={navigation} activeTab="Nodes" />
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
    nodeCard: {
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
    nodeHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    nodeHeaderLeft: {
      flexDirection: 'row',
      flex: 1,
      alignItems: 'flex-start',
    },
    nodeHostname: {
      fontSize: 16,
      fontWeight: '600',
      color: isLight ? '#111827' : '#fff',
      marginBottom: 4,
    },
    nodeBadges: {
      flexDirection: 'row',
      gap: 6,
    },
    badgeLeader: {
      backgroundColor: isLight ? '#fef3c7' : '#78350f',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    badgeLeaderText: {
      fontSize: 10,
      fontWeight: '600',
      color: isLight ? '#92400e' : '#fbbf24',
    },
    badgeManager: {
      backgroundColor: isLight ? '#dbeafe' : '#1e3a8a',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    badgeManagerText: {
      fontSize: 10,
      fontWeight: '600',
      color: isLight ? '#1e40af' : '#60a5fa',
    },
    badgeWorker: {
      backgroundColor: isLight ? '#f3f4f6' : '#374151',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    badgeWorkerText: {
      fontSize: 10,
      fontWeight: '600',
      color: isLight ? '#4b5563' : '#9ca3af',
    },
    nodeStatus: {
      marginLeft: 12,
    },
    nodeDetails: {
      marginBottom: 12,
    },
    nodeDetailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 4,
    },
    nodeDetailLabel: {
      fontSize: 13,
      color: isLight ? '#6b7280' : '#a1a1aa',
    },
    nodeDetailValue: {
      fontSize: 13,
      fontWeight: '500',
      color: isLight ? '#111827' : '#fff',
    },
    actionButtonsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 12,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderWidth: 1,
      flex: 1,
      minWidth: '22%',
    },
    startButton: {
      backgroundColor: isLight ? '#dcfce7' : '#14532d',
      borderColor: isLight ? '#bbf7d0' : '#166534',
    },
    pauseButton: {
      backgroundColor: isLight ? '#fef3c7' : '#78350f',
      borderColor: isLight ? '#fde68a' : '#92400e',
    },
    drainButton: {
      backgroundColor: isLight ? '#dbeafe' : '#1e3a8a',
      borderColor: isLight ? '#bfdbfe' : '#1e40af',
    },
    deleteButton: {
      backgroundColor: isLight ? '#fee2e2' : '#7f1d1d',
      borderColor: isLight ? '#fecaca' : '#991b1b',
    },
    actionButtonDisabled: {
      backgroundColor: isLight ? '#f3f4f6' : '#374151',
      borderColor: isLight ? '#e5e7eb' : '#4b5563',
      opacity: 0.6,
    },
    actionButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: isLight ? '#111827' : '#fff',
    },
    actionButtonTextDisabled: {
      color: isLight ? '#9ca3af' : '#6b7280',
    },
    deleteButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#ef4444',
    },
    primary: { color: '#3b82f6' },
    secondary: { color: '#6b7280' },
  });
};

export default NodesScreen;

