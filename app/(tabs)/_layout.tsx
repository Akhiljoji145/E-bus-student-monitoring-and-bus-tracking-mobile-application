import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#1a1a2e',
                    borderTopColor: 'rgba(255,255,255,0.1)',
                },
                tabBarActiveTintColor: '#e94560',
                tabBarInactiveTintColor: '#888',
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Track',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="map" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
