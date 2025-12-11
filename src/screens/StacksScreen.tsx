import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, Pressable, StyleSheet, TextInput, View, ViewStyle, Text } from "react-native";
import { useCallback, useEffect, useState, useRef } from "react";
import { showErrorToast } from "src/utils/toast";
import { useFocusEffect } from '@react-navigation/native';
import { useLoading } from "src/store/useLoading";
import { useAuth } from "src/store/useAuth";
import { useEndpoints } from "src/store/useEndpoints";
import { useStacks } from "src/store/useStacks";

import ContainerHeader from "src/components/ContainerHeader";
import Stacks from "src/features/stacks/Stacks";
import AppHeader from "src/components/AppHeader";
import Footer from "src/components/Footer";


const StacksScreen = ({navigation}: any) => {

  const { addLoadingComponent, removeLoadingComponent } = useLoading();
  const { isLoggedIn, theme } = useAuth();
  
  const styles = createStyles(theme);

  const { stacksRunning, stacksStopped, fetchStacks, clearStacksState } = useStacks();
  const { selectedEndpointId, selectedSwarmId, fetchEndpoints, endpoints } = useEndpoints();

  const [refreshing, setRefreshing] = useState(false);
  const [filterByStackName, setFilterByStackName] = useState<string>("");
  
  // Track if we've refreshed on focus to prevent duplicate fetches
  const hasRefreshedOnFocusRef = useRef(false);
  const lastEndpointRef = useRef(selectedEndpointId);
  
  // Store latest functions in refs to avoid recreating callbacks
  const addLoadingRef = useRef(addLoadingComponent);
  const removeLoadingRef = useRef(removeLoadingComponent);
  const fetchEndpointsRef = useRef(fetchEndpoints);
  const fetchStacksRef = useRef(fetchStacks);
  const clearStacksStateRef = useRef(clearStacksState);
  
  // Update refs on each render
  addLoadingRef.current = addLoadingComponent;
  removeLoadingRef.current = removeLoadingComponent;
  fetchEndpointsRef.current = fetchEndpoints;
  fetchStacksRef.current = fetchStacks;
  clearStacksStateRef.current = clearStacksState;

  const fetchStacksFn = useCallback(async () => {
    if (selectedEndpointId === -1) {
      return;
    }
    
    // Check if the endpoint is a swarm endpoint
    const selectedEndpoint = endpoints.find(e => Number(e.Id) === selectedEndpointId);
    const isSwarm = selectedEndpoint?.IsSwarm ?? false;
    
    // Use swarmId if endpoint is a swarm
    // Priority: selectedSwarmId > endpoint.SwarmId > 0
    // SwarmId is a Docker Swarm cluster ID (string hash), not a number
    let swarmIdToUse: string | number = 0;
    if (isSwarm) {
      if (selectedSwarmId && selectedSwarmId !== 0 && selectedSwarmId !== '0') {
        // Convert to string if it's a number, otherwise use as-is
        swarmIdToUse = typeof selectedSwarmId === 'string' ? selectedSwarmId : String(selectedSwarmId);
      } else if (selectedEndpoint?.SwarmId) {
        // endpoint.SwarmId is always a string (Docker Swarm cluster ID)
        swarmIdToUse = selectedEndpoint.SwarmId;
      }
    }
    
    try {
      await fetchStacksRef.current({ endpointId: selectedEndpointId, filters: {}, swarmId: swarmIdToUse });
    } catch {
      showErrorToast("There was an error fetching stacks", theme)
    }
  }, [selectedEndpointId, selectedSwarmId, endpoints, theme]);

  const performRefresh = useCallback(async () => {
    if (selectedEndpointId === -1) {
      return;
    }
    
    addLoadingRef.current();
    setRefreshing(true);
    
    try {
      if(isLoggedIn){
        await Promise.all([
          fetchEndpointsRef.current(),
          fetchStacksFn(),
        ]);
      }
    } finally {
      setRefreshing(false);
      removeLoadingRef.current();
    }
  }, [selectedEndpointId, isLoggedIn, fetchStacksFn]);

  const onRefresh = useCallback(() => {
    performRefresh();
  }, [performRefresh]);

  // Handle endpoint/swarm changes - clear and refetch
  useEffect(() => {
    if (selectedEndpointId === -1) {
      return;
    }
    
    // Check if endpoint actually changed
    if (lastEndpointRef.current !== selectedEndpointId) {
      lastEndpointRef.current = selectedEndpointId;
      
      // Reset focus ref when endpoint changes
      hasRefreshedOnFocusRef.current = false;
      
      // Clear stacks immediately when endpoint changes to show empty state while loading
      clearStacksStateRef.current();
      
      // Block loading until stacks are fetched
      addLoadingRef.current();
      
      fetchStacksFn().finally(() => {
        removeLoadingRef.current();
      });
    }
  }, [selectedEndpointId, selectedSwarmId, fetchStacksFn]);

  useEffect(() => {
    if(!isLoggedIn) {
      navigation.replace('Login');
    }
  }, [isLoggedIn, navigation]);

  // Only refresh on focus if we haven't already, and not immediately after endpoint change
  const performRefreshRef = useRef(performRefresh);
  performRefreshRef.current = performRefresh;

  useFocusEffect(
    useCallback(() => {
      if (!isLoggedIn || selectedEndpointId === -1) {
        return;
      }
      
      // Only refresh if we haven't already, and endpoint hasn't changed
      if (!hasRefreshedOnFocusRef.current && lastEndpointRef.current === selectedEndpointId) {
        hasRefreshedOnFocusRef.current = true;
        performRefreshRef.current();
      }
      
      // Reset ref when screen loses focus (cleanup)
      return () => {
        // Don't reset if endpoint changed (let the endpoint effect handle it)
        if (lastEndpointRef.current === selectedEndpointId) {
          hasRefreshedOnFocusRef.current = false;
        }
      };
    }, [isLoggedIn, selectedEndpointId])
  );

  const insets = useSafeAreaInsets();

  return (
      <View style={[styles.container, {paddingTop: insets.top, paddingBottom: insets.bottom }]}>
       <AppHeader navigation={navigation} screen="stacks" />
       <ContainerHeader running={stacksRunning} exited={stacksStopped} activeLabel="Stacks Running" inactiveLabel="Stacks Inactive" />
       <View style={styles.inputContainer}>
          <TextInput
            multiline={Platform.OS === "web" ? false : true}
            placeholder="Filter by stack name..."
            onChangeText={(text: string) => {
              setFilterByStackName(text.replace(/\s/g, ""));
            }}
            placeholderTextColor={
              theme === "light"
                ? "rgba(51, 51, 51, 0.5)"
                : "rgba(224, 224, 224, 0.5)"
            }
            value={filterByStackName}
            style={styles.input}
          />

          <Pressable
            onPress={() => setFilterByStackName("")}
            style={({ pressed }): ViewStyle[] => [
              styles.clearButton,
              pressed ? styles.clearButtonPressed : styles.clearButton,
            ]}
          >
            <Text style={styles.clearText}>✕</Text>
          </Pressable>
          
       </View>
       <Stacks navigation={navigation} filterByStackName={filterByStackName} refreshing={refreshing} onRefresh={onRefresh} />
      <Footer navigation={navigation} activeTab="Stacks" />
    </View>
  );
};

