import React, { useEffect } from 'react';
import { View, Switch, StyleSheet, Image } from 'react-native';
import Icon from '@expo/vector-icons/FontAwesome';
import { useGetThemeContext } from 'src/theme/store/useThemeContext';
import { useAuthContext } from 'src/core/stores/auth/useAuthContext';
import SecureStoreEntry from 'src/core/domain/enums/SecureStoreEntry';

const Header = () => {
    const authContext = useAuthContext();
    const getThemeContext = useGetThemeContext();
    const { theme } = getThemeContext;
    const styles = createStyles(theme);

    useEffect(() => {
        authContext.setProfileTheme(theme as SecureStoreEntry)
    }, [authContext, theme])

    return (
        <View style={styles.headerContainer}>
            
            <Image style={styles.logo} source={theme === 'light' ? require('src/core/presentation/images/porta-nexus-light.png') : require('src/core/presentation/images/porta-nexus-dark.png')} />
            <View style={styles.headerContainer}>
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
    );
};

const createStyles = (theme: string) => {
    return StyleSheet.create({
        headerContainer: {
            backgroundColor: theme === 'light' ? '#f9f9f9' : '#121212',
            padding: 16,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        button: {
            alignItems: 'center',
            backgroundColor: theme === 'light' ? '#f9f9f9' : '#121212',
            padding: 10,
        },
        logo: {
            width: 150,
            height: 80,
        },
        container: {
            flex: 1,
            backgroundColor: theme === 'light' ? '#f9f9f9' : '#121212',
            padding: 16
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginBottom: 16
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
    });
};

export default Header

