import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, RefreshControl, FlatList } from "react-native";
import Stack from "./Stack";
import StackEntity from "src/features/stacks/StackEntity";
import { useStacks } from "src/store/useStacks";
import { useAuth } from "src/store/useAuth";
import { useEndpoints } from "src/store/useEndpoints";
import ContainerEntity from "src/types/ContainerEntity";
import { useContainer } from "src/store/useContainer";
import Loading from "src/components/Loading";


const Stacks = ({filterByStackName, navigation }: any) => {

  const { theme, stackOrderBy, getStackOrderBy } = useAuth()
  const styles = createStyles(theme);

  const { stacks: fetchedStacks, fetchStacks, fetchStack } = useStacks()
  const { selectedEndpointId } = useEndpoints() 
  const { fetchContainers, containers } = useContainer();
  const [ isLoading, setIsLoading ] = useState(false)

  useEffect(() => {
      const loadPreferences = async () => {
        try {
          await Promise.all([
            fetchStacks({ endpointId: selectedEndpointId, filters: {}, stackId: 0 } ),
            getStackOrderBy()
          ]);
        } catch (err) {
          console.error("Error loading preferences:", err);
        }
      };
  
      loadPreferences();
  }, []);

  const [fullStacks, setFullStacks] = useState<StackEntity[]>(fetchedStacks);

  
  const updateStack = async(stackId: number) => {
    const stackFetched: any = await fetchStack({ endpointId: selectedEndpointId, filters: {}, stackId: stackId } )
    
    const stackFetchedResult: any = stackFetched.payload
    await fetchContainers({ filters: { label: [`com.docker.compose.project=${stackFetchedResult.Name}`] }, endpointId: selectedEndpointId })

    if (stackFetched) {
      setFullStacks(prevStacks =>
        prevStacks.map(s => (s.Id === stackFetchedResult.Id ? stackFetchedResult : s))
      );
    }

  };

  const fetchAll = async () => {
      setIsLoading(true)
      const promises = fetchedStacks.map(stack =>
        fetchContainers({ filters: { label: [`com.docker.compose.project=${stack.Name}`] }, endpointId: selectedEndpointId })
      );

      const results = await Promise.all(promises);
      setIsLoading(false)
  };

  useEffect(() => {
    fetchAll();
    setFullStacks(fetchedStacks)
  }, [fetchedStacks.length, selectedEndpointId]);


  useEffect(() => {
    if (!filterByStackName) {
      setFullStacks(fetchedStacks)
    } else {
      const filteredContainers = fetchedStacks.filter((p: StackEntity) => p.Name.toLowerCase().includes(filterByStackName.toLowerCase()))
      setFullStacks(filteredContainers)
    }
  }, [filterByStackName]);


  useEffect(() => {
      let sortedData = [...fetchedStacks];
      switch (stackOrderBy) {
        case "createdDateAsc":
          sortedData.sort((a: StackEntity, b: StackEntity) => a.CreationDate - b.CreationDate);
          break;
        case "createdDateDesc":
          sortedData.sort((a: StackEntity, b: StackEntity) => b.CreationDate - a.CreationDate);
          break;
        case "nameAsc":
          sortedData.sort((a, b) => a.Name.localeCompare(b.Name));
          break;
        case "nameDesc":
          sortedData.sort((a, b) => b.Name.localeCompare(a.Name));
          break;
        default:
          break;
      }
      setFullStacks(sortedData);
  }, [stackOrderBy]);

  const containersByStack = useMemo(() => {
    const map: Record<string, ContainerEntity[]> = {};
    if (!containers || containers.length === 0 || !fetchedStacks) return map;
    fetchedStacks.forEach((stack) => {
      const key = stack.Name;
      // Some backends embed compose project name in Names[0] or in Labels; we match by name fragment
      const list = containers.filter((c: any) => {
        const names = (c?.Names || []) as string[];
        const labels = (c?.Labels || {}) as Record<string, string>;
        const byLabel = labels && labels["com.docker.compose.project"] === key;
        const byName = names.some(n => (n || "").includes(key));
        return byLabel || byName;
      });
      map[key] = list as ContainerEntity[];
    });
    return map;
  }, [containers, fetchedStacks]);

  return (
      <>
      <FlatList
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => {
                fetchAll()
              }}
            />
          }
          nestedScrollEnabled
          extraData={containers}
          data={fullStacks}
          renderItem={({item}) => 
              <Stack navigation={navigation} key={item.Id} stackName={item.Name} status={item.Status} stackId={item.Id} creationDate={item.CreationDate} update={updateStack} isLoading={isLoading} containers={containersByStack[item.Name] || []}  /> 
          }
          keyExtractor={item => item.Id.toString()}
          style={styles.scrollView}
          >
      </FlatList>
    </>
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


export default Stacks;