const createStyles = (theme: string) => {
  return StyleSheet.create({
    container: {
      backgroundColor: theme === 'light' ? '#f9f9f9' : '#121212',
      flex: 1,
    },
    headerText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme === 'light' ? '#333333' : '#e0e0e0',
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    input: {
      borderWidth: 1,
      borderRadius: 5,
      padding: 24,
      marginLeft: 16,
      marginRight: 16,
      marginBottom: 8,
      borderColor: theme === 'light' ? '#000000' : '#444444',
      shadowColor: theme === 'light' ? '#000000' : '#444444',
      color: theme === 'light' ? '#000000' : '#FFFFFF',
      shadowOpacity: 0.2,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      textAlign: 'center',
      flex: 1,
      paddingVertical: 8,
      fontSize: 16,
    },
    clearButtonPressed: {
      backgroundColor: "#aaa",
      transform: [{ scale: 0.9 }],
    },
    clearButton: {
      marginRight: 16,
      marginBottom: 8,
      backgroundColor: "#e0e0e0",
      borderRadius: 12,
      paddingHorizontal: 6,
      paddingVertical: 2,
      justifyContent: "center",
      alignItems: "center",

      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 2,
      shadowOffset: { width: 0, height: 1 },
      elevation: 2,
    },
    clearText: {
      fontSize: 14,
      fontWeight: "bold",
      color: "#333",
    },
  });
};

export default StacksScreen;
