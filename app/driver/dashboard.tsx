import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import api from '../../services/api';

export default function DriverDashboard() {
    const router = useRouter();
    const [isTracking, setIsTracking] = useState(false);
    const [status, setStatus] = useState('Idle');
    const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);

    // Ref for location subscription to ensure cleanup works even in closures
    const locationSubscription = useRef<Location.LocationSubscription | null>(null);

    useEffect(() => {
        fetchRoute();
        // Cleanup on unmount
        return () => {
            if (locationSubscription.current) {
                locationSubscription.current.remove();
            }
        };
    }, []);

    const fetchRoute = async () => {
        try {
            const response = await api.get('/bus/buses/my_bus/');
            const busData = response.data;
            if (busData.route_details && busData.route_details.stops) {
                const coords = busData.route_details.stops.map((stop: any) => ({
                    latitude: stop.stop.latitude,
                    longitude: stop.stop.longitude,
                }));
                setRouteCoordinates(coords);
            }
        } catch (error) {
            console.log('Failed to fetch route:', error);
            // Non-blocking error, just won't show route
        }
    };

    const sendLocationUpdate = async (latitude: number, longitude: number) => {
        try {
            await api.post('/bus/buses/update_location/', {
                latitude,
                longitude,
                is_active: true
            });
            setCurrentLocation({ latitude, longitude });
            setStatus(`Live: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        } catch (error) {
            console.error('Failed to update location:', error);
            setStatus('Error updating server');
        }
    };

    const startTracking = async () => {
        setStatus('Acquiring GPS...');
        setIsTracking(true);

        try {
            const { status: permStatus } = await Location.requestForegroundPermissionsAsync();
            if (permStatus !== 'granted') {
                Alert.alert('Permission Denied', 'Allow location access to share your live position.');
                setIsTracking(false);
                setStatus('Permission Denied');
                return;
            }

            const sub = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 5000, // Update every 5 seconds
                    distanceInterval: 10, // Or every 10 meters
                },
                (location) => {
                    const { latitude, longitude } = location.coords;
                    // Update server and local state
                    sendLocationUpdate(latitude, longitude);
                }
            );
            locationSubscription.current = sub;

        } catch (e) {
            console.log("Error starting tracking", e);
            setStatus('GPS Error');
            setIsTracking(false);
        }
    };

    const stopTracking = async () => {
        if (locationSubscription.current) {
            locationSubscription.current.remove();
            locationSubscription.current = null;
        }

        setIsTracking(false);
        setStatus('Trip Ended. Idle.');
    };

    const handleLogout = () => {
        stopTracking();
        router.replace('/(auth)/login');
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <Text style={styles.title}>Driver Dashboard</Text>

            <View style={styles.statusContainer}>
                <View style={[styles.indicator, { backgroundColor: isTracking ? '#4caf50' : '#f44336' }]} />
                <Text style={styles.subtitle}>{status}</Text>
            </View>

            {!isTracking ? (
                <TouchableOpacity style={[styles.button, styles.startButton]} onPress={startTracking}>
                    <Text style={styles.buttonText}>START TRIP</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={stopTracking}>
                    <Text style={styles.buttonText}>STOP TRIP</Text>
                </TouchableOpacity>
            )}

            {/* Live Map Visualization */}
            <View style={styles.mapContainer}>
                <MapView
                    style={styles.map}
                    provider={PROVIDER_GOOGLE}
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                    region={currentLocation ? {
                        latitude: currentLocation.latitude,
                        longitude: currentLocation.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    } : {
                        latitude: 12.9716,
                        longitude: 77.5946,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                    }}
                >
                    {routeCoordinates.length > 0 && (
                        <Polyline
                            coordinates={routeCoordinates}
                            strokeColor="#4caf50"
                            strokeWidth={4}
                        />
                    )}

                    {currentLocation && (
                        <Marker
                            coordinate={currentLocation}
                            title="My Bus"
                            pinColor="green"
                        />
                    )}
                </MapView>
            </View>

            <TouchableOpacity style={styles.logout} onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
    statusContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, backgroundColor: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 10, width: '100%', justifyContent: 'center' },
    indicator: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
    subtitle: { fontSize: 16, color: '#e0e0e0' },
    button: { padding: 15, borderRadius: 10, width: '100%', alignItems: 'center', marginBottom: 15, elevation: 5 },
    startButton: { backgroundColor: '#4caf50' },
    stopButton: { backgroundColor: '#f44336' },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 },
    logout: { padding: 10, marginTop: 10 },
    logoutText: { color: '#888', fontSize: 14 },
    mapContainer: { width: '100%', height: 300, borderRadius: 15, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    map: { width: '100%', height: '100%' }
});
