import React, { useCallback, useEffect, useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import Loading from "../../components/Loading";
import moment from "moment";
import Icon from '@expo/vector-icons/FontAwesome';
import { showErrorToast, showSuccessToast } from "src/utils/toast";
import { useStacks } from "src/store/useStacks";
import { useEndpoints } from "src/store/useEndpoints";
import { useAuth } from "src/store/useAuth";
import Container from "../container/Container";
import { useContainer } from "src/store/useContainer";
import { fetchSingleContainer as fetchSingleContainerThunk } from "src/features/container/containerSlice";
import ContainerEntity from "src/types/ContainerEntity";

const StatusDot = ({ stackContainers, styles, status, isLoading}: any) => {
  
  let dotStyle;
  if (isLoading)
    dotStyle = styles.dotLoading
  else if (status === 2)
    dotStyle = styles.dotInactive
  else if (status === 1 && stackContainers.length > 0 && stackContainers.every((p: any) => p.State === "running")) 
    dotStyle = styles.dotActive
  else if (status === 1) 
    dotStyle = styles.dotPartialActive;

  return <View style={dotStyle} />;
};

const Stack = ({ navigation, stackName, status, stackId, creationDate, containers, update, isLoading }: any) => {

  const { theme } = useAuth();
  const styles = createStyles(theme);

  const { selectedEndpointId } = useEndpoints();
  const { fetchSingleContainer } = useContainer();

  const { startStack, stopStack, restartStack, fetchStacks } = useStacks()
  
  const [expanded, setExpanded] = useState(false);
  const stackContainersFilter: Record<string, any> = {
        label: [`com.docker.compose.project=${stackName}`]
  }

  useEffect(() => {
      fetchStacks({filters: stackContainersFilter, endpointId: selectedEndpointId});
  }, [selectedEndpointId]);

  const [ localLoading, setLocalLoading ] = useState(false)  
  
  function ageInDaysAndHours(dateUnix: number): string {
    const momentDate = moment.unix(dateUnix)
    const currentDate = moment();
    const days = currentDate.diff(momentDate, 'days');

    return `${days}d`;
  }
  
  // Use containers from props as the single source of truth
  const stackContainers: ContainerEntity[] = containers || [];

  const start = async (stackId: number) => {
    setLocalLoading(true)
    try {
      await startStack({stackId: stackId, endpointId: selectedEndpointId, filters: {} });
      await update(stackId)
      setExpanded(false);
      showSuccessToast("Started stack successfully!", theme)
    } catch (e) {
      showErrorToast("There was an error starting the stack", theme)
    }
    setLocalLoading(false)
  };

  const stop = async (stackId: number) => {
    setLocalLoading(true)
    try {
      await stopStack({stackId: stackId, endpointId: selectedEndpointId, filters: {} });
      await update(stackId)
      setExpanded(false);
      showSuccessToast("Stopped stack successfully!", theme)
    } catch (e){
      showErrorToast("There was an error stopping the stack", theme)
    }
    setLocalLoading(false)
  };

  const restart = async (stackId: number) => {
    setLocalLoading(true)
    try {
      await restartStack({stackId: stackId, endpointId: selectedEndpointId, filters: {} });
      await update(stackId)
      setExpanded(false);
      showSuccessToast("Restarted stack successfully!", theme)
    } catch {
      showErrorToast("There was an error restarting the stack", theme)
    }
    setLocalLoading(false)
  };

  // containers are derived in parent; no local syncing needed

  const updateSpecificContainer = useCallback(async (containerId: number) => {
    const filters : Record<string, any> = { id: [containerId] };
    await fetchSingleContainer({filters, endpointId: selectedEndpointId});
    // Parent derives containers from global slice; no local state updates here
  }, []);

  const closeAllExceptSpecificContainer = useCallback(async (containerId: number) => {
    // Local collapse state per container can be handled via global slice or avoided; no-op for now
  }, [containers]);

  return (
    <View style={styles.card}>
      <TouchableOpacity
        disabled={status !== 1}
        onPress={(e) => {
          setExpanded(!expanded);
          e.stopPropagation();
        }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderTitle}>
            <StatusDot stackContainers={stackContainers} isLoading={isLoading} status={status} name={stackName} styles={styles} stackName={stackName}></StatusDot>
            <Text style={styles.cardTitle}>{stackName}</Text>
          </View>
          <View style={styles.cardHeaderOperations}>
            <TouchableOpacity onPress={(e) => { e.stopPropagation(); restart(stackId) }} disabled={status !== 1}>
              <Icon
                name="rotate-right"
                size={16}
                style={status !== 1 ? styles.disabled : styles.enabled}
                color={theme === 'dark' ? '#fff' : '#000'}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={(e) => { e.stopPropagation(); stop(stackId)}} disabled={status !== 1}>
              <Icon
                name="stop"
                size={16}
                style={status !== 1 ? styles.disabled : styles.enabled}
                color={theme === 'dark' ? '#fff' : '#000'}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={(e) => { e.stopPropagation(); start(stackId)}} disabled={status === 1}>
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
            (((localLoading)) &&
              <Loading></Loading>)
            ||
            (stackContainers.length > 0 &&
              <>
                {
                  stackContainersFilter && stackContainers.map((section: any) => (
                    <Container 
                      navigation={navigation} 
                      key={section.Id} 
                      containerName={section.Names[0].substring(1)} 
                      collapsed={section.collapsed} 
                      state={section.State} 
                      status={section.Status} 
                      containerId={section.Id} 
                      creationDate={section.Created} 
                      onUpdate={updateSpecificContainer} 
                      onClick={closeAllExceptSpecificContainer}
                      updateParentStack={update}
                      stackId={stackId} /> 
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
};

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
    dotPartialActive: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: '#FFFF00',
      marginRight: 8
    },
    dotLoading: {
      width: 10,
      height: 10,
      borderRadius: 5,
      borderWidth: 2,
      borderColor: theme === 'light' ? '#333333' : '#e0e0e0',
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


export default Stack;
