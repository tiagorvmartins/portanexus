import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View, StyleSheet, FlatList, Button } from 'react-native';
import Loading from '../../components/Loading';
import { showErrorToast } from 'src/utils/toast';
import { ScrollView as RNScrollView } from 'react-native';
import AppHeader from '../../components/AppHeader';
import Footer from '../../components/Footer';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from 'src/store/useAuth';
import { useEndpoints } from 'src/store/useEndpoints';
import { useContainer } from 'src/store/useContainer';
import GetContainerLogsResponse, { Log } from 'src/types/GetContainerLogsResponse';
import GetContainerStatsResponse, { Stats } from 'src/types/GetContainerStatsResponse';

const ContainerLogs = ({ route, navigation }: any) => {
  let intervalId: NodeJS.Timeout;

  const { theme, logsSince, logsRefreshInterval, logsMaxLines } = useAuth();
  
  const styles = createStyles(theme);
  
  const { fetchContainerStats, fetchContainerLogs } = useContainer();

  const initialLogs = [] as Log[];
  const initialStats = [] as Stats[];
  const [logs, setLogs] = useState(initialLogs);
  const [stats, setStats] = useState(initialStats);
  const [ localLoading, setLocalLoading ] = useState(false);
  const { selectedEndpointId } = useEndpoints()
  const scrollViewRef = useRef<RNScrollView | null>(null);

  let since = logsSince === 0 ? 0 : Math.floor(Date.now() / 1000) - (logsSince/1000);
  let until = Math.floor(Date.now() / 1000);


  const [fireLogsChange, setFireLogsChange] = useState(false);

  const getContainerStats = async () => {
    const statsResponse = await fetchContainerStats({ endpointId: selectedEndpointId, containerId: route.params.containerId });
    if (statsResponse.payload) {
      const { results } = statsResponse.payload as GetContainerStatsResponse
      setStats(results);
    }
  }

  const getContainerLogs = async (initialLoading: boolean) => {
    
    try {
        if (initialLoading)
          setLocalLoading(true)

        const logsResponse = await fetchContainerLogs({ endpointId: selectedEndpointId, containerId: route.params.containerId, since, until });
        if (logsResponse.payload) {
          const { results, containerId, count } = logsResponse.payload as GetContainerLogsResponse
          if (results.length && count) {
            setLogs(prevLogs => {
              if (logsMaxLines !== 0) {
                const combinedLogs = [...prevLogs, ...results];
                const newLogs = combinedLogs.length > logsMaxLines
                ? combinedLogs.slice(combinedLogs.length - logsMaxLines)
                : combinedLogs;
                setFireLogsChange(!fireLogsChange);

                return newLogs;
              } else {
                const combinedLogs = [...prevLogs, ...results];
                setFireLogsChange(!fireLogsChange);
                return combinedLogs;
              }
            });

            setFireLogsChange(!fireLogsChange)
          }
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
      
      if (route.params.containerId) {
        getContainerLogs(true);
        getContainerStats()
      }

      intervalId = setInterval(() => {
        getContainerLogs(false)
        getContainerStats()
      }, logsRefreshInterval)

      return () => {
        setLogs([])
        clearInterval(intervalId);
      };
    }, [route.params.containerId, logsRefreshInterval])
  );

  useEffect(() => {
    since = logsSince === 0 ? 0 : Math.floor(Date.now() / 1000) - (logsSince / 1000)
  }, [logsSince]);

  const LogItem = ({text}: any) => (
    <Text style={styles.logs}>{text}</Text>
  );
  
  return (
    <View style={styles.viewContainer}>
      <AppHeader navigation={navigation} />
      { stats.length > 0 ? (
        <View style={styles.headerContainer}>
        {stats.map((stat: any) => <View key={stat.label} style={styles.usageContainer}>
          <Text style={styles.usageLabel}>{stat.label}</Text>
          <Text style={styles.usageText}>{stat.value}%</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progress, { width: `${stat.value}%`, backgroundColor: parseFloat(stat.value) > 80 ? 'red' : 'green' }]} />
          </View>
        </View>)}
      </View>) : null
      }
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
};

const createStyles = (theme: string) => {
  return StyleSheet.create({
    headerContainer: {
      marginHorizontal: 10,
      backgroundColor: theme === 'light' ? '#f9f9f9' : '#121212',
    },
    usageContainer: {
      flexDirection: 'column',
      marginBottom: 10,
    },
    usageLabel: {
      fontSize: 14,
      color: theme === 'light' ? '#333333' : '#e0e0e0',
      marginBottom: 4,
    },
    usageText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme === 'light' ? '#333333' : '#e0e0e0',
    },
    progressBar: {
      height: 8,
      width: '100%',
      backgroundColor: '#555',
      borderRadius: 4,
      overflow: 'hidden',
      marginTop: 4,
    },
    progress: {
      height: '100%',
      borderRadius: 4,
    },
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

export default ContainerLogs;


