import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import AppCard from '../AppCard';

export default function AdminQuickActions({ onNavigate }) {
	const actions = [
		{ key: 'purchase-requests', label: 'Review PRs', icon: 'document-text-outline', color: '#f59e0b', bg: 'rgba(245,158,11,0.14)' },
		{ key: 'products', label: 'Catalog', icon: 'pricetag-outline', color: '#60a5fa', bg: 'rgba(96,165,250,0.14)' },
		{ key: 'inventory', label: 'Inventory', icon: 'cube-outline', color: '#34d399', bg: 'rgba(52,211,153,0.14)' },
		{ key: 'pos', label: 'Sell Item', icon: 'cart-outline', color: '#a78bfa', bg: 'rgba(167,139,250,0.14)' },
	];

	return (
		<AppCard style={styles.card}>
			<Text style={styles.title}>Quick Actions</Text>
			<View style={styles.actionsRow}>
				{actions.map((action) => (
					<Pressable
						key={action.key}
						style={styles.actionButton}
						onPress={() => onNavigate(action.key)}
					>
						<View style={[styles.actionIconWrap, { backgroundColor: action.bg }]}>
							<Ionicons name={action.icon} size={22} color={action.color} />
						</View>
						<Text style={styles.actionLabel}>{action.label}</Text>
					</Pressable>
				))}
			</View>
		</AppCard>
	);
}

const styles = StyleSheet.create({
	card: {
		width: '100%',
		maxWidth: '100%',
		alignSelf: 'stretch',
		borderRadius: 18,
		paddingHorizontal: 14,
		paddingVertical: 16,
		backgroundColor: 'rgba(18,26,53,0.95)',
		borderColor: 'rgba(115,137,172,0.22)',
	},
	title: {
		color: '#f3f6ff',
		fontSize: 15,
		fontWeight: '800',
		marginBottom: 14,
	},
	actionsRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	actionButton: {
		alignItems: 'center',
		gap: 8,
		flex: 1,
	},
	actionIconWrap: {
		width: 48,
		height: 48,
		borderRadius: 14,
		alignItems: 'center',
		justifyContent: 'center',
	},
	actionLabel: {
		color: '#9bb0cc',
		fontSize: 11,
		fontWeight: '700',
		textAlign: 'center',
	},
});
