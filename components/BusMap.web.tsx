import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export default function BusMap() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Map Unavailable on Web</Text>
            <Text style={styles.text}>Please use the Android Emulator or Expo Go on your phone to view the real-time map.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#e94560',
        marginBottom: 10,
    },
    text: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
    },
});
