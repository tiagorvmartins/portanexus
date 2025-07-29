
import { StyleSheet, View } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { showErrorToast } from "src/utils/toast";
import { useFocusEffect } from '@react-navigation/native';
import { useLoading } from "src/store/useLoading";
import { useAuth } from "src/store/useAuth";
import { useSettings } from "src/store/useSettings";
import { useContainer } from "src/store/useContainer";
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

  const { stacksRunning, stacksStopped, fetchStacks } = useStacks();
  const { selectedEndpointId, fetchEndpoints } = useEndpoints();

  const [refreshing, setRefreshing] = useState(false);

  const fetchStacksFn = async () => {
    try {
      addLoadingComponent();
      await fetchStacks({ endpointId: selectedEndpointId, filters: {} });
    } catch {
      showErrorToast("There was an error fetching stacks containers", theme)
    } finally {
      removeLoadingComponent();
    }
  }

  const onRefresh = async () => {
    addLoadingComponent();
    setRefreshing(true);
    if(isLoggedIn){
      await Promise.all([
        fetchEndpoints(),
        fetchStacksFn(),
      ])
    }    
    setRefreshing(false);
    removeLoadingComponent();
  };

  useEffect(() => {
    if(!isLoggedIn) {
      navigation.replace('Login');
    }
  }, [isLoggedIn, navigation]);

  useFocusEffect(
    useCallback(() => {
      if (isLoggedIn) {
        onRefresh();
      }
    }, [isLoggedIn]) 
  );

  return (
    <View style={styles.container}>
       <AppHeader navigation={navigation} screen="stacks" />
       <ContainerHeader running={stacksRunning} exited={stacksStopped} activeLabel="Stacks Running" inactiveLabel="Stacks Inactive" />
       <Stacks navigation={navigation} refreshing={refreshing} onRefresh={onRefresh} />
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

export default StacksScreen;