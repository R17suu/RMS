import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SuperAdminLayout() {
	const [permissions, setPermissions] = useState([]);

	useEffect(() => {
		const loadPermissions = async () => {
			try {
				const perms = await AsyncStorage.getItem('user_permissions');
				if (perms) setPermissions(JSON.parse(perms));
			} catch (e) {
				console.error(e);
			}
		};
		loadPermissions();
	}, []);

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
					paddingBottom: 12,
					height: 64,
					paddingTop: 8,
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
					href: permissions.includes('view_dashboard') ? undefined : null,
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="grid" color={color} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name="user"
				options={{
					title: 'User Management',
					href: permissions.includes('view_users') ? undefined : null,
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="people" color={color} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name="role"
				options={{
					title: 'Role Management',
					href: permissions.includes('view_roles') ? undefined : null,
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="shield-checkmark" color={color} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name="tickets"
				options={{
					title: 'Tickets',
					href: permissions.includes('view_tickets') ? undefined : null,
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="bug" color={color} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name="logs"
				options={{
					title: 'Logs',
					href: permissions.includes('view_logs') ? undefined : null,
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="document-text" color={color} size={size} />
					),
				}}
			/>
			{/* Hidden Store Management Screens */}
			<Tabs.Screen
				name="pos"
				options={{
					title: 'Point of Sale',
					href: null,
				}}
			/>
			<Tabs.Screen
				name="products"
				options={{
					title: 'Products',
					href: null,
				}}
			/>
			<Tabs.Screen
				name="inventory"
				options={{
					title: 'Inventory',
					href: null,
				}}
			/>
			<Tabs.Screen
				name="purchase-requests"
				options={{
					title: 'Draft POs',
					href: null,
				}}
			/>
			<Tabs.Screen
				name="transactions"
				options={{
					title: 'Sales History',
					href: null,
				}}
			/>
		</Tabs>
	);
}
