
import { Platform, Pressable, StyleSheet, TextInput, View, ViewStyle, Text } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { showErrorToast } from "src/utils/toast";
import { useFocusEffect } from '@react-navigation/native';
import { useLoading } from "src/store/useLoading";
import { useAuth } from "src/store/useAuth";
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

  const [filterByStackName, setFilterByStackName] = useState<string>("");

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
       <View style={styles.inputContainer}>
          <TextInput
            multiline={Platform.OS === "web" ? false : true}
            placeholder="Filter by stack name..."
            onChangeText={(text: string) => {
              setFilterByStackName(text.replace(/\s/g, ""));
            }}
            placeholderTextColor={
              theme === "light"
                ? "rgba(51, 51, 51, 0.5)"
                : "rgba(224, 224, 224, 0.5)"
            }
            value={filterByStackName}
            style={styles.input}
          />

          <Pressable
            onPress={() => setFilterByStackName("")}
            style={({ pressed }): ViewStyle[] => [
              styles.clearButton,
              pressed ? styles.clearButtonPressed : styles.clearButton,
            ]}
          >
            <Text style={styles.clearText}>✕</Text>
          </Pressable>
          
       </View>
       <Stacks navigation={navigation} filterByStackName={filterByStackName} refreshing={refreshing} onRefresh={onRefresh} />
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
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    input: {
      borderWidth: 1,
      borderRadius: 5,
      padding: 24,
      marginLeft: 16,
      marginRight: 16,
      marginBottom: 8,
      borderColor: theme === 'light' ? '#000000' : '#444444',
      shadowColor: theme === 'light' ? '#000000' : '#444444',
      color: theme === 'light' ? '#000000' : '#FFFFFF',
      shadowOpacity: 0.2,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      textAlign: 'center',
      flex: 1,
      paddingVertical: 8,
      fontSize: 16,
    },
    clearButtonPressed: {
      backgroundColor: "#aaa",
      transform: [{ scale: 0.9 }],
    },
    clearButton: {
      marginRight: 16,
      marginBottom: 8,
      backgroundColor: "#e0e0e0",
      borderRadius: 12,
      paddingHorizontal: 6,
      paddingVertical: 2,
      justifyContent: "center",
      alignItems: "center",

      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 2,
      shadowOffset: { width: 0, height: 1 },
      elevation: 2,
    },
    clearText: {
      fontSize: 14,
      fontWeight: "bold",
      color: "#333",
    },
  });
};

export default StacksScreen;