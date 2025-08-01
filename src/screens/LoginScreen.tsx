import React, { useEffect, useState } from 'react';
import { View, Switch, StyleSheet, Pressable, ActivityIndicator, Platform } from 'react-native';
import { TextInput, Text } from 'react-native';
import Icon from '@expo/vector-icons/FontAwesome';
import Loading from '../components/Loading';
import Footer from '../components/Footer';
import { useLoading } from 'src/store/useLoading';
import { useAuth } from 'src/store/useAuth';
import SecureStoreEntry from 'src/enums/SecureStoreEntry';

const LoginScreen = ({ onLoginPress, navigation }: any) => {

    const {
        theme,
        haveLoginDetailsSaved,
        setProfileTheme,
        toggleThemeAndPersist,
    } = useAuth();

    const [hostUrl, setHostUrl] = useState<SecureStoreEntry>("" as SecureStoreEntry);
    const [apiKey, setApiKey] = useState<SecureStoreEntry>("" as SecureStoreEntry);

    const { loadingComponentsAmount } = useLoading()
    const styles = createStyles(theme)
        
    const handleLogin = async () => {
        onLoginPress(hostUrl, apiKey);
    };

    useEffect(() => {
        setProfileTheme(theme as SecureStoreEntry)
    }, [theme])

    return (
        <>
            {haveLoginDetailsSaved === null ?
                <View style={styles.container}>
                    <ActivityIndicator size="large" />
                </View>
                :
                <View style={styles.container}>
                    <View style={styles.innerContainer}>
                        <View style={styles.card}>
                            <Text style={styles.title}>Authentication</Text>
                            <View>
                                <TextInput
                                    multiline={Platform.OS === 'web' ? false : true}
                                    placeholder="Portainer Host URL"
                                    onChangeText={(text: string) => { setHostUrl(text.replace(/\s/g, '') as SecureStoreEntry) }}
                                    placeholderTextColor={theme === 'light' ? 'rgba(51, 51, 51, 0.5)' : 'rgba(224, 224, 224, 0.5)'}
                                    value={hostUrl}
                                    style={styles.input}
                                />
                                <TextInput
                                    multiline={Platform.OS === 'web' ? false : true}
                                    placeholder="API Key"
                                    onChangeText={(text: string) => { setApiKey(text.replace(/\s/g, '') as SecureStoreEntry) }}
                                    placeholderTextColor={theme === 'light' ? 'rgba(51, 51, 51, 0.5)' : 'rgba(224, 224, 224, 0.5)'}
                                    value={apiKey}
                                    style={styles.input}
                                />
                            </View>
                            {loadingComponentsAmount !== 0 ?
                                (<Loading />) :
                                (<Pressable
                                    onPress={handleLogin}
                                    style={styles.loginButton}
                                >
                                    <Text style={styles.loginButtonText}>Log In</Text>
                                </Pressable>)
                            }
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
                                    onValueChange={() => toggleThemeAndPersist()}
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
                    <View style={styles.footer}>
                        <Footer />
                    </View>
                </View>
            }

        </>
    );
}

const createStyles = (theme: string) => {
    return StyleSheet.create({
        container: {
            flex: 1,
            padding: 16,
            justifyContent: 'space-between',
            backgroundColor: theme === 'light' ? '#f9f9f9' : '#121212',
        },
        footer: {
            alignItems: 'center',
        },
        innerContainer: {
            marginVertical: 8,
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: 20
        },
        card: {
            backgroundColor: theme === 'light' ? '#FFFFFF' : '#1E1E1E',
            borderColor: theme === 'light' ? '#000000' : '#444444',
            borderWidth: 1,
            borderRadius: 8,
            shadowColor: '#000000',
            shadowOpacity: 0.2,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
            alignItems: 'center',
            padding: 40,
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
            textAlign: 'center',
            width: 250
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
            width: 250
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