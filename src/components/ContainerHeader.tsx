import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { useAuth } from "src/store/useAuth";

const ContainerHeader = ({running, exited, activeLabel, inactiveLabel}: any) => {

    const { theme } = useAuth()
    const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.containerVertical}>
        <Text style={styles.headerText}>{running}</Text>
        <Text style={styles.headerSubText}>{activeLabel}</Text>
      </View>
      <View style={styles.containerVertical}>
        <Text style={styles.headerText}>{exited}</Text>
        <Text style={styles.headerSubText}>{inactiveLabel}</Text>
      </View>
    </View>
  );
};

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
