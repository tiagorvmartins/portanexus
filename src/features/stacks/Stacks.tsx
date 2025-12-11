import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { StyleSheet, FlatList, Platform } from "react-native";
import { RefreshControl as NativeRefreshControl } from 'react-native';
import { RefreshControl as WebRefreshControl } from 'react-native-web-refresh-control';
import Stack from "./Stack";
import StackEntity from "src/features/stacks/StackEntity";
import { useStacks } from "src/store/useStacks";
import { useAuth } from "src/store/useAuth";
import { useEndpoints } from "src/store/useEndpoints";
import ContainerEntity from "src/types/ContainerEntity";
import { useContainer } from "src/store/useContainer";
import { getSwarmServices, getSwarmTasks } from "src/features/swarm/swarmAPI";
import GetSwarmPayload from "src/features/swarm/GetSwarmPayload";


const RefreshControl = Platform.OS === 'web' ? WebRefreshControl : NativeRefreshControl;

const Stacks = ({filterByStackName, navigation, refreshing, onRefresh }: any) => {
  const { theme, stackOrderBy, getStackOrderBy } = useAuth()
  const styles = createStyles(theme);

  const { stacks: fetchedStacks, fetchStack } = useStacks()
  const { selectedEndpointId, selectedSwarmId, endpoints } = useEndpoints()
  const { fetchContainers, containers } = useContainer();
  const [ isLoading, setIsLoading ] = useState(false)
  
  // For swarm stacks, we store tasks converted to container-like format
  const [swarmTasks, setSwarmTasks] = useState<Record<string, ContainerEntity[]>>({});
  
  // Track which stacks we've already fetched containers/tasks for to prevent duplicate fetches
  const fetchedContainersForStacksRef = useRef<Set<string>>(new Set());
  const lastEndpointRef = useRef<number>(-1);
  
  // Use a ref to track if we're currently fetching to prevent duplicate fetches
  const isFetchingRef = useRef(false);

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        await getStackOrderBy();
      } catch (err) {
        console.error("[Stacks] Error loading preferences:", err);
      }
    };
    loadPreferences();
  }, [getStackOrderBy]);

  // Memoize the selected endpoint to prevent unnecessary re-renders
  const selectedEndpoint = useMemo(() => {
    return endpoints.find(e => Number(e.Id) === selectedEndpointId);
  }, [endpoints, selectedEndpointId]);
  
  const isSwarm = selectedEndpoint?.IsSwarm ?? false;

  // Clear local state when endpoint changes
  useEffect(() => {
    if (selectedEndpointId === -1) {
      return;
    }
    
    // Check if endpoint actually changed
    if (lastEndpointRef.current !== selectedEndpointId) {
      lastEndpointRef.current = selectedEndpointId;
      
      // Clear all local state when endpoint changes
      fetchedContainersForStacksRef.current.clear();
      setSwarmTasks({});
      isFetchingRef.current = false;
    }
  }, [selectedEndpointId]);

  // Clear cache when refreshing
  useEffect(() => {
    if (refreshing) {
      fetchedContainersForStacksRef.current.clear();
      setSwarmTasks({});
      isFetchingRef.current = false;
    }
  }, [refreshing]);

  // Use a ref to store fetchContainers to avoid it being a dependency
  const fetchContainersRef = useRef(fetchContainers);
  useEffect(() => {
    fetchContainersRef.current = fetchContainers;
  }, [fetchContainers]);

  // Fetch containers/tasks for stacks when stacks are available
  useEffect(() => {
    // Only run if we have stacks and haven't already processed this exact set
    if (fetchedStacks.length === 0 || selectedEndpointId === -1 || isFetchingRef.current) {
      return;
    }
    
    // Create a stable key from stack IDs (sorted for consistency)
    const stackIds = fetchedStacks.map(s => s.Id).sort().join(',');
    const stacksKey = `${selectedEndpointId}-${selectedSwarmId}-${stackIds}`;
    
    // Only fetch if we haven't fetched for this exact combination of stacks/endpoint
    // OR if we're currently refreshing (to force re-fetch)
    if (!fetchedContainersForStacksRef.current.has(stacksKey) || refreshing) {
      // Mark as fetching immediately to prevent duplicate fetches
      isFetchingRef.current = true;
      if (!refreshing) {
        fetchedContainersForStacksRef.current.add(stacksKey);
      }
      
      // Check if selectedSwarmId is valid (not NaN, not '0', not 0)
      const isValidSwarmId = selectedSwarmId && 
                             selectedSwarmId !== '0' && 
                             selectedSwarmId !== 0 && 
                             String(selectedSwarmId) !== 'NaN' &&
                             !(typeof selectedSwarmId === 'number' && isNaN(selectedSwarmId));
      
      if (isSwarm && isValidSwarmId) {
        // For swarm: fetch services, then tasks for services in each stack
        const swarmIdString = typeof selectedSwarmId === 'string' ? selectedSwarmId : String(selectedSwarmId);
        const swarmPayload: GetSwarmPayload = {
          endpointId: selectedEndpointId,
          swarmId: swarmIdString,
        };
        
        // Fetch all services and tasks once
        Promise.all([
          getSwarmServices(swarmPayload),
          getSwarmTasks(swarmPayload),
        ]).then(([servicesResponse, tasksResponse]) => {
          const services = servicesResponse.results || [];
          const allTasks = tasksResponse.results || [];
          
          // Group tasks by stack namespace
          const tasksByStack: Record<string, ContainerEntity[]> = {};
          
          fetchedStacks.forEach(stack => {
            // Find services that belong to this stack
            const stackServices = services.filter((svc: any) => {
              const namespace = svc.Spec?.Labels?.['com.docker.stack.namespace'];
              return namespace === stack.Name;
            });
            
            // Get all tasks for services in this stack
            const stackTasks: ContainerEntity[] = [];
            stackServices.forEach((svc: any) => {
              const serviceName = svc.Spec?.Name;
              const serviceId = svc.ID;
              if (serviceName) {
                const serviceTasks = allTasks.filter((task: any) => {
                  // Match by full service ID or short ID
                  const taskServiceId = task.ServiceID;
                  return taskServiceId === serviceId || 
                         (taskServiceId && serviceId && taskServiceId.startsWith(serviceId.substring(0, 12))) ||
                         (serviceId && taskServiceId && serviceId.startsWith(taskServiceId.substring(0, 12)));
                });
                // Convert tasks to container-like format
                serviceTasks.forEach((task: any) => {
                  stackTasks.push({
                    Id: task.ID?.substring(0, 12) || task.ID || 0, // Use short ID
                    Names: [task.Name || task.ID?.substring(0, 12) || ''],
                    State: task.Status?.State || 'unknown',
                    Status: task.Status?.State || 'unknown',
                    Created: task.CreatedAt || '',
                  } as ContainerEntity);
                });
              }
            });
            
            tasksByStack[stack.Name] = stackTasks;
          });
          
          // Update swarm tasks
          setSwarmTasks(tasksByStack);
          
          // Update cache after successful fetch
          const currentStackIds = fetchedStacks.map(s => s.Id).sort().join(',');
          const currentStacksKey = `${selectedEndpointId}-${selectedSwarmId}-${currentStackIds}`;
          fetchedContainersForStacksRef.current.add(currentStacksKey);
          isFetchingRef.current = false;
        }).catch(err => {
          console.error("[Stacks] Error fetching swarm services/tasks for stacks:", err);
          // Remove from cache on error so it can be retried
          fetchedContainersForStacksRef.current.delete(stacksKey);
          isFetchingRef.current = false;
        });
      } else {
        // For non-swarm: fetch containers
        const promises = fetchedStacks.map(stack => {
          const filters = { label: [`com.docker.compose.project=${stack.Name}`] };
          return fetchContainersRef.current({ filters, endpointId: selectedEndpointId });
        });
        
        // Fire and forget - don't block UI
        Promise.all(promises).then(() => {
          // Update cache after successful fetch (for non-swarm)
          const currentStackIds = fetchedStacks.map(s => s.Id).sort().join(',');
          const currentStacksKey = `${selectedEndpointId}-${selectedSwarmId}-${currentStackIds}`;
          fetchedContainersForStacksRef.current.add(currentStacksKey);
          isFetchingRef.current = false;
        }).catch(err => {
          console.error("Error fetching containers for stacks:", err);
          // Remove from cache on error so it can be retried
          fetchedContainersForStacksRef.current.delete(stacksKey);
          isFetchingRef.current = false;
        });
      }
    } else {
      isFetchingRef.current = false;
    }
  }, [fetchedStacks, selectedEndpointId, selectedSwarmId, isSwarm, refreshing]);

  // Sync fullStacks with fetchedStacks from Redux
  const [fullStacks, setFullStacks] = useState<StackEntity[]>(fetchedStacks);

  useEffect(() => {
    // Only update if stacks actually changed (prevent unnecessary re-renders)
    setFullStacks(prev => {
      const prevIds = prev.map(s => s.Id).sort().join(',');
      const newIds = fetchedStacks.map(s => s.Id).sort().join(',');
      if (prevIds !== newIds) {
        return fetchedStacks;
      }
      return prev;
    });
  }, [fetchedStacks]);

  // Apply filtering
  useEffect(() => {
    if (filterByStackName) {
      const filteredContainers = fetchedStacks.filter((p: StackEntity) => 
        p.Name.toLowerCase().includes(filterByStackName.toLowerCase())
      );
      setFullStacks(filteredContainers);
    } else {
      // Reset to all stacks when filter is cleared
      setFullStacks(fetchedStacks);
    }
  }, [filterByStackName, fetchedStacks]);

  // Apply sorting
  useEffect(() => {
    setFullStacks(prev => {
      let sortedData = [...prev];
      switch (stackOrderBy) {
        case "createdDateAsc":
          sortedData.sort((a: StackEntity, b: StackEntity) => a.CreationDate - b.CreationDate);
          break;
        case "createdDateDesc":
          sortedData.sort((a: StackEntity, b: StackEntity) => b.CreationDate - a.CreationDate);
          break;
        case "nameAsc":
          sortedData.sort((a, b) => a.Name.localeCompare(b.Name));
          break;
        case "nameDesc":
          sortedData.sort((a, b) => b.Name.localeCompare(a.Name));
          break;
        default:
          return prev; // No change needed
      }
      return sortedData;
    });
  }, [stackOrderBy]);

  const containersByStack = useMemo(() => {
    const map: Record<string, ContainerEntity[]> = {};
    if (!fetchedStacks || fetchedStacks.length === 0) {
      return map;
    }
    
    // Check if selectedSwarmId is valid (not NaN, not '0', not 0)
    const isValidSwarmId = selectedSwarmId && 
                           selectedSwarmId !== '0' && 
                           selectedSwarmId !== 0 && 
                           String(selectedSwarmId) !== 'NaN' &&
                           !(typeof selectedSwarmId === 'number' && isNaN(selectedSwarmId));
    
    // For swarm stacks, use tasks
    if (isSwarm && isValidSwarmId) {
      // Create a deep copy to ensure React detects the change
      const result: Record<string, ContainerEntity[]> = {};
      Object.keys(swarmTasks).forEach(key => {
        result[key] = [...(swarmTasks[key] || [])];
      });
      return result;
    }
    
    // For non-swarm stacks, use containers
    if (!containers || containers.length === 0) return map;
    
    // Create a set of stack names for faster lookup
    const stackNames = new Set(fetchedStacks.map(s => s.Name));
    
    // Pre-process containers once instead of filtering for each stack
    containers.forEach((c: any) => {
      const names = (c?.Names || []) as string[];
      const labels = (c?.Labels || {}) as Record<string, string>;
      const composeProject = labels?.["com.docker.compose.project"];
      const stackNamespace = labels?.["com.docker.stack.namespace"];
      
      // Check if container belongs to any stack
      if (composeProject && stackNames.has(composeProject)) {
        if (!map[composeProject]) map[composeProject] = [];
        map[composeProject].push(c);
      } else if (stackNamespace && stackNames.has(stackNamespace)) {
        if (!map[stackNamespace]) map[stackNamespace] = [];
        map[stackNamespace].push(c);
      } else {
        // Fallback: check by name fragment (less common, more expensive)
        for (const stackName of stackNames) {
          if (names.some(n => (n || "").includes(stackName))) {
            if (!map[stackName]) map[stackName] = [];
            map[stackName].push(c);
            break; // Only add to first matching stack
          }
        }
      }
    });
    
    return map;
  }, [containers, fetchedStacks, isSwarm, selectedSwarmId, swarmTasks]);

  // Fetch containers/tasks when needed (lazy loading)
  const fetchContainersForStack = useCallback(async (stackName: string, isSwarmStack: boolean) => {
    try {
      // Check if selectedSwarmId is valid (not NaN, not '0', not 0)
      const isValidSwarmId = selectedSwarmId && 
                             selectedSwarmId !== '0' && 
                             selectedSwarmId !== 0 && 
                             String(selectedSwarmId) !== 'NaN' &&
                             !(typeof selectedSwarmId === 'number' && isNaN(selectedSwarmId));
      
      if (isSwarmStack && isValidSwarmId) {
        // For swarm: fetch services and tasks
        const swarmIdString = typeof selectedSwarmId === 'string' ? selectedSwarmId : String(selectedSwarmId);
        const swarmPayload: GetSwarmPayload = {
          endpointId: selectedEndpointId,
          swarmId: swarmIdString,
        };
        
        const [servicesResponse, tasksResponse] = await Promise.all([
          getSwarmServices(swarmPayload),
          getSwarmTasks(swarmPayload),
        ]);
        
        const services = servicesResponse.results || [];
        const allTasks = tasksResponse.results || [];
        
        // Find services that belong to this stack
        const stackServices = services.filter((svc: any) => {
          const namespace = svc.Spec?.Labels?.['com.docker.stack.namespace'];
          return namespace === stackName;
        });
        
        // Get all tasks for services in this stack
        const stackTasks: ContainerEntity[] = [];
        stackServices.forEach((svc: any) => {
          const serviceName = svc.Spec?.Name;
          const serviceId = svc.ID;
          if (serviceName && serviceId) {
            // Match tasks by service ID - handle both full and short IDs
            const serviceTasks = allTasks.filter((task: any) => {
              const taskServiceId = task.ServiceID;
              if (!taskServiceId) return false;
              // Exact match
              if (taskServiceId === serviceId) return true;
              // Match by short ID (first 12 characters)
              const shortServiceId = serviceId.length > 12 ? serviceId.substring(0, 12) : serviceId;
              const shortTaskServiceId = taskServiceId.length > 12 ? taskServiceId.substring(0, 12) : taskServiceId;
              if (shortServiceId === shortTaskServiceId) return true;
              // Match if one starts with the other's short ID
              if (taskServiceId.startsWith(shortServiceId) || serviceId.startsWith(shortTaskServiceId)) return true;
              return false;
            });
            // Convert tasks to container-like format
            serviceTasks.forEach((task: any) => {
              stackTasks.push({
                Id: task.ID?.substring(0, 12) || task.ID || 0,
                Names: [task.Name || task.ID?.substring(0, 12) || ''],
                State: task.Status?.State || 'unknown',
                Status: task.Status?.State || 'unknown',
                Created: task.CreatedAt || '',
              } as ContainerEntity);
            });
          }
        });
        
        // Update swarmTasks for this stack
        setSwarmTasks(prev => ({
          ...prev,
          [stackName]: stackTasks,
        }));
      } else {
        // For non-swarm: fetch containers
        const filters = { label: [`com.docker.compose.project=${stackName}`] };
        await fetchContainers({ filters, endpointId: selectedEndpointId });
      }
    } catch (err) {
      console.error(`Error fetching containers/tasks for stack ${stackName}:`, err);
    }
  }, [selectedEndpointId, selectedSwarmId, fetchContainers]);

  const updateStack = useCallback(async(stackId: number) => {
    const stackFetched: any = await fetchStack({ endpointId: selectedEndpointId, filters: {}, stackId: stackId, swarmId: selectedSwarmId } )
    
    const stackFetchedResult: any = stackFetched.payload
    const selectedEndpoint = endpoints.find(e => Number(e.Id) === selectedEndpointId);
    const isSwarmStack = selectedEndpoint?.IsSwarm ?? false;

    // Refresh containers/tasks for this stack
    await fetchContainersForStack(stackFetchedResult.Name, isSwarmStack);

    if (stackFetched) {
      setFullStacks(prevStacks =>
        prevStacks.map(s => (s.Id === stackFetchedResult.Id ? stackFetchedResult : s))
      );
    }
  }, [selectedEndpointId, selectedSwarmId, endpoints, fetchContainersForStack, fetchStack]);

  return (
      <>
      <FlatList
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          nestedScrollEnabled
          extraData={isSwarm ? Object.keys(swarmTasks).join(',') + Object.values(swarmTasks).flat().length : containers.length}
          data={fullStacks}
          renderItem={({item}) => {
            const stackContainers = containersByStack[item.Name] || [];
            return (
              <Stack 
                navigation={navigation} 
                stackName={item.Name} 
                status={item.Status} 
                stackId={item.Id} 
                creationDate={item.CreationDate} 
                update={updateStack} 
                isLoading={isLoading} 
                containers={stackContainers}
                fetchContainersForStack={() => fetchContainersForStack(item.Name, isSwarm)}
              />
            );
          }}
          keyExtractor={item => item.Id.toString()}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={10}
          style={styles.scrollView}
      />
    </>
  );
};

