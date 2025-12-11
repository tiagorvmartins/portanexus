import React, { useCallback, useEffect, useState, useMemo } from "react";
import { StyleSheet, FlatList, Platform } from "react-native";
import { RefreshControl as NativeRefreshControl } from 'react-native';
import { RefreshControl as WebRefreshControl } from 'react-native-web-refresh-control';
import { useEndpoints } from "src/store/useEndpoints";
import ContainerEntity from "../../types/ContainerEntity";
import { useContainer } from "src/store/useContainer";
import { useAuth } from "src/store/useAuth";
import Container from "./Container";

const RefreshControl = Platform.OS === 'web' ? WebRefreshControl : NativeRefreshControl;

const Containers = ({filterByContainerName, refreshing, onRefresh, navigation, containers: containersArg }: any) => {
  const { theme, containerOrderBy, getContainerOrderBy } = useAuth()
  const styles = createStyles(theme);

  
  useEffect(() => {
      const loadPreferences = async () => {
        try {
          await Promise.all([
            getContainerOrderBy()
          ]);
        } catch (err) {
          console.error("Error loading preferences:", err);
        }
      };
  
      loadPreferences();
  }, []);

  const { selectedEndpointId } = useEndpoints();

  const { fetchSingleContainer } = useContainer();

  // Combine filtering and sorting in a single memoized computation
  const processedContainers = useMemo(() => {
    let result = [...containersArg];
    
    // Apply filtering first
    if (filterByContainerName) {
      result = result.filter((p: ContainerEntity) => 
        p.Names[0]?.toLowerCase().includes(filterByContainerName.toLowerCase())
      );
    }
    
    // Apply sorting
    switch (containerOrderBy) {
      case "createdDateAsc":
        result.sort((a: ContainerEntity, b: ContainerEntity) => parseInt(a.Created) - parseInt(b.Created));
        break;
      case "createdDateDesc":
        result.sort((a, b) => parseInt(b.Created) - parseInt(a.Created));
        break;
      case "nameAsc":
        result.sort((a, b) => (a.Names[0] || '').localeCompare(b.Names[0] || ''));
        break;
      case "nameDesc":
        result.sort((a, b) => (b.Names[0] || '').localeCompare(a.Names[0] || ''));
        break;
      default:
        break;
    }
    
    return result;
  }, [containersArg, filterByContainerName, containerOrderBy]);

  const [expandedContainerId, setExpandedContainerId] = useState<number | null>(null);

  const updateSpecificContainer = useCallback(async (containerId: number) => {
    const updateContainerId: Record<string, any> = { 
        id: [containerId],
    }

    const updatedContainerResult: any = await fetchSingleContainer({ endpointId: selectedEndpointId, filters: updateContainerId } );
    const singleContainer = updatedContainerResult.payload;

    // Refresh will update containers from Redux, no need to update local state
    onRefresh();

  }, [selectedEndpointId, onRefresh, fetchSingleContainer]);

  const closeAllExceptSpecificContainer = useCallback((containerId: number) => {
    setExpandedContainerId(prev => prev === containerId ? null : containerId);
  }, []);

  return (
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          nestedScrollEnabled
          data={processedContainers}
          renderItem={({item}) => 
              <Container
                  navigation={navigation}
                  containerName={item.Names[0]?.substring(1) || ''} 
                  collapsed={expandedContainerId !== item.Id} 
                  state={item.State} 
                  status={item.Status} 
                  containerId={item.Id} 
                  creationDate={item.Created} 
                  onUpdate={updateSpecificContainer} 
                  onClick={closeAllExceptSpecificContainer}
                /> 
          }
          keyExtractor={item => item.Id.toString()}
          style={styles.scrollView}
          extraData={expandedContainerId}
        />
    )
};

const createStyles = (theme: string) => {
  return StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
      backgroundColor: "white",
      padding: 20,
      borderRadius: 5,
      width: "80%",
    },
    optionButton: {
      padding: 10,
      borderBottomWidth: 1,
      borderColor: "#ccc",
    },
    orderingView: {
      height: 50,
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    sortButton: {
      backgroundColor: '#d2d2d2',
      padding: 10,
      borderRadius: 5,
      borderBottomColor: '#ddd',
      borderBottomWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      alignContent: 'center',
      marginHorizontal: 10,
    },
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
      paddingBottom: 0,
      backgroundColor: theme === 'light' ? '#f9f9f9' : '#121212',
      marginBottom: 0,
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
    }
  });
};


export default Containers;
