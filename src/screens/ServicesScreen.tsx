import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator, Pressable, TextInput, Modal, Alert } from 'react-native';
import { RefreshControl as NativeRefreshControl } from 'react-native';
import { RefreshControl as WebRefreshControl } from 'react-native-web-refresh-control';
import { SquareChartGantt, CheckCircle2, AlertCircle, Server, Layers, Clock, ArrowUpDown, X, RefreshCw } from 'lucide-react-native';
import AppHeader from 'src/components/AppHeader';
import Footer from 'src/components/Footer';
import { useAuth } from 'src/store/useAuth';
import { useEndpoints } from 'src/store/useEndpoints';
import { useLoading } from 'src/store/useLoading';
import { getSwarmServices, updateServiceScale, recreateService, getSwarmTasks } from 'src/features/swarm/swarmAPI';
import GetSwarmPayload from 'src/features/swarm/GetSwarmPayload';
import { showErrorToast, showSuccessToast } from 'src/utils/toast';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const RefreshControl = Platform.OS === 'web' ? WebRefreshControl : NativeRefreshControl;

const ServicesScreen = ({navigation}: any) => {
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

  const [services, setServices] = useState<any[]>([]);
  const [serviceTasks, setServiceTasks] = useState<Record<string, number>>({}); // serviceName -> runningTasks count
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scaleModalVisible, setScaleModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<{ id: string; name: string; replicas: number } | null>(null);
  const [replicasInput, setReplicasInput] = useState('');

  const fetchServices = useCallback(async () => {
    // Only fetch if endpoint is actually a swarm endpoint
    if (!isSwarmEndpoint || !isValidSwarmId || selectedEndpointId === -1) {
      setServices([]);
      setServiceTasks({});
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const payload: GetSwarmPayload = {
        endpointId: selectedEndpointId,
        swarmId: String(selectedSwarmId),
      };
      const response = await getSwarmServices(payload);
      const servicesList = response.results || [];
      setServices(servicesList);
      
      // Fetch tasks for each service to count running tasks
      const tasksMap: Record<string, number> = {};
      
      await Promise.all(
        servicesList.map(async (service: any) => {
          const serviceName = service.Spec?.Name;
          if (!serviceName) return;
          
          try {
            const tasksPayload: GetSwarmPayload = {
              endpointId: selectedEndpointId,
              swarmId: String(selectedSwarmId),
              serviceName: serviceName,
            };
            const tasksResponse = await getSwarmTasks(tasksPayload);
            const runningTasks = (tasksResponse.results || []).filter(
              (task: any) => task.Status?.State === "running"
            ).length;
            tasksMap[serviceName] = runningTasks;
          } catch (err) {
            console.warn(`Failed to fetch tasks for service ${serviceName}:`, err);
            tasksMap[serviceName] = 0;
          }
        })
      );
      
      setServiceTasks(tasksMap);
    } catch (err: any) {
      console.error("Failed to fetch services:", err);
      showErrorToast("Failed to fetch swarm services", theme);
      setServices([]);
      setServiceTasks({});
    } finally {
      setLoading(false);
    }
  }, [selectedEndpointId, selectedSwarmId, theme, isSwarmEndpoint, isValidSwarmId]);

  useEffect(() => {
    // Clear services when switching to non-swarm endpoint
    if (!isSwarmEndpoint || !isValidSwarmId) {
      setServices([]);
      setServiceTasks({});
      setLoading(false);
      return;
    }
    fetchServices();
  }, [selectedEndpointId, selectedSwarmId, isSwarmEndpoint, isValidSwarmId]);

  useFocusEffect(
    useCallback(() => {
      if (!isSwarmEndpoint || !isValidSwarmId || selectedEndpointId === -1) {
        setServices([]);
        setServiceTasks({});
        setLoading(false);
        return;
      }
      fetchServices();
    }, [selectedEndpointId, selectedSwarmId, isSwarmEndpoint, isValidSwarmId, fetchServices])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchServices();
    setRefreshing(false);
  }, [fetchServices]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  const formatPorts = (ports: any) => {
    if (!ports || !Array.isArray(ports) || ports.length === 0) {
      return "None";
    }
    return ports.map((p: any) => {
      const published = p.PublishedPort ? `${p.PublishedPort}:` : '';
      const target = p.TargetPort || '';
      const protocol = p.Protocol || 'tcp';
      return `${published}${target}/${protocol}`;
    }).join(', ');
  };

  const getStackName = (labels: any) => {
    if (!labels) return null;
    // Check for common stack label patterns
    return labels['com.docker.stack.namespace'] || 
           labels['com.docker.compose.project'] ||
           null;
  };

  const openScaleModal = (serviceId: string, serviceName: string, currentReplicas: number) => {
    setSelectedService({ id: serviceId, name: serviceName, replicas: currentReplicas });
    setReplicasInput(currentReplicas.toString());
    setScaleModalVisible(true);
  };

  const closeScaleModal = () => {
    setScaleModalVisible(false);
    setSelectedService(null);
    setReplicasInput('');
  };

  const handleScaleUpdate = async () => {
    if (!selectedService) return;
    
    if (!replicasInput) {
      showErrorToast("Please enter a number of replicas", theme);
      return;
    }
    
    const newReplicas = parseInt(replicasInput, 10);
    if (isNaN(newReplicas) || newReplicas < 0) {
      showErrorToast("Please enter a valid number (0 or greater)", theme);
      return;
    }

    try {
      addLoadingComponent();
      closeScaleModal();
      const payload = {
        endpointId: selectedEndpointId,
        swarmId: String(selectedSwarmId),
        serviceId: selectedService.id,
        replicas: newReplicas,
      };
      await updateServiceScale(payload);
      showSuccessToast(`Service "${selectedService.name}" scaled to ${newReplicas} replicas`, theme);
      await fetchServices();
    } catch (error: any) {
      console.error("Failed to update service scale:", error);
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || (error.response?.status ? `Server error (${error.response.status})` : null)
        || error.message 
        || "Failed to update service scale";
      showErrorToast(errorMessage, theme);
    } finally {
      removeLoadingComponent();
    }
  };

  const handleRecreateService = (serviceId: string, serviceName: string) => {
    Alert.alert(
      "Recreate Service",
      `Are you sure you want to recreate service "${serviceName}"? This will recreate all service tasks and clean up failed/orphaned containers. This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Recreate",
          style: "destructive",
          onPress: async () => {
            try {
              addLoadingComponent();
              const payload = {
                endpointId: selectedEndpointId,
                swarmId: String(selectedSwarmId),
                serviceId: serviceId,
              };
              await recreateService(payload);
              showSuccessToast(`Service "${serviceName}" is being recreated. Tasks will be recreated gradually.`, theme);
              await fetchServices();
            } catch (error: any) {
              console.error("Failed to recreate service:", error);
              const errorMessage = error.message 
                || error.response?.data?.message 
                || error.response?.data?.error 
                || (error.response?.status ? `Server error (${error.response.status})` : null)
                || "Failed to recreate service";
              showErrorToast(errorMessage, theme);
            } finally {
              removeLoadingComponent();
            }
          },
        },
      ]
    );
  };

  const ServiceCard = ({ service }: { service: any }) => {
    const serviceId = service.ID || "Unknown";
    const serviceName = service.Spec?.Name || serviceId.substring(0, 12);
    const labels = service.Spec?.Labels || {};
    const stackName = getStackName(labels);
    const ports = service.Endpoint?.Ports || [];
    const desiredReplicas = service.Spec?.Mode?.Replicated?.Replicas || 0;
    const runningReplicas = serviceTasks[serviceName] || 0;
    const createdAt = formatDate(service.CreatedAt);
    const updatedAt = formatDate(service.UpdatedAt);
    const updateStatus = service.UpdateStatus?.State || null;
    const image = service.Spec?.TaskTemplate?.ContainerSpec?.Image || "N/A";

    const isHealthy = runningReplicas === desiredReplicas && desiredReplicas > 0;
    const statusColor = isHealthy ? "#22c55e" : "#f59e0b";
    const statusIcon = isHealthy ? <CheckCircle2 size={16} color="#22c55e" /> : <AlertCircle size={16} color="#f59e0b" />;

    return (
      <View style={styles.serviceCard}>
        <View style={styles.serviceHeader}>
          <View style={styles.serviceHeaderLeft}>
            <SquareChartGantt size={18} color={styles.primary.color} style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.serviceName}>{serviceName}</Text>
              <Text style={styles.serviceId}>ID: {serviceId.substring(0, 12)}</Text>
            </View>
          </View>
          <View style={styles.serviceStatus}>
            {statusIcon}
          </View>
        </View>

        <View style={styles.serviceDetails}>
          <View style={styles.serviceDetailRow}>
            <Text style={styles.serviceDetailLabel}>Replicas:</Text>
            <Text style={[styles.serviceDetailValue, { color: statusColor }]}>
              {runningReplicas} / {desiredReplicas}
            </Text>
          </View>
          <View style={styles.serviceDetailRow}>
            <Text style={styles.serviceDetailLabel}>Image:</Text>
            <Text style={styles.serviceDetailValue} numberOfLines={1} ellipsizeMode="middle">
              {image}
            </Text>
          </View>
          {stackName && (
            <View style={styles.serviceDetailRow}>
              <Text style={styles.serviceDetailLabel}>Stack:</Text>
              <View style={styles.stackBadge}>
                <Layers size={12} color="#3b82f6" style={{ marginRight: 4 }} />
                <Text style={styles.stackBadgeText}>{stackName}</Text>
              </View>
            </View>
          )}
          {ports.length > 0 && (
            <View style={styles.serviceDetailRow}>
              <Text style={styles.serviceDetailLabel}>Ports:</Text>
              <Text style={styles.serviceDetailValue} numberOfLines={2}>
                {formatPorts(ports)}
              </Text>
            </View>
          )}
          {updateStatus && (
            <View style={styles.serviceDetailRow}>
              <Text style={styles.serviceDetailLabel}>Update Status:</Text>
              <Text style={styles.serviceDetailValue}>{updateStatus}</Text>
            </View>
          )}
          <View style={styles.serviceDetailRow}>
            <Text style={styles.serviceDetailLabel}>Created:</Text>
            <Text style={styles.serviceDetailValue}>{createdAt}</Text>
          </View>
          <View style={styles.serviceDetailRow}>
            <Text style={styles.serviceDetailLabel}>Updated:</Text>
            <Text style={styles.serviceDetailValue}>{updatedAt}</Text>
          </View>
        </View>

        <View style={styles.actionButtonsContainer}>
          <Pressable
            style={[styles.actionButton, styles.scaleButton]}
            onPress={() => openScaleModal(serviceId, serviceName, desiredReplicas)}
          >
            <ArrowUpDown size={14} color="#3b82f6" style={{ marginRight: 6 }} />
            <Text style={styles.scaleButtonText}>Scale</Text>
          </Pressable>
          
          <Pressable
            style={[styles.actionButton, styles.recreateButton]}
            onPress={() => handleRecreateService(serviceId, serviceName)}
          >
            <RefreshCw size={14} color="#f59e0b" style={{ marginRight: 6 }} />
            <Text style={styles.recreateButtonText}>Recreate</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]} contentContainerStyle={{ paddingBottom: insets.bottom }}>
      <AppHeader navigation={navigation} screen="services" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && services.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme === 'light' ? '#333' : '#fff'} />
          </View>
        ) : services.length === 0 ? (
          <View style={styles.emptyContainer}>
            <SquareChartGantt size={48} color={theme === 'light' ? '#9ca3af' : '#6b7280'} />
            <Text style={styles.emptyText}>No services found</Text>
          </View>
        ) : (
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Services Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Services:</Text>
                <Text style={styles.summaryValue}>{services.length}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Healthy:</Text>
                <Text style={[styles.summaryValue, { color: "#22c55e" }]}>
                  {services.filter((s: any) => {
                    const svcName = s.Spec?.Name;
                    const running = serviceTasks[svcName] || 0;
                    const desired = s.Spec?.Mode?.Replicated?.Replicas || 0;
                    return running === desired && desired > 0;
                  }).length}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>In Stack:</Text>
                <Text style={styles.summaryValue}>
                  {services.filter((s: any) => {
                    const labels = s.Spec?.Labels || {};
                    return labels['com.docker.stack.namespace'] || labels['com.docker.compose.project'];
                  }).length}
                </Text>
              </View>
            </View>

            {services.map((service, index) => (
              <ServiceCard key={service.ID || index} service={service} />
            ))}
          </>
        )}
      </ScrollView>
      <Footer navigation={navigation} activeTab="Services" />
      
      {/* Scale Modal */}
      <Modal
        visible={scaleModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeScaleModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Service Scale</Text>
              <Pressable onPress={closeScaleModal} style={styles.modalCloseButton}>
                <X size={20} color={theme === 'light' ? '#111827' : '#fff'} />
              </Pressable>
            </View>
            
            {selectedService && (
              <>
                <Text style={styles.modalLabel}>Service: {selectedService.name}</Text>
                <Text style={styles.modalLabel}>Current replicas: {selectedService.replicas}</Text>
                <Text style={styles.modalLabel}>New number of replicas:</Text>
                <TextInput
                  style={styles.modalInput}
                  value={replicasInput}
                  onChangeText={setReplicasInput}
                  keyboardType="numeric"
                  placeholder="Enter number of replicas"
                  placeholderTextColor={theme === 'light' ? '#9ca3af' : '#6b7280'}
                  autoFocus
                />
                
                <View style={styles.modalButtons}>
                  <Pressable
                    style={[styles.modalButton, styles.modalButtonCancel]}
                    onPress={closeScaleModal}
                  >
                    <Text style={styles.modalButtonCancelText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.modalButton, styles.modalButtonUpdate]}
                    onPress={handleScaleUpdate}
                  >
                    <Text style={styles.modalButtonUpdateText}>Update</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    serviceCard: {
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
    serviceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    serviceHeaderLeft: {
      flexDirection: 'row',
      flex: 1,
      alignItems: 'flex-start',
    },
    serviceName: {
      fontSize: 16,
      fontWeight: '600',
      color: isLight ? '#111827' : '#fff',
      marginBottom: 4,
    },
    serviceId: {
      fontSize: 12,
      color: isLight ? '#6b7280' : '#9ca3af',
    },
    serviceStatus: {
      marginLeft: 12,
    },
    serviceDetails: {
      marginBottom: 12,
    },
    serviceDetailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 4,
    },
    serviceDetailLabel: {
      fontSize: 13,
      color: isLight ? '#6b7280' : '#a1a1aa',
      width: 100,
    },
    serviceDetailValue: {
      fontSize: 13,
      fontWeight: '500',
      color: isLight ? '#111827' : '#fff',
      flex: 1,
      textAlign: 'right',
    },
    stackBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isLight ? '#dbeafe' : '#1e3a8a',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    stackBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: isLight ? '#1e40af' : '#60a5fa',
    },
    actionButtonsContainer: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 8,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 12,
      flex: 1,
    },
    scaleButton: {
      backgroundColor: isLight ? '#dbeafe' : '#1e3a8a',
      borderColor: isLight ? '#bfdbfe' : '#1e40af',
    },
    scaleButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: isLight ? '#1e40af' : '#60a5fa',
    },
    recreateButton: {
      backgroundColor: isLight ? '#fef3c7' : '#78350f',
      borderColor: isLight ? '#fde68a' : '#92400e',
    },
    recreateButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: isLight ? '#92400e' : '#fbbf24',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: isLight ? '#ffffff' : '#1a1a1e',
      borderRadius: 12,
      padding: 20,
      width: '90%',
      maxWidth: 400,
      borderWidth: isLight ? 1 : 0,
      borderColor: isLight ? '#e5e7eb' : 'transparent',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isLight ? '#111827' : '#fff',
    },
    modalCloseButton: {
      padding: 4,
    },
    modalLabel: {
      fontSize: 14,
      color: isLight ? '#6b7280' : '#a1a1aa',
      marginBottom: 8,
    },
    modalInput: {
      backgroundColor: isLight ? '#f3f4f6' : '#2a2a2e',
      borderWidth: 1,
      borderColor: isLight ? '#e5e7eb' : '#3a3a3e',
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: isLight ? '#111827' : '#fff',
      marginBottom: 20,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    modalButtonCancel: {
      backgroundColor: isLight ? '#f3f4f6' : '#2a2a2e',
      borderWidth: 1,
      borderColor: isLight ? '#e5e7eb' : '#3a3a3e',
    },
    modalButtonCancelText: {
      fontSize: 14,
      fontWeight: '600',
      color: isLight ? '#111827' : '#fff',
    },
    modalButtonUpdate: {
      backgroundColor: isLight ? '#3b82f6' : '#1e40af',
    },
    modalButtonUpdateText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#fff',
    },
    primary: { color: '#3b82f6' },
    secondary: { color: '#6b7280' },
  });
};

export default ServicesScreen;

