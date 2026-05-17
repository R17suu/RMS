import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function StoreModulesGrid() {
	const router = useRouter();

	const modules = [
		{
			id: 'pos',
			title: 'Point of Sale',
			icon: 'cart-outline',
			route: '/(sadmin)/pos',
			color: '#34d399',
			bg: 'rgba(52,211,153,0.1)',
			permission: 'view_pos'
		},
		{
			id: 'products',
			title: 'Products',
			icon: 'cube-outline',
			route: '/(sadmin)/products',
			color: '#60a5fa',
			bg: 'rgba(96,165,250,0.1)',
			permission: 'view_products'
		},
		{
			id: 'inventory',
			title: 'Inventory',
			icon: 'layers-outline',
			route: '/(sadmin)/inventory',
			color: '#f59e0b',
			bg: 'rgba(245,158,11,0.1)',
			permission: 'view_inventory'
		},
		{
			id: 'draft-pos',
			title: 'Draft POs',
			icon: 'document-text-outline',
			route: '/(sadmin)/purchase-requests',
			color: '#ef4444',
			bg: 'rgba(239,68,68,0.1)',
			permission: 'view_purchase_requests'
		},
		{
			id: 'history',
			title: 'Sales History',
			icon: 'receipt-outline',
			route: '/(sadmin)/transactions',
			color: '#a855f7',
			bg: 'rgba(168,85,247,0.1)',
			permission: 'view_transactions'
		}
	];

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

	// Only show modules the user has view permission for
	const filteredModules = modules.filter(m => permissions.includes(m.permission));

	if (filteredModules.length === 0) return null;

	return (
		<View style={styles.container}>
			<Text style={styles.sectionTitle}>Store Management Modules</Text>
			<View style={styles.grid}>
				{filteredModules.map((mod) => (
					<Pressable
						key={mod.id}
						style={styles.card}
						onPress={() => router.push(mod.route)}
					>
						<View style={[styles.iconWrap, { backgroundColor: mod.bg }]}>
							<Ionicons name={mod.icon} size={26} color={mod.color} />
						</View>
						<Text style={styles.cardTitle}>{mod.title}</Text>
					</Pressable>
				))}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginBottom: 20,
	},
	sectionTitle: {
		color: '#f8fafc',
		fontSize: 16,
		fontWeight: '800',
		marginBottom: 12,
		paddingLeft: 4,
	},
	grid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		gap: 12,
	},
	card: {
		width: '48%',
		backgroundColor: 'rgba(15,23,42,0.6)',
		borderRadius: 14,
		padding: 16,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: 'rgba(129,151,186,0.15)',
	},
	iconWrap: {
		width: 50,
		height: 50,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 10,
	},
	cardTitle: {
		color: '#cbd5e1',
		fontSize: 13,
		fontWeight: '600',
		textAlign: 'center',
	},
});
