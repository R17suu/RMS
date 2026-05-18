import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function AdminLayout() {
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
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="grid" color={color} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name="pos"
				options={{
					title: 'POS',
					href: null,
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="cart" color={color} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name="products"
				options={{
					title: 'Products',
					href: null,
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="pricetags" color={color} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name="purchase-requests"
				options={{
					title: 'Draft POs',
					href: null,
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="document-text" color={color} size={size} />
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
					href: null,
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
