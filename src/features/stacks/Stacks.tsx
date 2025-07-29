import React, { useEffect, useState } from "react";
import { StyleSheet, RefreshControl, FlatList } from "react-native";
import Stack from "./Stack";
import StackEntity from "src/features/stacks/StackEntity";
import { useStacks } from "src/store/useStacks";
import { useAuth } from "src/store/useAuth";
import { useEndpoints } from "src/store/useEndpoints";


const Stacks = ({navigation, refreshing, onRefresh}: any) => {

  const { theme, stackOrderBy, getStackOrderBy } = useAuth()
  const styles = createStyles(theme);

  const { stacks: fetchedStacks, fetchStacks } = useStacks()
  const { selectedEndpointId } = useEndpoints()  
  const [ stacks, setStacks ] = useState<StackEntity[]>(fetchedStacks);

  
  useEffect(() => {
      const loadPreferences = async () => {
        try {
          await Promise.all([
            fetchStacks({ endpointId: selectedEndpointId, filters: {} } ),
            getStackOrderBy()
          ]);
        } catch (err) {
          console.error("Error loading preferences:", err);
        }
      };
  
      loadPreferences();
  }, []);


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
      setStacks(sortedData);
  }, [fetchedStacks, stackOrderBy]);

  return (
      <FlatList
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          nestedScrollEnabled
          data={stacks}
          renderItem={({item}) => 
              <Stack navigation={navigation} key={item.Id} stackName={item.Name} status={item.Status} stackId={item.Id} creationDate={item.CreationDate} /> 
          }
          keyExtractor={item => item.Id.toString()}
          style={styles.scrollView}
          >
      </FlatList>
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
