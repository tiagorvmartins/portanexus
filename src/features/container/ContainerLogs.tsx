import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View, StyleSheet, FlatList } from 'react-native';
import Loading from '../../components/Loading';
import { showErrorToast } from 'src/utils/toast';
import { ScrollView as RNScrollView } from 'react-native';
import AppHeader from '../../components/AppHeader';
import Footer from '../../components/Footer';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from 'src/store/useAuth';
import { useEndpoints } from 'src/store/useEndpoints';
import { Log } from 'src/types/GetContainerLogsResponse';
import { getContainerLogsApi } from './containerAPI';

const ContainerLogs = ({ route, navigation }: any) => {

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { theme, logsSince, logsRefreshInterval, logsMaxLines } = useAuth();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();
  const [logs, setLogs] = useState<Log[]>([]);
  const [localLoading, setLocalLoading] = useState(false);
  const { selectedEndpointId } = useEndpoints();
  const scrollViewRef = useRef<RNScrollView | null>(null);
  const sinceRef = useRef(logsSince === 0 ? 0 : Math.floor(Date.now() / 1000) - (logsSince / 1000));
  const [fireLogsChange, setFireLogsChange] = useState(false);

  const getContainerLogs = async (initialLoading: boolean) => {
    try {
      if (initialLoading) setLocalLoading(true);
      let until = Math.floor(Date.now() / 1000);

      const logsResponse = await getContainerLogsApi({ endpointId: selectedEndpointId, containerId: route.params.containerId, since: sinceRef.current, until });

      if (logsResponse.results.length && logsResponse.count) {
        const results = logsResponse.results;
        setLogs(prevLogs => {
          if (logsMaxLines !== 0) {
            const combined = [...prevLogs, ...results];
            return combined.length > logsMaxLines ? combined.slice(combined.length - logsMaxLines) : combined;
          }
          return [...prevLogs, ...results];
        });
        setFireLogsChange(f => !f);
      }
      sinceRef.current = until;
    } catch {
      showErrorToast("There was an error fetching container logs", theme);
    } finally {
      if (initialLoading) setLocalLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (route.params.containerId) {
        sinceRef.current = logsSince === 0
          ? 0
          : Math.floor(Date.now() / 1000) - (logsSince / 1000);
        getContainerLogs(true);
      }

      intervalRef.current = setInterval(() => getContainerLogs(false), logsRefreshInterval);

      return () => {
        setLogs([]);
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }, [route.params.containerId, logsRefreshInterval, logsMaxLines, logsSince])
  );

  useEffect(() => {
    sinceRef.current = logsSince === 0 ? 0 : Math.floor(Date.now() / 1000) - (logsSince / 1000);
  }, [logsSince]);

  const LogItem = ({ text }: any) => (
    <Text style={styles.logs}>{text}</Text>
  );

  return (
    <View style={[styles.viewContainer, { paddingTop: insets.top }]}>
      <AppHeader navigation={navigation} />
      <ScrollView
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
        style={styles.container}
      >
        {localLoading && <Loading />}
        {!localLoading && logs.length > 0 && (
          <FlatList
            scrollEnabled={false}
            data={logs}
            renderItem={({ item }) => <LogItem text={item.text} />}
            keyExtractor={item => item.id}
            extraData={fireLogsChange}
          />
        )}
      </ScrollView>
      <Footer navigation={navigation} activeTab="ContainerLogs" />
    </View>
  );
};

const createStyles = (theme: string) => StyleSheet.create({
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

export default ContainerLogs;
