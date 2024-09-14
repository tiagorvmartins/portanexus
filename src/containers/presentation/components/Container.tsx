import React, {useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { useGetThemeContext } from "src/theme/store/useThemeContext";
import { useGetAllContainersStore } from "../stores/GetContainersStore/useGetContainersStore";
import Icon from '@expo/vector-icons/FontAwesome';
import { useGetEndpointsStore } from "src/endpoints/presentation/stores/GetContainersStore/useGetEndpointsStore";
import showErrorToast from "src/utils/toast";
import Loading from "src/core/presentation/components/Loading";
import { observer } from "mobx-react";

const statusDot = (status: number | string, styles: any) => {
  if (status === 1 || status === "running") {
    return styles.dotActive
  }
  return styles.dotInactive
}

const Container = observer(({ containerName, status, containerId, state, onUpdate }: any) => {

  const getThemeContext = useGetThemeContext();
  const { theme } = getThemeContext;
  const styles = createStyles(theme);  
  const getAllContainersStore = useGetAllContainersStore();
  const getEndpointsStore = useGetEndpointsStore();
  const [ localLoading, setLocalLoading ] = useState(false)

  const start = async (containerId: string) => {
    setLocalLoading(true)
    try {
      await getAllContainersStore.startContainer(getEndpointsStore.selectedEndpoint, containerId);
      await new Promise((resolve) => setTimeout(resolve, 1000))
      onUpdate(containerId);
    } catch {
      showErrorToast("There was an error starting the container", theme)
    }
    setLocalLoading(false)
  };

  const stop = async (containerId: string) => {
    setLocalLoading(true)
    try {
      await getAllContainersStore.stopContainer(getEndpointsStore.selectedEndpoint, containerId);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onUpdate(containerId);
    } catch {
      showErrorToast("There was an error stopping the container", theme)
    }
    setLocalLoading(false)
  };

  const restart = async (containerId: string) => {
    setLocalLoading(true)
    try {
      await getAllContainersStore.stopContainer(getEndpointsStore.selectedEndpoint, containerId);
      await getAllContainersStore.startContainer(getEndpointsStore.selectedEndpoint, containerId);
      onUpdate(containerId);
    } catch {
      showErrorToast("There was an error restarting the container", theme)
    }
    setLocalLoading(false)
  };

  return (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderTitle}>
            <View style={statusDot(state, styles)} />
            <Text style={styles.cardTitle}>{containerName.length > 16 ? `...${containerName.substring(containerName.length-16, containerName.length)}` : containerName }</Text>
          </View>
          <View style={styles.cardHeaderOperations}>
            <TouchableOpacity onPress={() => restart(containerId)}>
              <Icon
                name="rotate-right"
                size={16}
                color={theme === 'dark' ? '#fff' : '#000'}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => stop(containerId)} disabled={state !== "running"}>
              <Icon
                name="stop"
                size={16}
                style={state !== "running" ? styles.disabled : styles.enabled}
                color={theme === 'dark' ? '#fff' : '#000'}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => start(containerId)} disabled={state === "running"}>
              <Icon
                name="play"
                size={16}
                style={state === "running" ? styles.disabled : styles.enabled}
                color={theme === 'dark' ? '#fff' : '#000'}
              />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.headerSubText}>{status}</Text>
        {localLoading && <Loading></Loading>}
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
      padding: 8
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
      padding: 8
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
      padding: 12,
      paddingRight: 0,
      marginVertical: 8,
      shadowColor: '#000000',
      shadowOpacity: 0.2,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      marginBottom: 8
    },
    cardHeaderTitle: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      flex: 1
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


export default Container;
