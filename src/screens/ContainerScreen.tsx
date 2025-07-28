
import { StyleSheet, View } from "react-native";

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
       <Containers navigation={navigation} onRefresh={onRefresh} refreshing={refreshing} containers={containers} />
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
  });
};

export default ContainersScreen;