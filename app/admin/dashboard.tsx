import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function AdminDashboard() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <Text style={styles.title}>Admin Dashboard</Text>
            <Text style={styles.subtitle}>System Configuration & User Management</Text>

            <TouchableOpacity style={styles.logout} onPress={() => router.replace('/(auth)/login')}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
    subtitle: { fontSize: 16, color: '#aaa', marginBottom: 40 },
    logout: { padding: 15 },
    logoutText: { color: '#888' }
});
