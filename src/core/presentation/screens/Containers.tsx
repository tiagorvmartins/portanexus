
import { StyleSheet, ScrollView, View, FlatList } from "react-native";
import AppHeader from "src/core/presentation/components/AppHeader";
import { useGetSettingsContext } from "src/settings/store/useSettingsContext";
import Containers from "src/containers/presentation/components/Containers";
import { observer } from "mobx-react";
import { withProviders } from "src/utils/withProviders";
import { GetAllContainersStoreProvider, GetSingleContainersStoreProvider } from "src/containers/presentation/stores/GetContainersStore/GetContainersStoreProvider";
import ContainerHeader from "src/containers/presentation/components/ContainerHeader";
import { useAuthContext } from "src/core/stores/auth/useAuthContext";
import { useCallback, useEffect, useState } from "react";
import { useGetLoadingContext } from "src/loading/store/useLoadingContext";
import { GetExitedContainersStoreProvider, GetRunningContainersStoreProvider } from "src/containers/presentation/stores/GetContainersStore/GetContainersStoreProvider";
import { useGetAllContainersStore, useGetExitedContainersStore, useGetRunningContainersStore } from "src/containers/presentation/stores/GetContainersStore/useGetContainersStore";
import { useGetEndpointsStore } from "src/endpoints/presentation/stores/GetContainersStore/useGetEndpointsStore";
import showErrorToast from "src/utils/toast";
import { useFocusEffect } from '@react-navigation/native';
import Footer from "../components/Footer";

const ContainersScreen = observer(({navigation}: any) => {  
  const getLoadingContext = useGetLoadingContext();
  const getSettingsContext = useGetSettingsContext();
  const { theme } = getSettingsContext;

  const styles = createStyles(theme);
  const authContext = useAuthContext();

  const getRunningContainersStore = useGetRunningContainersStore();
  const getExitedContainersStore = useGetExitedContainersStore();
  const getAllContainersStore = useGetAllContainersStore();
  const getEndpointsStore = useGetEndpointsStore();

  const [refreshing, setRefreshing] = useState(false);

  const fetchRunningContainers = async () => {
    try {
      getLoadingContext.addLoadingComponent();
      const runningPayload: Record<string, any> = { 
        status: ["running"]
      }
      getRunningContainersStore.mergeFilters(runningPayload);
      await getRunningContainersStore.getContainers(getEndpointsStore.selectedEndpoint);
    } catch {
      showErrorToast("There was an error fetching running containers", theme)
    } finally {
      getLoadingContext.removeLoadingComponent();
    }
  };

  const fetchExitedContainers = async () => {
    try {
      getLoadingContext.addLoadingComponent();
      const exitedPayload: Record<string, any> = { 
        status: ["exited"],
      }
      getExitedContainersStore.mergeFilters(exitedPayload);
      await getExitedContainersStore.getContainers(getEndpointsStore.selectedEndpoint);
    } catch {
      showErrorToast("There was an error fetching exited containers", theme)
    } finally {
      getLoadingContext.removeLoadingComponent();
    }
  };

  const fetchContainers = async () => {
    try {
      getLoadingContext.addLoadingComponent();
      await getAllContainersStore.getContainers(getEndpointsStore.selectedEndpoint);
    } catch {
      showErrorToast("There was an error fetching stacks containers", theme)
    } finally {
      getLoadingContext.removeLoadingComponent();
    }
  };

  const fetchEndpoints = async () => {
    try {
      getLoadingContext.addLoadingComponent();
      await getEndpointsStore.getEndpoints();
    } catch {
      showErrorToast("There was an error fetching exited endpoints", theme)
    } finally {
      getLoadingContext.removeLoadingComponent();
    }
  };

  const onRefresh = async () => {
    getLoadingContext.addLoadingComponent();
    setRefreshing(true);
    if(authContext.isLoggedIn){
      await Promise.all([
        fetchEndpoints(),
        fetchRunningContainers(),
        fetchExitedContainers(),
        fetchContainers()
      ])
    }
    setRefreshing(false);
    getLoadingContext.removeLoadingComponent();
  };

  useEffect(() => {
    if(!authContext.isLoggedIn) {
      navigation.replace('Login');
    }
  }, [authContext.isLoggedIn, navigation]);

  useEffect(() => {
    if(authContext.isLoggedIn){
      fetchContainers();
      fetchRunningContainers();
      fetchExitedContainers();
    }
  }, [authContext.isLoggedIn, getEndpointsStore.selectedEndpoint]);

  useFocusEffect(
    useCallback(() => {
      if (authContext.isLoggedIn) {
        onRefresh();
      }
    }, [authContext.isLoggedIn])
  );


  return (
    <View style={styles.container} >
       <AppHeader navigation={navigation} screen="containers" />
       <ContainerHeader />
       <Containers navigation={navigation} onRefresh={onRefresh} refreshing={refreshing} />
      <Footer />
    </View>
  );
});

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

export default withProviders(
    GetAllContainersStoreProvider, 
    GetSingleContainersStoreProvider,
    GetRunningContainersStoreProvider, 
    GetExitedContainersStoreProvider)(ContainersScreen);