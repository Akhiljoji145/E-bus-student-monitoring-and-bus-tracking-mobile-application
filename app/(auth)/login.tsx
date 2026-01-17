import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

const ROLES = [
    { label: 'Student', value: 'student' },
    { label: 'Parent', value: 'parent' },
    { label: 'Teacher', value: 'teacher' },
    { label: 'Driver', value: 'driver' },
    { label: 'Management', value: 'management' },
    { label: 'Admin', value: 'admin' },
];

export default function LoginScreen() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/login/', {
                email: username, // Serialization expects 'email' key since USERNAME_FIELD = 'email'
                password,
            });

            const userRole = response.data.role;

            // Save tokens
            if (response.data.access) {
                await AsyncStorage.setItem('accessToken', response.data.access);
            }
            if (response.data.refresh) {
                await AsyncStorage.setItem('refreshToken', response.data.refresh);
            }

            // Role-based navigation
            switch (userRole) {
                case 'student':
                    router.replace('/(tabs)');
                    break;
                case 'management':
                    router.replace('/management/dashboard');
                    break;
                case 'driver':
                    router.replace('/driver/dashboard');
                    break;
                case 'teacher':
                    router.replace('/teacher/dashboard');
                    break;
                case 'parent':
                    router.replace('/parent/dashboard');
                    break;
                case 'admin':
                    router.replace('/admin/dashboard');
                    break;
                default:
                    Alert.alert('Error', 'Unknown role');
                    return;
            }

            // Alert.alert('Success', `Logged in as ${userRole}`); // Optional success message

        } catch (error: any) {
            console.error(error);
            Alert.alert('Login Failed', error.response?.data?.detail || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <StatusBar style="light" />
            <View style={styles.content}>
                <Text style={styles.title}>College Bus</Text>
                <Text style={styles.subtitle}>Welcome Back</Text>

                <View style={styles.form}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        placeholderTextColor="#666"
                        value={username} // Keeping variable name 'username' for state to minimize diff, but it holds email
                        onChangeText={setUsername}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your password"
                        placeholderTextColor="#666"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
                        <Text style={styles.loginButtonText}>{loading ? 'Logging in...' : 'Login'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
        justifyContent: 'center',
    },
    content: {
        padding: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#a0a0a0',
        textAlign: 'center',
        marginBottom: 32,
    },
    form: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    label: {
        color: '#fff',
        fontSize: 14,
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 8,
        padding: 16,
        color: '#fff',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    loginButton: {
        backgroundColor: '#0f3460',
        padding: 16,
        borderRadius: 8,
        marginTop: 32,
        alignItems: 'center',
    },
    loginButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
