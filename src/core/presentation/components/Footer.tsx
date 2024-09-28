import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { useGetSettingsContext } from 'src/settings/store/useSettingsContext';

const Footer = () => {
  const appVersion = Constants.expoConfig?.version;
  const appName = Constants.expoConfig?.name;

  const getSettingsContext = useGetSettingsContext();
  const { theme } = getSettingsContext;

  const styles = createStyles(theme);

  return (
    <View style={styles.footer}>
      <Text style={styles.appName}>{appName}</Text>
      <Text style={styles.version}>{appVersion}</Text>
    </View>
  );
};

const createStyles = (theme: string) => {
    return StyleSheet.create({
        footer: {
            padding: 2,
            alignItems: 'center',
            borderTopWidth: 1,
            position: 'relative',
            backgroundColor: theme === 'dark' ? '#121212' : '#f8f9fa',
            borderTopColor: theme === 'dark' ? '#444' : '#ccc'
        },
        appName: {
            fontSize: 16,
            fontWeight: 'bold',
            color: theme === 'dark' ? '#fff' : '#000'
        },
        version: {
            fontSize: 12,
            color: theme === 'dark' ? '#bbb' : '#555'
        },
    });
};

export default Footer;