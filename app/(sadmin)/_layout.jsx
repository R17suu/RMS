import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function SuperAdminLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				headerStyle: { backgroundColor: '#07132f' },
				headerTintColor: '#f7f9ff',
				headerTitleStyle: { fontWeight: '700' },
				tabBarStyle: {
					backgroundColor: '#07132f',
					borderTopColor: '#1b2f57',
				},
				tabBarActiveTintColor: '#f59e0b',
				tabBarInactiveTintColor: '#8da2c0',
				sceneStyle: { backgroundColor: '#040b1f' },
			}}
		>
			<Tabs.Screen
				name="dashboard"
				options={{
					title: 'Dashboard',
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="grid" color={color} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name="user"
				options={{
					title: 'User Management',
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="people" color={color} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name="role"
				options={{
					title: 'Role Management',
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="shield-checkmark" color={color} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name="tickets"
				options={{
					title: 'Tickets',
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="bug" color={color} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name="logs"
				options={{
					title: 'Logs',
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="document-text" color={color} size={size} />
					),
				}}
			/>
		</Tabs>
	);
}
