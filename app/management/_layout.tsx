import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ManagementLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#16213e',
                    borderTopColor: 'rgba(255,255,255,0.1)',
                },
                tabBarActiveTintColor: '#e94560',
                tabBarInactiveTintColor: '#666',
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Overview',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="grid-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="add-member"
                options={{
                    title: 'Add Member',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-add" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
