import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View, StyleSheet, FlatList, Button } from 'react-native';
import Loading from 'src/core/presentation/components/Loading';
import { useGetEndpointsStore } from 'src/endpoints/presentation/stores/GetContainersStore/useGetEndpointsStore';
import { useGetSettingsContext } from 'src/settings/store/useSettingsContext';
import showErrorToast from 'src/utils/toast';
import { useGetAllContainersStore } from '../stores/GetContainersStore/useGetContainersStore';
import { ScrollView as RNScrollView } from 'react-native';
import { observer } from 'mobx-react';
import { Log } from 'src/containers/application/types/GetContainerLogsResponse';
import { GetAllContainersStoreProvider, GetExitedContainersStoreProvider, GetRunningContainersStoreProvider, GetSingleContainersStoreProvider } from '../stores/GetContainersStore/GetContainersStoreProvider';
import { withProviders } from 'src/utils/withProviders';
import AppHeader from 'src/core/presentation/components/AppHeader';
import Footer from 'src/core/presentation/components/Footer';
import { useFocusEffect } from '@react-navigation/native';

const ContainerLogs = observer( ({ route, navigation }: any) => {
  let intervalId: NodeJS.Timeout;
  const getSettingsContext = useGetSettingsContext();
  const { theme, logsSince, logsInterval, logsMaxLines } = getSettingsContext;
  const styles = createStyles(theme);
  let containerId = route.params.containerId
  const getAllContainersStore = useGetAllContainersStore();

  const initialLogs = [] as Log[]
  const [logs, setLogs] = useState(initialLogs);
  const [ localLoading, setLocalLoading ] = useState(false);
  const getEndpointsStore = useGetEndpointsStore();
  const scrollViewRef = useRef<RNScrollView | null>(null);

  let since = logsSince === 0 ? 0 : Math.floor(Date.now() / 1000) - (logsSince/1000);
  let until = Math.floor(Date.now() / 1000);

  const [fireLogsChange, setFireLogsChange] = useState(false);

  const getContainerLogs = async (initialLoading: boolean) => {
    
    try {
        if (initialLoading)
          setLocalLoading(true)

        const logsResponse = await getAllContainersStore.getContainerLogs(getEndpointsStore.selectedEndpoint, containerId, since, until);
        if (logsResponse.results && logsResponse.results.length) {
          setLogs(prevLogs => {
            if (logsMaxLines !== 0) {
              const combinedLogs = [...prevLogs, ...logsResponse.results];
              const newLogs = combinedLogs.length > logsMaxLines
              ? combinedLogs.slice(combinedLogs.length - logsMaxLines)
              : combinedLogs;
              setFireLogsChange(!fireLogsChange);

              return newLogs;
            } else {
              const combinedLogs = [...prevLogs, ...logsResponse.results];
              setFireLogsChange(!fireLogsChange);
              return combinedLogs;
            }
          });

          setFireLogsChange(!fireLogsChange)
        }
        since = until
        until = Math.floor(Date.now() / 1000)
    } catch {
      showErrorToast("There was an error fetching container logs", theme)
    } finally {
      if (initialLoading)
        setLocalLoading(false)
    }
  };

  useFocusEffect(
    useCallback(() => {
      
      if (containerId) {
        getContainerLogs(true);
      }

      intervalId = setInterval(() => {
        getContainerLogs(false)
      }, logsInterval)

      return () => {
        setLogs([])
        clearInterval(intervalId);
      };
    }, [])
  );

  useEffect(() => {
    since = logsSince === 0 ? 0 : Math.floor(Date.now() / 1000) - (logsSince / 1000)
  }, [logsSince]);

  // useEffect(() => {
  //   if (logs && logs.length ) {
  //     setLocalLoading(false)
  //   }
  // }, [logs]);
  
  
  const LogItem = ({text}: any) => (
    <Text style={styles.logs}>{text}</Text>
  );
  
  return (
    <View style={styles.viewContainer}>
      <AppHeader navigation={navigation} />
      <ScrollView 
        ref={scrollViewRef} 
        onContentSizeChange={() => { scrollViewRef.current?.scrollToEnd({ animated: false }) } } 
        style={styles.container}>
          {localLoading && <Loading />}
          {!localLoading && logs.length > 0 ? (
            <FlatList
              scrollEnabled={false}  
              data={logs}
              renderItem={({item}) => <LogItem text={item.text} />}
              keyExtractor={item => item.id}
              extraData={fireLogsChange}
            />
          ) : null }
      </ScrollView>
      <Footer/>
    </View>
  );
});

const createStyles = (theme: string) => {
  return StyleSheet.create({
    viewContainer: {
      flex: 1,
      backgroundColor: theme === 'light' ? '#f9f9f9' : '#121212',
    },
    container: {
      padding: 10,
      backgroundColor: theme === 'light' ? '#f9f9f9' : '#121212',
      borderColor: theme === 'light' ? '#DDDDDD' : '#444444',
      borderWidth: 1,
      shadowColor: '#000000',
      shadowOpacity: 0.2,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    logs: {
      color: theme === 'light' ? '#333333' : '#e0e0e0',
      fontFamily: 'monospace',
    },
  });
};

export default withProviders(
  GetAllContainersStoreProvider, 
  GetSingleContainersStoreProvider,
  GetRunningContainersStoreProvider, 
  GetExitedContainersStoreProvider)(ContainerLogs);