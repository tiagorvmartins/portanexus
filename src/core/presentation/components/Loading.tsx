import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

const Loading = () => (
    <View style={[styles.container, styles.horizontal]}>
        <ActivityIndicator size="large" />
    </View>
);

const styles = StyleSheet.create({
    container: {
        marginTop: 40,
        justifyContent: 'center',
    },
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
    },
});

export default Loading;