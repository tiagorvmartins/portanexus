import { StyleSheet, Text, View } from "react-native";
import { useGetRunningContainersStore, useGetExitedContainersStore } from "../stores/GetContainersStore/useGetContainersStore"
import React from "react";
import { useGetSettingsContext } from "src/settings/store/useSettingsContext";
import { observer } from "mobx-react";

const ContainerHeader = observer(() => {

  const getSettingsContext = useGetSettingsContext();
  const { theme } = getSettingsContext;  
  const styles = createStyles(theme);
  
  const getRunningContainersStore = useGetRunningContainersStore();
  const getExitedContainersStore = useGetExitedContainersStore();

  return (
    <View style={styles.container}>
      <View style={styles.containerVertical}>
        <Text style={styles.headerText}>{getRunningContainersStore.count !== undefined ? getRunningContainersStore.count : '0'}</Text>
        <Text style={styles.headerSubText}>Running</Text>
      </View>
      <View style={styles.containerVertical}>
        <Text style={styles.headerText}>{getExitedContainersStore.count !== undefined ? getExitedContainersStore.count : '0'}</Text>
        <Text style={styles.headerSubText}>Exited</Text>
      </View>
    </View>
  );
});

const createStyles = (theme: string) => {
  return StyleSheet.create({
    container: {
      backgroundColor: theme === 'light' ? '#f9f9f9' : '#121212',
      padding: 16,
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 16
    },
    containerVertical: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
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
  });
};


export default ContainerHeader;
