import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import LiveTrackingMap from '../../components/LiveTrackingMap';

const { width } = Dimensions.get('window');

interface Bus {
    id: number;
    number_plate: string;
    is_active: boolean;
    driver: number | null;
    route_details: {
        name: string;
    }
}

export default function ManagementDashboard() {
    const router = useRouter();
    const [buses, setBuses] = useState<Bus[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        name: '',
        total_members: 0,
        students: 0,
        drivers: 0,
        teachers: 0,
        parents: 0
    });

    const fetchDashboardData = async () => {
        try {
            const busesRes = await api.get('/bus/buses/');
            setBuses(busesRes.data);

            const statsRes = await api.get('/auth/management/stats/');
            setStats(statsRes.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchDashboardData();
        setRefreshing(false);
    }, []);

    const [selectedBus, setSelectedBus] = useState<Bus | null>(null);

    const onBusPress = (bus: Bus) => {
        setSelectedBus(bus);
    };

    const closeMap = () => {
        setSelectedBus(null);
    };

    const activeBuses = buses?.filter(b => b.is_active).length || 0;
    const totalBuses = buses?.length || 0;

    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Background Decoration */}
            <View style={styles.bgCircle1} />
            <View style={styles.bgCircle2} />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>{getTimeGreeting()},</Text>
                    <Text style={styles.userName}>{stats.name || 'Manager'}</Text>
                </View>
                <TouchableOpacity style={styles.profileButton} onPress={() => router.replace('/(auth)/login')}>
                    <Ionicons name="log-out-outline" size={28} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e94560" />}
                showsVerticalScrollIndicator={false}
            >
                {/* Stats Overview Gradient Card */}
                <View style={styles.overviewCard}>
                    <View style={styles.overviewRow}>
                        <View>
                            <Text style={styles.overviewLabel}>Total Members</Text>
                            <Text style={styles.overviewValue}>{stats.total_members}</Text>
                        </View>
                        <View style={styles.iconCircle}>
                            <Ionicons name="people" size={24} color="#fff" />
                        </View>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{stats.students}</Text>
                            <Text style={styles.statLabel}>Students</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{stats.drivers}</Text>
                            <Text style={styles.statLabel}>Drivers</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{stats.parents}</Text>
                            <Text style={styles.statLabel}>Parents</Text>
                        </View>
                    </View>
                </View>

                {/* Fleet Overview */}
                <Text style={styles.sectionTitle}>Fleet Overview</Text>
                <View style={styles.fleetGrid}>
                    <View style={[styles.fleetCard, styles.activeCard]}>
                        <Ionicons name="pulse" size={24} color="#4caf50" />
                        <Text style={styles.fleetValue}>{activeBuses}</Text>
                        <Text style={styles.fleetLabel}>Active</Text>
                    </View>
                    <View style={styles.fleetCard}>
                        <Ionicons name="bus" size={24} color="#fff" />
                        <Text style={styles.fleetValue}>{totalBuses}</Text>
                        <Text style={styles.fleetLabel}>Total Buses</Text>
                    </View>
                </View>

                {/* Bus List */}
                <View style={styles.listHeader}>
                    <Text style={styles.sectionTitle}>Live Fleet Status</Text>
                    {/* <TouchableOpacity>
                        <Text style={styles.seeAll}>See All</Text>
                    </TouchableOpacity> */}
                </View>

                <View style={styles.listContainer}>
                    {buses.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="bus-outline" size={48} color="#666" />
                            <Text style={styles.emptyStateText}>No buses assigned yet.</Text>
                        </View>
                    ) : (
                        buses.map((bus) => (
                            <TouchableOpacity key={bus.id} style={styles.busCard} onPress={() => onBusPress(bus)}>
                                <View style={styles.busCardLeft}>
                                    <View style={[styles.busIcon, { backgroundColor: bus.is_active ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255, 255, 255, 0.05)' }]}>
                                        <Ionicons name="bus" size={24} color={bus.is_active ? '#4caf50' : '#888'} />
                                    </View>
                                    <View>
                                        <Text style={styles.busPlate}>{bus.number_plate}</Text>
                                        <Text style={styles.busRoute}>{bus.route_details?.name || 'No Route Assigned'}</Text>
                                    </View>
                                </View>
                                <View style={styles.busCardRight}>
                                    <View style={[styles.statusDot, { backgroundColor: bus.is_active ? '#4caf50' : '#f44336' }]} />
                                    <Ionicons name="chevron-forward" size={20} color="#666" />
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Tracking Modal */}
            {selectedBus && (
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalBackdrop} onPress={closeMap} />
                    <View style={styles.modalContent}>
                        <View style={styles.modalIndicator} />
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>{selectedBus.number_plate}</Text>
                                <Text style={styles.modalSubtitle}>{selectedBus.is_active ? 'Currently Active' : 'Offline'}</Text>
                            </View>
                            <TouchableOpacity style={styles.closeButton} onPress={closeMap}>
                                <Ionicons name="close" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.mapWrapper}>
                            <LiveTrackingMap busId={selectedBus.id} />
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    bgCircle1: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: 'rgba(233, 69, 96, 0.1)',
    },
    bgCircle2: {
        position: 'absolute',
        top: 100,
        left: -150,
        width: 400,
        height: 400,
        borderRadius: 200,
        backgroundColor: 'rgba(15, 52, 96, 0.3)',
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greeting: {
        fontSize: 16,
        color: '#ccc',
        fontFamily: 'System',
    },
    userName: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 4,
    },
    profileButton: {
        padding: 4,
    },
    scrollContent: {
        padding: 24,
        paddingTop: 10,
    },
    overviewCard: {
        backgroundColor: '#16213e',
        borderRadius: 24,
        padding: 24,
        marginBottom: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    overviewRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    overviewLabel: {
        fontSize: 14,
        color: '#a0a0a0',
        marginBottom: 4,
    },
    overviewValue: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
    },
    iconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#e94560',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    statLabel: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 16,
    },
    fleetGrid: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 32,
    },
    fleetCard: {
        flex: 1,
        backgroundColor: '#16213e',
        padding: 20,
        borderRadius: 20,
        alignItems: 'flex-start',
        borderLeftWidth: 4,
        borderLeftColor: '#666',
    },
    activeCard: {
        borderLeftColor: '#4caf50',
    },
    fleetValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 12,
    },
    fleetLabel: {
        fontSize: 12,
        color: '#ccc',
        marginTop: 4,
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    seeAll: {
        color: '#e94560',
        fontSize: 14,
        fontWeight: 'bold',
    },
    listContainer: {
        gap: 12,
    },
    busCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#16213e',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.02)',
    },
    busCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    busIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    busPlate: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    busRoute: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    busCardRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
        opacity: 0.5,
    },
    emptyStateText: {
        color: '#fff',
        marginTop: 12,
        fontSize: 14,
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'flex-end',
        zIndex: 1000,
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modalContent: {
        height: '85%',
        backgroundColor: '#16213e',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        overflow: 'hidden',
    },
    modalIndicator: {
        width: 40,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
    },
    modalHeader: {
        padding: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#4caf50',
        marginTop: 4,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mapWrapper: {
        flex: 1,
        backgroundColor: '#000',
    }
});
