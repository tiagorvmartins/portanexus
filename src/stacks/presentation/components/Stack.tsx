import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { useGetThemeContext } from "src/theme/store/useThemeContext";
import { observer } from "mobx-react";
import Loading from "src/core/presentation/components/Loading";
import { useGetStackContainersStore } from "src/containers/presentation/stores/GetContainersStore/useGetContainersStore";
import { GetStackContainersStoreProvider } from "src/containers/presentation/stores/GetContainersStore/GetContainersStoreProvider";
import { withProviders } from "src/utils/withProviders";
import moment from "moment";
import { useGetStacksStore } from "../stores/GetStacksStore/useGetStacksStore";
import Icon from '@expo/vector-icons/FontAwesome';
import { useGetEndpointsStore } from "src/endpoints/presentation/stores/GetContainersStore/useGetEndpointsStore";
import showErrorToast from "src/utils/toast";

const statusDot = (status: number | string, styles: any) => {
  if (status === 1 || status === "running") {
    return styles.dotActive
  }
  return styles.dotInactive
}

const Stack = observer(({ stackName, status, stackId, creationDate }: any) => {

  
  const getThemeContext = useGetThemeContext();
  const { theme } = getThemeContext;
  const styles = createStyles(theme);

  const getContainersStore = useGetStackContainersStore();
  const { results: containerResults } = getContainersStore;

  const stackContainersFilter: Record<string, any> = {
    status: ["running"],
    label: [`com.docker.compose.project=immich`]
  }

  const [expanded, setExpanded] = useState(false);

  const getStacksStore = useGetStacksStore();

  const [ localLoading, setLocalLoading ] = useState(false)

  const getEndpointsStore = useGetEndpointsStore();

  function ageInDaysAndHours(dateUnix: number): string {
    const momentDate = moment.unix(dateUnix)
    const currentDate = moment();
    const days = currentDate.diff(momentDate, 'days');

    return `${days}d`;
  }

  const start = async (stackId: number) => {
    setLocalLoading(true)
    try {
      await getStacksStore.startStack(stackId);
      await getStacksStore.getStacks()
      setExpanded(false);
    } catch {
      showErrorToast("There was an error starting the stack", theme)
    }
    setLocalLoading(false)
  };

  const stop = async (stackId: number) => {
    setLocalLoading(true)
    try {
      await getStacksStore.stopStack(stackId);
      await getStacksStore.getStacks()
      setExpanded(false);
    } catch {
      showErrorToast("There was an error stopping the stack", theme)
    }
    setLocalLoading(false)
  };

  const restart = async (stackId: number) => {
    setLocalLoading(true)
    try {
      await getStacksStore.stopStack(stackId);
      await getStacksStore.startStack(stackId);
      await getStacksStore.getStacks()
      setExpanded(false);
    } catch {
      showErrorToast("There was an error restarting the stack", theme)
    }
    setLocalLoading(false)
  };

  const fetch = async() => {
    try {
      getContainersStore.mergeFilters(stackContainersFilter);
      await getContainersStore.getContainers(getEndpointsStore.selectedEndpoint);
    } catch {
      showErrorToast("There was an error fetching the stack containers", theme)
    } 
  }

  useEffect(() => {
    if(expanded){
      fetch()
    }
      
  }, [expanded]);

  return (
    <View style={styles.card}>
      <TouchableOpacity
        disabled={status !== 1}
        onPress={() => {
          setExpanded(!expanded);
        }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderTitle}>
            <View style={statusDot(status, styles)} />
            <Text style={styles.cardTitle}>{stackName}</Text>
          </View>
          <View style={styles.cardHeaderOperations}>
            <TouchableOpacity onPress={() => restart(stackId)}>
              <Icon
                name="rotate-right"
                size={16}
                color={theme === 'dark' ? '#fff' : '#000'}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => stop(stackId)} disabled={status !== 1}>
              <Icon
                name="stop"
                size={16}
                style={status !== 1 ? styles.disabled : styles.enabled}
                color={theme === 'dark' ? '#fff' : '#000'}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => start(stackId)} disabled={status === 1}>
              <Icon
                name="play"
                size={16}
                style={status === 1 ? styles.disabled : styles.enabled}
                color={theme === 'dark' ? '#fff' : '#000'}
              />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.headerSubText}>Age: {ageInDaysAndHours(creationDate)}</Text>
        {expanded &&
          (
            ((getContainersStore.isLoading || (localLoading)) &&
              <Loading></Loading>)
            ||
            (!getContainersStore.isLoading && containerResults.length > 0 &&
              <>
                {
                  stackContainersFilter && containerResults.map((section: any, index: any) => (
                    <View key={index} style={styles.card}>
                      <View style={styles.cardHeaderVertical}>
                        <View style={styles.cardHeaderChild}>
                          <View style={statusDot(section.State, styles)} />
                          <Text style={styles.cardTitle}>{section.Names.map((c: string) => c.substring(1))}</Text>
                        </View>
                        <View style={styles.cardHeaderChild}>
                          <Text style={styles.headerSubText}>{section.Status}</Text>
                        </View>
                      </View>
                    </View>
                  ))
                }
              </>
            ))
        }
        {
          (!expanded && localLoading && <Loading></Loading>)
        }
      </TouchableOpacity>
    </View>
  );

});

const createStyles = (theme: string) => {
  return StyleSheet.create({
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 16,
      color: theme === 'light' ? '#333333' : '#e0e0e0',
    },
    container: {
      backgroundColor: theme === 'light' ? '#f9f9f9' : '#121212',
      padding: 16
    },
    headerText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme === 'light' ? '#333333' : '#e0e0e0',
    },
    headerSubText: {
      fontSize: 12,
      color: theme === 'light' ? '#333333' : '#e0e0e0',
    },
    scrollView: {
      flexGrow: 1,
      paddingBottom: 30,
      backgroundColor: theme === 'light' ? '#f9f9f9' : '#121212',
      padding: 16
    },
    section: {
      marginBottom: 32
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme === 'light' ? '#333333' : '#e0e0e0',
      marginBottom: 16
    },
    cardsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between'
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
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8
    },
    cardHeaderTitle: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8
    },
    cardHeaderOperations: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-evenly',
      marginBottom: 8,
      width: 120,
    },
    dotActive: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: '#00ff00',
      marginRight: 8
    },
    dotInactive: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: '#ff0000',
      marginRight: 8
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme === 'light' ? '#333333' : '#e0e0e0',
    },
    cardStatus: {
      fontSize: 14,
      color: theme === 'light' ? '#333333' : '#e0e0e0',
      marginBottom: 16
    },
    cardActions: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    disabled: {
      color: theme === 'light' ? '#e6e6e6' : '#2e2e2e',
    },
    enabled: {},
    cardActionText: {
      fontSize: 16,
      color: theme === 'light' ? '#007aff' : '#bb86fc'
    },
    cardHeaderChild: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    cardHeaderVertical: {
      flexDirection: 'column',
    },

  });
};


export default  withProviders(GetStackContainersStoreProvider)(Stack);
