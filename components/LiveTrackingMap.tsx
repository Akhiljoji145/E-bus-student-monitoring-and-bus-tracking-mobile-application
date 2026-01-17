import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import api from '../services/api';

interface LiveTrackingMapProps {
    busId: number;
    initialLatitude?: number;
    initialLongitude?: number;
}

export default function LiveTrackingMap({ busId, initialLatitude, initialLongitude }: LiveTrackingMapProps) {
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(
        initialLatitude && initialLongitude ? { latitude: initialLatitude, longitude: initialLongitude } : null
    );
    const [loading, setLoading] = useState(!initialLatitude);
    const mapRef = useRef<MapView>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const fetchLocation = async () => {
        try {
            const response = await api.get(`/bus/buses/${busId}/`);
            const { current_latitude, current_longitude, is_active } = response.data;

            if (current_latitude && current_longitude) {
                const newLocation = { latitude: current_latitude, longitude: current_longitude };
                setLocation(newLocation);

                // Animate map to new location
                /*
                mapRef.current?.animateToRegion({
                    ...newLocation,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }, 1000);
                */
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching bus location:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLocation();
        // Poll every 5 seconds
        intervalRef.current = setInterval(fetchLocation, 5000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [busId]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4caf50" />
                <Text style={styles.text}>Locating Bus...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={location ? {
                    ...location,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                } : {
                    latitude: 12.9716, // Default fallback (e.g., city center)
                    longitude: 77.5946,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
            >
                {location && (
                    <Marker
                        coordinate={location}
                        title="Live Bus Location"
                        pinColor="green"
                    />
                )}
            </MapView>
            {!location && (
                <View style={styles.overlay}>
                    <Text style={styles.overlayText}>Waiting for live location...</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: 15,
        overflow: 'hidden',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
    },
    text: {
        color: '#fff',
        marginTop: 10,
    },
    overlay: {
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 10,
        borderRadius: 8,
    },
    overlayText: {
        color: '#fff',
        fontSize: 12,
    }
});
