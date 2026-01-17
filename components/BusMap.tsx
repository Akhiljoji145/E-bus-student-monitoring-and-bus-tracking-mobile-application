import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

interface Bus {
    id: number;
    number_plate: string;
    current_latitude: number;
    current_longitude: number;
    is_active: boolean;
}

export default function BusMap() {
    const router = useRouter();
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [buses, setBuses] = useState<Bus[]>([]);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Initial Location
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                setLoading(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
            setLoading(false);
        })();
    }, []);

    // Poll for Bus Data
    useEffect(() => {
        const fetchBuses = async () => {
            try {
                const response = await api.get('/bus/buses/');
                setBuses(response.data);
            } catch (err) {
                console.log("Error fetching buses:", err);
            }
        };

        fetchBuses();
        const interval = setInterval(fetchBuses, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#e94560" />
                <Text style={styles.text}>Locating...</Text>
            </View>
        );
    }

    if (errorMsg) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                showsUserLocation={true}
                initialRegion={{
                    latitude: location?.coords.latitude || 12.9716,
                    longitude: location?.coords.longitude || 77.5946,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
            >
                {buses.map((bus) => (
                    (bus.current_latitude && bus.current_longitude) && (
                        <Marker
                            key={bus.id}
                            coordinate={{
                                latitude: bus.current_latitude,
                                longitude: bus.current_longitude,
                            }}
                            title={`Bus: ${bus.number_plate}`}
                            description={bus.is_active ? "Active" : "Inactive"}
                            pinColor="blue"
                        />
                    )
                ))}
            </MapView>
            <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(auth)/login')}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
        alignItems: 'center',
        justifyContent: 'center',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    text: {
        color: '#fff',
        marginTop: 10,
    },
    errorText: {
        color: '#ff4444',
        fontSize: 16,
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 10,
        borderRadius: 20,
        zIndex: 10,
    },
});
