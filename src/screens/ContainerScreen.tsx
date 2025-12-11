
import { Platform, StyleSheet, TextInput, TouchableOpacity, View, Text, Pressable, ViewStyle } from "react-native";

import { useCallback, useEffect, useState, useRef } from "react";
import { showErrorToast } from "src/utils/toast";
import { useFocusEffect } from '@react-navigation/native';

import { useLoading } from "src/store/useLoading";
import { useAuth } from "src/store/useAuth";
import { useContainer } from "src/store/useContainer";
import { useEndpoints } from "src/store/useEndpoints";
import Footer from "../components/Footer";
import AppHeader from "src/components/AppHeader";
import Containers from "src/features/container/Containers";
import ContainerHeader from "src/components/ContainerHeader";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ContainersScreen = ({navigation}: any) => {
  const { addLoadingComponent, removeLoadingComponent } = useLoading();
  
  
  const { theme } = useAuth()
  const styles = createStyles(theme);

  const { fetchContainers, countContainersRunning, containers, count, countRunning, clearContainerState } = useContainer();
  const { selectedEndpointId, fetchEndpoints } = useEndpoints();

  const [refreshing, setRefreshing] = useState(false);
  const [filterByContainerName, setFilterByContainerName] = useState<string>("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasRefreshedOnFocusRef = useRef(false);

  // Store latest values in refs to avoid recreating callbacks
  const selectedEndpointIdRef = useRef(selectedEndpointId);
  const addLoadingRef = useRef(addLoadingComponent);
  const removeLoadingRef = useRef(removeLoadingComponent);
  const fetchEndpointsRef = useRef(fetchEndpoints);
  const countContainersRunningRef = useRef(countContainersRunning);
  const fetchContainersRef = useRef(fetchContainers);
  const clearContainerStateRef = useRef(clearContainerState);
  const setRefreshingRef = useRef(setRefreshing);
  const setIsInitialLoadRef = useRef(setIsInitialLoad);

  // Update refs on each render
  selectedEndpointIdRef.current = selectedEndpointId;
  addLoadingRef.current = addLoadingComponent;
  removeLoadingRef.current = removeLoadingComponent;
  fetchEndpointsRef.current = fetchEndpoints;
  countContainersRunningRef.current = countContainersRunning;
  fetchContainersRef.current = fetchContainers;
  clearContainerStateRef.current = clearContainerState;
  setRefreshingRef.current = setRefreshing;
  setIsInitialLoadRef.current = setIsInitialLoad;

  const performRefresh = useCallback(async () => {
    const endpointId = selectedEndpointIdRef.current;
    if (endpointId === -1) {
      return;
    }
    addLoadingRef.current();
    setRefreshingRef.current(true);    
    try {
      const runningPayload: Record<string, any> = { 
        status: ["running"]
      }
      await Promise.all([
        fetchEndpointsRef.current(),
        countContainersRunningRef.current({ filters: runningPayload, endpointId }),
        fetchContainersRef.current({ endpointId, filters: {}})
      ]);
    } catch (err) {
      // Errors are handled in individual functions
    } finally {
      setRefreshingRef.current(false);
      removeLoadingRef.current();
      setIsInitialLoadRef.current(false);
    }
  }, []); // Empty deps - use refs for all values

  const onRefresh = useCallback(() => {
    performRefresh();
  }, [performRefresh]);

  useEffect(() => {
    if (selectedEndpointId === -1) {
      return;
    }
    
    // Reset focus ref when endpoint changes
    hasRefreshedOnFocusRef.current = false;
    
    // Clear containers immediately when endpoint changes to show empty state while loading
    clearContainerStateRef.current();
    setIsInitialLoadRef.current(true);
    
    // Block loading until all data is fetched
    addLoadingRef.current();
    
    // Fetch containers for the new endpoint
    const runningPayload: Record<string, any> = { 
      status: ["running"]
    }
    Promise.all([
      countContainersRunningRef.current({ filters: runningPayload, endpointId: selectedEndpointId }),
      fetchContainersRef.current({ endpointId: selectedEndpointId, filters: {}})
    ]).finally(() => {
      removeLoadingRef.current();
      setIsInitialLoadRef.current(false);
    });
  }, [selectedEndpointId]); // Only depend on selectedEndpointId

  const performRefreshRef = useRef(performRefresh);
  performRefreshRef.current = performRefresh;

  useFocusEffect(
    useCallback(() => {
        const endpointId = selectedEndpointIdRef.current;
        if (endpointId !== -1 && !hasRefreshedOnFocusRef.current) {
          hasRefreshedOnFocusRef.current = true;
          // Use the ref function directly to avoid dependency issues
          performRefreshRef.current();
        }
        // Reset ref when screen loses focus (cleanup)
        return () => {
          hasRefreshedOnFocusRef.current = false;
        };
    }, []) // Empty deps - use refs for everything
  );

  const insets = useSafeAreaInsets();

  return (
      <View style={[styles.container, {paddingTop: insets.top }]} contentContainerStyle={{ paddingBottom: insets.bottom }}>
       <AppHeader navigation={navigation} screen="containers" />
       <ContainerHeader running={countRunning} exited={count-countRunning} activeLabel="Containers Running" inactiveLabel="Containers Inactive" />
       <View style={styles.inputContainer}>
          <TextInput
            multiline={Platform.OS === "web" ? false : true}
            placeholder="Filter by container name..."
            onChangeText={(text: string) => {
              setFilterByContainerName(text.replace(/\s/g, ""));
            }}
            placeholderTextColor={
              theme === "light"
                ? "rgba(51, 51, 51, 0.5)"
                : "rgba(224, 224, 224, 0.5)"
            }
            value={filterByContainerName}
            style={styles.input}
          />

          <Pressable
            onPress={() => setFilterByContainerName("")}
            style={({ pressed }): ViewStyle[] => [
              styles.clearButton,
              pressed ? styles.clearButtonPressed : styles.clearButton,
            ]}
          >
            <Text style={styles.clearText}>✕</Text>
          </Pressable>
          
       </View>
       <Containers navigation={navigation} onRefresh={onRefresh} filterByContainerName={filterByContainerName} refreshing={refreshing} containers={containers} />
      <Footer navigation={navigation} activeTab="Containers" />
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

export default ContainersScreen;