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
		</Tabs>
	);
}
