import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function ClerkLayout() {
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
				tabBarActiveTintColor: '#3b82f6',
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
				name="pos"
				options={{
					title: 'POS',
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="cart" color={color} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name="products"
				options={{
					title: 'Products',
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="pricetags" color={color} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name="transactions"
				options={{
					title: 'History',
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="receipt" color={color} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name="inventory"
				options={{
					title: 'Inventory',
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="cube" color={color} size={size} />
					),
				}}
			/>
			{/* Hidden Tickets Screen */}
			<Tabs.Screen
				name="tickets"
				options={{
					title: 'Support Tickets',
					href: null,
				}}
			/>
		</Tabs>
	);
}
