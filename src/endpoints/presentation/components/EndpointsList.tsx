import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from "react";
import { useGetSettingsContext } from "src/settings/store/useSettingsContext";
import { observer } from "mobx-react";
import { useGetEndpointsStore } from "../stores/GetContainersStore/useGetEndpointsStore";
import { useAuthContext } from 'src/core/stores/auth/useAuthContext';
import AppHeader from 'src/core/presentation/components/AppHeader';
import { useGetLoadingContext } from "src/loading/store/useLoadingContext";
import showErrorToast from 'src/utils/toast';
import { Platform, RefreshControl as NativeRefreshControl } from 'react-native';
import { RefreshControl as WebRefreshControl } from 'react-native-web-refresh-control';
import Footer from 'src/core/presentation/components/Footer';
const RefreshControl = Platform.OS === 'web' ? WebRefreshControl : NativeRefreshControl;

const EndpointLists = observer(({navigation}: any) => {
  const getLoadingContext = useGetLoadingContext();

  const getSettingsContext = useGetSettingsContext();
  const { theme } = getSettingsContext;  
  const styles = createStyles(theme);

  const getEndpointsStore = useGetEndpointsStore();
  const authContext = useAuthContext();
  const [refreshing, setRefreshing] = useState(false);

  const fetchEndpoints = async () => {
    try {
      getLoadingContext.addLoadingComponent();
      await getEndpointsStore.getEndpoints();
    } catch {
      showErrorToast("There was an error fetching the available endpoints", theme)
    } finally {
      getLoadingContext.removeLoadingComponent();
    }
  };

  const onRefresh = async () => {

    setRefreshing(true);
    if(authContext.isLoggedIn){
      await Promise.all([
        fetchEndpoints()
      ])
    }

    setRefreshing(false);
  };

  useEffect(() => {
    if(!authContext.isLoggedIn) {
      navigation.replace('Login');
    }
  }, [authContext.isLoggedIn, navigation]);

  const endpointType = (type: number) => {
    if (type === 1) {
      return "Docker";
    } else if (type === 2) {
      return "Docker Agent";
    } else if (type === 3) {
      return "Azure Endpoint";
    }
    return "N/A";
  }

  const EndpointItem = ({ item, selected }: any) => (
    
      <Pressable
        style={[
          styles.card,
          {
            backgroundColor: selected && theme === 'light' && '#05E6F2'+40 || selected && theme === 'dark' && '#05E6F2'+80 || ''
          },
        ]
        }    
        onPress={() => getEndpointsStore.setSelectedEndpoint(item.Id)}
      >
        <Text style={styles.text}>Name: {item.Name}</Text>
        <Text style={styles.text}>ID: {item.Id}</Text>
        <Text style={styles.text}>Type: {endpointType(item.Type)}</Text>
        <Text style={styles.text}>URL: {item.URL}</Text>
        <Text style={styles.text}>Group ID: {item.GroupId}</Text>
        <Text style={styles.text}>Public URL: {item.PublicURL || "N/A"}</Text>
    </Pressable>
    
  );

  return (
    <>
      <ScrollView  style={styles.container} refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> }>
        <AppHeader navigation={navigation} />
        <View style={styles.endpointsView}>
          {
              getEndpointsStore.results.map((endpoint: any) => (
                  <EndpointItem key={endpoint.Id} selected={getEndpointsStore.selectedEndpoint === endpoint.Id} item={endpoint}/>
              ))
          }
        </View>
      </ScrollView>
      <Footer />
    </>
  );
});


const createStyles = (theme: string) => {
  return StyleSheet.create({
    container: {
      backgroundColor: theme === 'light' ? '#f9f9f9' : '#121212',
      flex: 1,
    },
    endpointsView: {
      flexGrow: 1,
      paddingBottom: 30,
      backgroundColor: theme === 'light' ? '#f9f9f9' : '#121212',
      padding: 16
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
    selectButton: {
      backgroundColor: '#05E6F2',
      borderRadius: 8,
      padding: 12,
      marginTop: 20,
    },
    selectButtonText: {
        fontSize: 16,
        textAlign: 'center',
        fontWeight: 'bold',
        color: theme === 'light' ? '#333333' : '#000000',
    },
    text: {
      fontSize: 12,
      color: theme === 'light' ? '#333333' : '#e0e0e0',
    },
  });
};


export default EndpointLists;
