import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AppHeader from '../components/AppHeader';
import { useGetSettingsContext } from 'src/settings/store/useSettingsContext';
import { useAuthContext } from 'src/core/stores/auth/useAuthContext';
import SecureStoreEntry from 'src/core/domain/enums/SecureStoreEntry';
import { observer } from 'mobx-react';
import Footer from '../components/Footer';

const SettingsScreen = observer(({navigation}: any) => {

    const getSettingsContext = useGetSettingsContext();
    const { theme, logsSince, logsInterval, logsMaxLines } = getSettingsContext;
    const styles = createStyles(theme);

    const authContext = useAuthContext();

    const [refreshTime, setRefreshTime] = useState(logsInterval.toString());
    const [logDuration, setLogDuration] = useState(logsSince.toString());
    const [logMaxLines, setLogMaxLines] = useState(logsMaxLines.toString());

    const saveRefreshTime = (itemValue: string) => {
        authContext.setRefreshInterval(itemValue as SecureStoreEntry)
        getSettingsContext.setLogsInterval(parseInt(itemValue, 10))
        setRefreshTime(itemValue)
    };

    const saveLogDuration = (itemValue: string) => {
        authContext.setLogsSince(itemValue as SecureStoreEntry)
        getSettingsContext.setLogsSince(parseInt(itemValue, 10))
        setLogDuration(itemValue)
    };

    const saveMaxLogLines = (itemValue: string) => {
        authContext.setLogsSince(itemValue as SecureStoreEntry)
        getSettingsContext.setLogsMaxLines(parseInt(itemValue, 10))
        setLogMaxLines(itemValue)
    }

    return (
        <View style={styles.container}>
            <AppHeader navigation={navigation} />
            <View style={styles.centered}>
                <Text style={styles.title}>Logs Refresh Interval</Text>
                <View
                    style={{
                        width: 200,
                        height: 50,
                        overflow: 'hidden',
                        borderColor: theme === 'dark' ? '#f9f9f9' : '#121212',
                        borderWidth: 1,
                        borderRadius: 8,
                        marginBottom: 22,
                    }}>
                    <Picker
                        dropdownIconColor={theme === 'dark' ? '#f9f9f9' : '#121212'}
                        selectedValue={refreshTime}
                        onValueChange={(itemValue) => saveRefreshTime(itemValue)}
                        style={styles.picker}
                    >
                        <Picker.Item label="1 second" value="1000" />
                        <Picker.Item label="5 seconds" value="5000" />
                        <Picker.Item label="10 seconds" value="10000" />
                    </Picker>
                </View>

                <Text style={styles.title}>Logs Since</Text>
                <View
                    style={{
                        width: 200,
                        height: 50,
                        overflow: 'hidden',
                        borderColor: theme === 'dark' ? '#f9f9f9' : '#121212',
                        borderWidth: 1,
                        borderRadius: 8,
                        marginBottom: 22,
                    }}>
                    <Picker
                        dropdownIconColor={theme === 'dark' ? '#f9f9f9' : '#121212'}
                        selectedValue={logDuration}
                        onValueChange={(itemValue) => saveLogDuration(itemValue)}
                        style={styles.picker}
                    >
                        <Picker.Item label="1 minute ago" value="60000" />
                        <Picker.Item label="10 minutes ago" value="600000" />
                        <Picker.Item label="1 hour ago" value="3600000" />
                        <Picker.Item label="all" value="0" />
                    </Picker>
                </View>

                <Text style={styles.title}>Max Log Lines</Text>
                <View
                    style={{
                        width: 200,
                        height: 50,
                        overflow: 'hidden',
                        borderColor: theme === 'dark' ? '#f9f9f9' : '#121212',
                        borderWidth: 1,
                        borderRadius: 8,
                        marginBottom: 22,
                    }}>
                    <Picker
                        dropdownIconColor={theme === 'dark' ? '#f9f9f9' : '#121212'}
                        selectedValue={logMaxLines}
                        onValueChange={(itemValue) => saveMaxLogLines(itemValue)}
                        style={styles.picker}
                    >
                        <Picker.Item label="50 lines" value="50" />
                        <Picker.Item label="100 lines" value="100" />
                        <Picker.Item label="1000 lines" value="1000" />
                        <Picker.Item label="all" value="0" />
                    </Picker>
                </View>
            </View>
            <Footer />
        </View>
    );
});

const createStyles = (theme: string) => {
    return StyleSheet.create({
        container: {
            backgroundColor: theme === 'light' ? '#f9f9f9' : '#121212',
            flex: 1,
            padding: 16,
        },
        centered: {
            backgroundColor: theme === 'light' ? '#f9f9f9' : '#121212',
            alignItems: "center",
            flex: 1,
        },
        title: {
            fontSize: 18,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 16,
            backgroundColor: theme === 'light' ? '#f9f9f9' : '#121212',
            color: theme === 'light' ? '#333333' : '#e0e0e0',
        },
        headerText: {
            fontSize: 24,
            fontWeight: 'bold',
            color: theme === 'light' ? '#333333' : '#e0e0e0',
        },
        picker: {
            height: 50,
            width: 200,
            color: theme === 'light' ? '#333333' : '#e0e0e0',
            backgroundColor: theme === 'light' ? '#f9f9f9' : '#121212',
        },
    });
};

export default SettingsScreen;
