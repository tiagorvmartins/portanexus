import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, FlatList, RefreshControl } from "react-native";
import { useEndpoints } from "src/store/useEndpoints";
import ContainerEntity from "../../types/ContainerEntity";
import { useContainer } from "src/store/useContainer";
import { useAuth } from "src/store/useAuth";
import Container from "./Container";

const Containers = ({refreshing, onRefresh, navigation, containers: containersArg }: any) => {
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

  const [ containers, setContainers ] = useState<ContainerEntity[]>(containersArg);
  const [ updateContainers, setUpdateContainers ] = useState<boolean>(false);

  const { fetchSingleContainer } = useContainer();

  
  useEffect(() => {
    let sortedData = [...containersArg];
    switch (containerOrderBy) {
      case "createdDateAsc":
        sortedData.sort((a: ContainerEntity, b: ContainerEntity) => parseInt(a.Created) - parseInt(b.Created));
        break;
      case "createdDateDesc":
        sortedData.sort((a, b) => parseInt(b.Created) - parseInt(a.Created));
        break;
      case "nameAsc":
        sortedData.sort((a, b) => a.Names[0].localeCompare(b.Names[0]));
        break;
      case "nameDesc":
        sortedData.sort((a, b) => b.Names[0].localeCompare(a.Names[0]));
        break;
      default:
        break;
    }
    setContainers(sortedData);
    setUpdateContainers(!updateContainers)
  }, [containerOrderBy, containersArg]);

  const updateSpecificContainer = useCallback(async (containerId: number) => {
    const updateContainerId: Record<string, any> = { 
        id: [containerId],
    }

    const updatedContainerResult: any = await fetchSingleContainer({ endpointId: selectedEndpointId, filters: updateContainerId } );
    const singleContainer = updatedContainerResult.payload;

    setContainers((prevValue) => {
      const containerIndex = prevValue.findIndex(c => c.Id === containerId);
      if (containerIndex !== -1) {
        const updatedContainers = [...prevValue];
        updatedContainers[containerIndex] = singleContainer;
        return updatedContainers;
      } else {
        return [...prevValue, singleContainer];
      }
    });
    setUpdateContainers(!updateContainers)
    onRefresh()

  }, [selectedEndpointId, containers]);

  const closeAllExceptSpecificContainer = useCallback(async (containerId: number) => {
    setContainers((prevValue) => {
      return prevValue.map(container => ({
        ...container,
        Collapsed: container.Id === containerId ? !((container as any).Collapsed) : true
      }));
    });
    setUpdateContainers(!updateContainers)
  }, [containers]);

  return (
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          nestedScrollEnabled
          data={containers}
          renderItem={({item}) => 
              <Container
                  navigation={navigation}
                  containerName={item.Names[0].substring(1)} 
                  collapsed={item.Collapsed} 
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
          extraData={updateContainers}>
        </FlatList>
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
      marginBottom: 10,
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
