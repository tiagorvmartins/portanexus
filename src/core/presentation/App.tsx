import HomeScreen from 'src/core/presentation/screens/Home';
import React from 'react';
import Icon from '@expo/vector-icons/FontAwesome';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { GetThemeProvider } from 'src/theme/store/ThemeProvider';
import { withProviders } from 'src/utils/withProviders';
import { observer } from 'mobx-react';
import { useGetThemeContext } from 'src/theme/store/useThemeContext';
import Toast from "react-native-toast-message";
import LoginScreen from './screens/Login';
import { AuthProvider } from '../stores/auth/AuthProvider';
import { useAuthContext } from '../stores/auth/useAuthContext';
import { GetLoadingProvider } from 'src/loading/store/LoadingProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import EndpointLists from 'src/endpoints/presentation/components/EndpointsList';
import { GetEndpointsStoreProvider } from 'src/endpoints/presentation/stores/GetContainersStore/GetEndpointsStoreProvider';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

function CustomDrawerContent(props: any) {
  const getThemeContext = useGetThemeContext();  
  const { theme } = getThemeContext;
  const styles = createStyles(theme);

  const authContext = useAuthContext();

  const handleLogout = async () => {
    await authContext.logout()
    props.navigation.replace('Login');
  };

  return (
      <View style={styles.container}>
        <DrawerContentScrollView {...props}>
          <DrawerItemList {...props} />
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

const DrawerNavigator = observer(() => {
  const getThemeContext = useGetThemeContext();
  
  return (
    <Drawer.Navigator 
      screenOptions={{
        drawerActiveTintColor: '#05E6F2',
        drawerActiveBackgroundColor: '#05E6F2'+20,
        drawerInactiveTintColor: '#05E6F2'+50,
        drawerInactiveBackgroundColor: '#222222'+10,
        headerTintColor: getThemeContext.theme === 'dark' ? "#FFFFFF" : "#000000" 
      }}
      
      initialRouteName="Home" drawerContent={props => <CustomDrawerContent {...props} ></CustomDrawerContent>}>
      <Drawer.Screen name="Home" component={HomeScreen} options={{ headerTitle:'' }} />
      <Drawer.Screen name="Endpoints" component={EndpointLists} options={{ headerTitle:'' }} />
    </Drawer.Navigator>
  );
})



const App = observer(() => {
  const getThemeContext = useGetThemeContext();
  return (
    <>
    <SafeAreaProvider>
      <NavigationContainer theme={getThemeContext.isDarkMode ? DarkTheme : DefaultTheme}>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Root" component={DrawerNavigator} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
      {Platform.OS === 'web' ? (
        <ToastContainer position="top-center" theme={getThemeContext.theme} />
      ) : (
        <Toast />
      )}
    </>
  );
});

const createStyles = (theme: string) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'space-between',
    },
    logoutButtonContainer: {
      padding: 10,
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
      borderRadius: 5,
      borderColor: theme === 'light' ? '#FF0000' : '#FF0000'+80,
      borderWidth: 1,
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

export default withProviders(GetThemeProvider, AuthProvider, GetLoadingProvider, GetEndpointsStoreProvider)(App);