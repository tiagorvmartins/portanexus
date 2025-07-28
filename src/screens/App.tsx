import React, { useEffect, useState } from 'react';
import Icon from '@expo/vector-icons/FontAwesome';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Button, ActivityIndicator } from 'react-native';

import Toast from "react-native-toast-message";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useAuth } from 'src/store/useAuth';
import LoginScreen from './LoginScreen';
import StacksScreen from './StacksScreen';
import ContainersScreen from './ContainerScreen';
import EndpointLists from './EndpointsList';
import SettingsScreen from './SettingsScreen';
import ContainerLogs from '../features/container/ContainerLogs';
import { navigationRef } from './NavigationRef';
import { showErrorToast, showSuccessToast } from 'src/utils/toast';
import { haveLoginDetail as haveLoginDetailThunk } from '../features/auth/authSlice'
import { fetchEndpoints as fetchEndpointsThunk } from '../features/endpoints/endpointsSlice'
import { useEndpoints } from 'src/store/useEndpoints';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

function CustomDrawerContent(props: any) {

  const {
    theme,
    setLoggedIn,
  } = useAuth();

  const styles = createStyles(theme);
  const { logout } = useAuth();


  const handleLogout = async () => {
    try {
      await logout()
      setLoggedIn(false);

      if (navigationRef.isReady()) {
        navigationRef.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }

      showSuccessToast("Logout successfully!", theme);
    } catch (error) {
      showErrorToast("Logout failed", theme);
    }
  };

  return (
      <View style={styles.container}>
        <DrawerContentScrollView {...props}>
          <View style={styles.drawerItemsContainer}>
            {[
              { label: 'Endpoints', route: 'Endpoints' },
              { label: 'Containers', route: 'Containers' },
              { label: 'Stacks', route: 'Stacks' },
              { label: 'Settings', route: 'Settings' },
            ].map(({ label, route }) => (
              <TouchableOpacity
                key={route}
                style={[
                  styles.drawerItem,
                  props.state.routeNames[props.state.index] === route && styles.activeDrawerItem
                ]}
                onPress={() => props.navigation.navigate(route)}
              >
                <Text
                  style={[
                    styles.drawerItemText,
                    props.state.routeNames[props.state.index] === route && styles.activeDrawerItemText
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </DrawerContentScrollView>  
          <View style={styles.logoutButtonContainer}>
            <TouchableOpacity style={styles.button}  onPress={handleLogout}>
              <Text style={styles.buttonText}>Logout</Text>
              <Icon name="sign-out" size={20} style={styles.icon} />
            </TouchableOpacity>
          </View>
      </View>
  );
}

const DrawerNavigator = () => {
  const {
    checkThemeStored,
    theme,
  } = useAuth();

  useEffect(() => {
    const loadStoredPreferences = async () => {
      try {
        await Promise.all([
          checkThemeStored(),
        ]);
      } catch (err) {
        console.error("Error loading preferences:", err);
      }
    };

    loadStoredPreferences();
  }, []);
  
  return (
    <Drawer.Navigator
      backBehavior={"history"}
      screenOptions={{
        headerShown: false,
        swipeEdgeWidth: 300,
        drawerActiveTintColor: theme === 'light' ? '#000000' : '#FFFFFF',
        drawerActiveBackgroundColor: '#05E6F2'+80,
        drawerInactiveTintColor: theme === 'light' ? '#000000' : '#FFFFFF',
        drawerInactiveBackgroundColor: '#05E6F2'+20,
        headerTintColor: theme === 'dark' ? "#FFFFFF" : "#000000" 
      }}
      initialRouteName="Endpoints" drawerContent={props => <CustomDrawerContent {...props} ></CustomDrawerContent>}>
      <Drawer.Screen name="Endpoints" component={EndpointLists} options={{ headerTitle:'' }} />
      <Drawer.Screen name="Containers" component={ContainersScreen} options={{ headerTitle:'' }} />
      <Drawer.Screen name="Stacks" component={StacksScreen} options={{ headerTitle:'' }} />
      <Drawer.Screen name="Settings" component={SettingsScreen} options={{ headerTitle:'' }} />
      <Drawer.Screen name="ContainerLogs" component={ContainerLogs} options={{ headerTitle:'', drawerItemStyle: { display: 'none' } }}  />
    </Drawer.Navigator>
  );
}



const App = () => {
  const {
    checkThemeStored,
    theme,
    isLoggedIn,
    haveLoginDetail,
    setLoginApiKey,
    setLoggedIn,
  } = useAuth();
  const { endpoints, fetchEndpoints } = useEndpoints()

  const [appReady, setAppReady] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([
          checkThemeStored(),
          haveLoginDetail()
        ]);

        setLoggedIn(true)
        setAuthChecked(true);
      } catch (err) {
        console.error("Error loading preferences:", err);
      }
    };

    init();
  }, []);

  useEffect(() => {
  }, [endpoints])  

  const handleLogin = async (hostUrl: string, apiKey: string) => {
    try {
      await setLoginApiKey({ hostUrl, apiKey });

      const loginResult = await haveLoginDetail();
      const endpointsResult = await fetchEndpoints();

      const isLoginValid =
        haveLoginDetailThunk.fulfilled.match(loginResult) && loginResult.payload === true;

      const endpoints = endpointsResult.payload ?? [];

      if (isLoginValid && endpoints.length > 0) {
        setLoggedIn(true);

        if (navigationRef.isReady()) {
          navigationRef.reset({
            index: 0,
            routes: [{ name: 'Root' }],
          });
        }

        showSuccessToast("Login successful!", theme);
      } else {
        setLoggedIn(false);
        showErrorToast("Invalid credentials or no endpoints configured", theme);
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoggedIn(false);
      showErrorToast("Login failed", theme);
    }
  };


  useEffect(() => {
    if (authChecked) {
      setAppReady(true);
    }
  }, [authChecked]);


  if (!appReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme === 'dark' ? '#000' : '#fff' }}>
        <ActivityIndicator size="large" color="#05E6F2" />
      </View>
    );
  }

  return (
    <>
    <SafeAreaProvider>
      
      <NavigationContainer ref={navigationRef} theme={theme === 'dark' ? DarkTheme : DefaultTheme}>
        
        <Stack.Navigator initialRouteName={appReady ? 'Root' : 'Login'}>
          <Stack.Screen name="Root" component={DrawerNavigator} options={{ headerShown: false }} />
          <Stack.Screen
            name="Login"
            options={{ headerShown: false }}
          >
            {() => (
              <LoginScreen
                onLoginPress={handleLogin}
                theme={theme}
                isLoggedIn={isLoggedIn}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      
      </NavigationContainer>
      
    </SafeAreaProvider>
      {Platform.OS === 'web' ? (
        <ToastContainer position="top-center" theme={theme} />
      ) : (
        <Toast />
      )}
    </>
  );
};

const createStyles = (theme: string) => {
  return StyleSheet.create({
    drawerItemsContainer: {
      paddingHorizontal: 10,
    },
    drawerItem: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginBottom: 10,
      borderRadius: 8, // adjust as needed
      backgroundColor: theme === 'light' ? '#F0F0F0' : '#1E1E1E',
    },
    activeDrawerItem: {
      backgroundColor: theme === 'light' ? '#05E6F2' : '#05E6F288', // semi-transparent
    },
    drawerItemText: {
      fontSize: 16,
      color: theme === 'light' ? '#000' : '#fff',
    },
    activeDrawerItemText: {
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#fff',
    },
    container: {
      flex: 1,
      justifyContent: 'space-between',
    },
    logoutButtonContainer: {
      padding: 20,
    },
    spacer: {
      flex: 1,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      paddingHorizontal: 15,
      backgroundColor: theme === 'light' ? '#FFFFFF' : '#151718',
      borderColor: theme === 'light' ? '#FF0000' : '#FF0000'+80,
      marginTop: 16,
    },
    buttonText: {
      color: theme === 'light' ? '#FF0000' : '#FF0000'+80,
      fontSize: 16,
      backgroundColor: theme === 'light' ? '#FFFFFF' : '#151718',
      marginRight: 10,
    },
    icon: {
      marginLeft: 10,
      color: theme === 'light' ? '#FF0000' : '#FF0000'+80,
    },
  });
};

export default App;