const createStyles = (theme: string) => {
  return StyleSheet.create({
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 16,
      color: theme === 'light' ? '#333333' : '#e0e0e0',
    },
    container: {
      backgroundColor: theme === 'light' ? '#f9f9f9' : '#121212',
      padding: 16
    },
    headerText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme === 'light' ? '#333333' : '#e0e0e0',
    },
    headerSubText: {
        fontSize: 12,
        color: theme === 'light' ? '#333333' : '#e0e0e0',
    },
    scrollView: {
      flexGrow: 1,
      paddingBottom: 0,
      backgroundColor: theme === 'light' ? '#f9f9f9' : '#121212',      
      marginBottom: 0,
    },
    section: {
      marginBottom: 32
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme === 'light' ? '#333333' : '#e0e0e0',
      marginBottom: 16
    },
    cardsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between'
    },
    card: {
      backgroundColor: theme === 'light' ? '#FFFFFF' : '#1E1E1E', 
      borderColor: theme === 'light' ? '#DDDDDD' : '#444444',
      borderWidth: 1,
      borderRadius: 8,
      padding: 16,
      marginVertical: 8,
      shadowColor: '#000000',
      shadowOpacity: 0.2,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8
    },
    cardHeaderTitle: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8
    },
    cardHeaderOperations: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-evenly',
      marginBottom: 8,
      width: 120,
    },
    dotActive: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: '#00ff00',
      marginRight: 8
    },
    dotInactive: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: '#ff0000',
      marginRight: 8
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme === 'light' ? '#333333' : '#e0e0e0',
    },
    cardStatus: {
      fontSize: 14,
      color: theme === 'light' ? '#333333' : '#e0e0e0',
      marginBottom: 16
    },
    cardActions: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    disabled: {
      color: theme === 'light' ? '#e6e6e6' : '#2e2e2e',
    },
    enabled: {},
    cardActionText: {
      fontSize: 16,
      color: theme === 'light' ? '#007aff' : '#bb86fc'
    }
  });
};


export default Stacks;
