
import { Platform, StyleSheet, TextInput, TouchableOpacity, View, Text, Pressable, ViewStyle } from "react-native";

import { useCallback, useEffect, useState } from "react";
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

const ContainersScreen = ({navigation}: any) => {
  const { addLoadingComponent, removeLoadingComponent } = useLoading();
  
  
  const { theme } = useAuth()
  const styles = createStyles(theme);

  const { fetchContainers, countContainersRunning, containers, count, countRunning } = useContainer();
  const { selectedEndpointId, fetchEndpoints } = useEndpoints();

  const [refreshing, setRefreshing] = useState(false);
  const [filterByContainerName, setFilterByContainerName] = useState<string>("");

  const fetchRunningContainers = async () => {
    try {
      addLoadingComponent();
      const runningPayload: Record<string, any> = { 
        status: ["running"]
      }
      await countContainersRunning({ filters: runningPayload, endpointId: selectedEndpointId });
    } catch {
      showErrorToast("There was an error fetching running containers", theme)
    } finally {
      removeLoadingComponent();
    }
  };

  const getAllContainers = async () => {
    try {
      addLoadingComponent();
      await fetchContainers({ endpointId: selectedEndpointId, filters: {}});
    } catch {
      showErrorToast("There was an error fetching stacks containers", theme)
    } finally {
      removeLoadingComponent();
    }
  };

  const getEndpoints = async () => {
    try {
      addLoadingComponent();
      await fetchEndpoints();
    } catch {
      showErrorToast("There was an error fetching exited endpoints", theme)
    } finally {
      removeLoadingComponent();
    }
  };

  const onRefresh = async () => {
    addLoadingComponent();
    setRefreshing(true);    
    await Promise.all([
      getEndpoints(),
      fetchRunningContainers(),
      getAllContainers()
    ])
    setRefreshing(false);
    removeLoadingComponent();
  };

  useEffect(() => {
      getAllContainers();
      fetchRunningContainers();
  }, [ selectedEndpointId]);

  useFocusEffect(
    useCallback(() => {
        onRefresh();
    }, []) 
  );

  return (
    <View style={styles.container} >
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
      <Footer />
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