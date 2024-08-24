import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { View, Switch, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { TextInput, Text } from 'react-native';
import { useGetThemeContext } from 'src/theme/store/useThemeContext';
import Icon from '@expo/vector-icons/FontAwesome';
import SecureStoreEntry from 'src/core/domain/enums/SecureStoreEntry';
import { useAuthContext } from 'src/core/stores/auth/useAuthContext';

const LoginScreen = observer(({navigation}: any) => {
    const [hostUrl, setHostUrl] = useState<SecureStoreEntry | undefined>("" as SecureStoreEntry);    
    const [apiKey, setApiKey] = useState<SecureStoreEntry | undefined>("" as SecureStoreEntry);

    const getThemeContext = useGetThemeContext();
    const { theme } = getThemeContext;
    const styles = createStyles(theme)

    const authContext = useAuthContext();
    
    const handleLogin = async () => {
        if(hostUrl && apiKey){
            await authContext.setLoginApiKey(hostUrl, apiKey)
        }
        navigation.replace('Root')
    };

    const apiKeyTemplate = () => {
        return (
            <View>
                <TextInput
                    placeholder="API Key"
                    onChangeText={(text: string) => { setApiKey(text as SecureStoreEntry)}}
                    placeholderTextColor={theme === 'light' ? 'rgba(51, 51, 51, 0.5)' : 'rgba(224, 224, 224, 0.5)'}
                    value={apiKey}
                    textAlign="center"
                    style={styles.input}
                />
            </View>
        );
    }

    const [ loginFetched, setLoginFeteched ] = useState<boolean | null>(null)

    useEffect(() => {
        const checkLogin = async () => {
            return await authContext.checkLogin();
        }
        
        checkLogin()
        .then((isLoggedIn) => {
            setLoginFeteched(isLoggedIn)
            if(isLoggedIn)
                navigation.replace('Root')
        })
        .catch(console.error);
    }, [authContext.isLoggedIn, navigation]);

    return (
        loginFetched === null ?
        <View style={styles.container}>
            <ActivityIndicator size="large" />
        </View>
         :
        <View style={styles.container}>
            <View style={styles.innerContainer}>
                <Text style={styles.title}>Authentication</Text>
                <View style={styles.containerInputs}>
                    <TextInput
                        placeholder="Host URL"
                        onChangeText={(text: string) => { setHostUrl(text as SecureStoreEntry)}}
                        placeholderTextColor={theme === 'light' ? 'rgba(51, 51, 51, 0.5)' : 'rgba(224, 224, 224, 0.5)'}
                        value={hostUrl}
                        textAlign="center"
                        style={styles.input}
                    />
                    { apiKeyTemplate()}
                </View>
                <Pressable
                    onPress={handleLogin}
                    style={styles.loginButton}
                >
                    <Text style={styles.loginButtonText}>Log In</Text>
                </Pressable>

                <View style={styles.themeSwitchContainer}>
                    <Icon
                        name="sun-o"
                        size={18}
                        color={theme === 'dark' ? '#fff' : '#000'}
                    />
                    <Switch
                        trackColor={{ false: "#767577", true: "#81b0ff" }}
                        thumbColor={theme === 'light' ? "#f4f3f4" : "#f5dd4b"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={() => getThemeContext.toggleTheme()}
                        value={theme === 'dark'}
                    />
                    <Icon
                        name="moon-o"
                        size={18}
                        color={theme === 'dark' ? '#fff' : '#000'}
                    />
                </View>
            </View>
        </View>
    );
})

const createStyles = (theme: string) => {
    return StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            padding: 16,
            backgroundColor: theme === 'light' ? '#f9f9f9' : '#121212',
        },
        containerInputs: {
            height: 150
        },
        innerContainer: {
            backgroundColor: theme === 'light' ? '#FFFFFF' : '#1E1E1E',
            borderColor: theme === 'light' ? '#000000' : '#444444',
            borderWidth: 1,
            borderRadius: 8,
            padding: 16,
            marginVertical: 8,
            shadowColor: '#000000',
            shadowOpacity: 0.2,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
        },
        themeSwitchContainer: {
            padding: 16,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center'
        },
        input: {
            borderWidth: 1,
            borderRadius: 5,
            padding: 12,
            marginVertical: 8,
            borderColor: theme === 'light' ? '#000000' : '#444444',
            shadowColor: theme === 'light' ? '#000000' : '#444444',
            color: theme === 'light' ? '#000000' : '#FFFFFF',
            shadowOpacity: 0.2,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
        },
        title: {
            marginBottom: 24,
            fontSize: 22,
            textAlign: 'center',
            color: theme === 'light' ? '#333333' : '#ffffff',
        },
        loginButton: {
            backgroundColor: '#05E6F2',
            borderRadius: 8,
            padding: 16,
            marginTop: 20,
            marginRight: 80,
            marginLeft: 80,
        },
        loginButtonText: {
            fontSize: 16,
            textAlign: 'center',
            fontWeight: 'bold',
            color: theme === 'light' ? '#333333' : '#000000',
        },
        circle: {
            width: 34,
            height: 34,
            borderRadius: 17,
            borderColor: "black",
            borderWidth: 1,
            backgroundColor: 'white',
            marginTop: -2,
            shadowColor: 'black',
            shadowOpacity: 1.0,
            shadowOffset: {
              width: 2,
              height: 2,
            },
          },
          activeContainer: {
            alignSelf: 'center',
            backgroundColor: '#05E6F2',
            flexDirection: 'row-reverse',            
            color: theme === 'light' ? '#000000' : '#666666',
          },
          label: {
            alignSelf: 'center',
            backgroundColor: 'transparent',
            flexDirection: 'row-reverse',
            paddingHorizontal: 10,
            color: theme === 'light' ? '#ffffff' : '#ffffff',
          },
          labelActive: {
            alignSelf: 'center',
            backgroundColor: 'transparent',
            flexDirection: 'row-reverse',
            paddingHorizontal: 10,
            color: theme === 'light' ? '#000000' : '#000000',
          },
          apiKeyContainer: {
            marginTop: 20,
            width: 140,
            height: 30,
            backgroundColor: theme === 'light' ? '#666666' : '#666666',
            color: theme === 'light' ? '#666666' : '#ffffff',
            alignSelf: 'center',
            flexDirection: 'row',
            overflow: 'visible',
            borderRadius: 15,
            shadowColor: 'black',
            shadowOpacity: 1.0,
            shadowOffset: {
              width: -2,
              height: 2,
            },
        },
    })
};

export default LoginScreen