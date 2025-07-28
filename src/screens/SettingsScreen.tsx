import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AppHeader from '../components/AppHeader';

import Footer from '../components/Footer';

import { useAuth } from 'src/store/useAuth';
import SecureStoreEntry from 'src/enums/SecureStoreEntry';

const SettingsScreen = ({navigation}: any) => {

    
    const { theme, logsSince, logsRefreshInterval, logsMaxLines, setRefreshInterval, setLogsMaxLines, setLogsSince, getLogsMaxLines, getLogsSince, getRefreshInterval } = useAuth();
    const styles = createStyles(theme);

    const [refreshTime, setRefreshTime] = useState<string|null>(null);
    const [logDuration, setLogDuration] = useState<string|null>(null);
    const [logMaxLines, setLogMaxLines] = useState<string|null>(null);

    useEffect(() => {
        const loadSettings = async () => {
          try {
            await Promise.all([
              getLogsMaxLines(),
              getLogsSince(),
              getRefreshInterval(),
            ]);
          } catch (err) {
            console.error("Error loading preferences:", err);
          }
        };
    
        loadSettings();
    }, []);

    useEffect(() => {
        setLogDuration(logsSince.toString())
    }, [logsSince]);

    useEffect(() => {
        setRefreshTime(logsRefreshInterval.toString())
    }, [logsRefreshInterval]);

    useEffect(() => {
        setLogMaxLines(logsMaxLines.toString())
    }, [logsMaxLines]);

    const saveRefreshTime = async (itemValue: string) => {
        await setRefreshInterval(itemValue as SecureStoreEntry)
        setRefreshTime(itemValue)
    };

    const saveLogDuration = async (itemValue: string) => {
        await setLogsSince(itemValue as SecureStoreEntry)
        setLogDuration(itemValue)
    };

    const saveMaxLogLines = async (itemValue: string) => {
        await setLogsMaxLines(itemValue as SecureStoreEntry)
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
};

const createStyles = (theme: string) => {
    return StyleSheet.create({
        container: {
            backgroundColor: theme === 'light' ? '#f9f9f9' : '#121212',
            flex: 1,
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
