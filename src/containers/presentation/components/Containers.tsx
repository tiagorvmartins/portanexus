import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, FlatList, RefreshControl } from "react-native";
import { useGetSettingsContext } from "src/settings/store/useSettingsContext";
import { useGetAllContainersStore, useGetSingleContainersStore } from "../stores/GetContainersStore/useGetContainersStore";
import { observer } from "mobx-react";
import Container from "./Container";
import { useGetEndpointsStore } from "src/endpoints/presentation/stores/GetContainersStore/useGetEndpointsStore";
import ContainerEntity from "src/containers/domain/entities/ContainerEntity";

const Containers = observer(({navigation, refreshing, onRefresh}: any) => {  
  const getSettingsContext = useGetSettingsContext();
  const { theme } = getSettingsContext;
  const styles = createStyles(theme);

  const getAllContainersStore = useGetAllContainersStore();
  const getEndpointsStore = useGetEndpointsStore();
  const { results } = getAllContainersStore;
  const singleContainersStore = useGetSingleContainersStore();
  const [containers, setContainers] = useState<ContainerEntity[]>(results);
  const [ updateContainers, setUpdateContainers ] = useState<boolean>(false);

  useEffect(() => {
    setContainers(results)
    setUpdateContainers(!updateContainers)
  }, [results]);

  const updateSpecificContainer = useCallback(async (containerId: number) => {
    const singleContainerPayload: Record<string, any> = { id: [containerId] };

    singleContainersStore.resetFilters(singleContainerPayload);
    await singleContainersStore.getContainers(getEndpointsStore.selectedEndpoint);
    const { results: singleContainer } = singleContainersStore;

    setContainers((prevValue) => {
      const containerIndex = prevValue.findIndex(c => c.Id === containerId);
      if (containerIndex !== -1) {
        const updatedContainers = [...prevValue];
        updatedContainers[containerIndex] = singleContainer[0];
        return updatedContainers;
      } else {
        return [...prevValue, singleContainer[0]];
      }
    });
    setUpdateContainers(!updateContainers)
    onRefresh()

  }, [getEndpointsStore, singleContainersStore]);

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
