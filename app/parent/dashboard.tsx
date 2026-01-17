import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import LiveTrackingMap from '../../components/LiveTrackingMap';

export default function ParentDashboard() {
    const router = useRouter();
    // In a real app, we would fetch the student's assigned bus ID from the backend.
    // For demo purposes, we'll assume Bus ID 1.
    const studentBusId = 1;

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <Text style={styles.title}>Parent Dashboard</Text>
            <Text style={styles.subtitle}>Tracking: John Doe (Student)</Text>

            <View style={styles.mapContainer}>
                <LiveTrackingMap busId={studentBusId} />
            </View>

            <TouchableOpacity style={styles.logout} onPress={() => router.replace('/(auth)/login')}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1a1a2e', padding: 20, paddingTop: 60 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 10, alignSelf: 'center' },
    subtitle: { fontSize: 16, color: '#aaa', marginBottom: 20, alignSelf: 'center' },
    mapContainer: { flex: 1, width: '100%', borderRadius: 20, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    logout: { padding: 15, alignSelf: 'center' },
    logoutText: { color: '#888' }
});
