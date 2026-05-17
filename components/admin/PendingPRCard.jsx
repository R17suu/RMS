import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, Pressable } from 'react-native';

export default function PendingPRCard({ pr, onReview }) {
	const formatDate = (timestamp) => {
		if (!timestamp) return 'N/A';
		const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	const totalItems = pr.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

	return (
		<Pressable style={styles.card} onPress={() => onReview(pr)}>
			<View style={styles.topRow}>
				<View style={styles.iconWrap}>
					<Ionicons name="document-text-outline" size={20} color="#f59e0b" />
				</View>
				<View style={styles.textWrap}>
					<View style={styles.titleRow}>
						<Text style={styles.prTitle}>PR #{pr.id.slice(0, 8).toUpperCase()}</Text>
						<View style={styles.statusBadge}>
							<Text style={styles.statusText}>PENDING</Text>
						</View>
					</View>
					<Text style={styles.dateText}>{formatDate(pr.createdAt)}</Text>
					<Text style={styles.paymentText}>Clerk: {pr.clerkName || pr.clerkId}</Text>
				</View>
				<Text style={styles.totalAmount}>₱{parseFloat(pr.totalAmount).toFixed(2)}</Text>
			</View>

			<View style={styles.itemsList}>
				{pr.items?.slice(0, 2).map((item, index) => (
					<View key={index} style={styles.itemRow}>
						<Text style={styles.itemQuantity}>{item.quantity}x</Text>
						<Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
					</View>
				))}
				{pr.items?.length > 2 && (
					<Text style={styles.moreItemsText}>+ {pr.items.length - 2} more items</Text>
				)}
			</View>

			<View style={styles.footerRow}>
				<Text style={styles.footerText}>{totalItems} Total Items</Text>
				<View style={styles.reviewBtn}>
					<Text style={styles.reviewBtnText}>Review PR</Text>
					<Ionicons name="chevron-forward" size={14} color="#f59e0b" />
				</View>
			</View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: 'rgba(12,22,44,0.72)',
		borderRadius: 14,
		borderWidth: 1,
		borderColor: 'rgba(245,158,11,0.3)',
		padding: 14,
		gap: 10,
	},
	topRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
	},
	iconWrap: {
		width: 38,
		height: 38,
		borderRadius: 10,
		backgroundColor: 'rgba(245,158,11,0.15)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	textWrap: {
		flex: 1,
	},
	prTitle: {
		color: '#f2f6ff',
		fontSize: 14,
		fontWeight: '700',
	},
	titleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingRight: 8,
	},
	statusBadge: {
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 4,
		borderWidth: 1,
		backgroundColor: 'rgba(251,191,36,0.1)',
		borderColor: 'rgba(251,191,36,0.3)',
	},
	statusText: {
		fontSize: 10,
		fontWeight: '700',
		color: '#fbbf24',
	},
	dateText: {
		color: '#7f95b7',
		fontSize: 12,
		marginTop: 2,
	},
	paymentText: {
		color: '#60a5fa',
		fontSize: 11,
		marginTop: 2,
		fontWeight: '600',
	},
	totalAmount: {
		color: '#f59e0b',
		fontSize: 16,
		fontWeight: '800',
	},
	itemsList: {
		paddingLeft: 48,
		gap: 4,
	},
	itemRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	itemQuantity: {
		color: '#60a5fa',
		fontSize: 12,
		fontWeight: '700',
		width: 20,
	},
	itemName: {
		color: '#c8d8f0',
		fontSize: 12,
		flex: 1,
	},
	moreItemsText: {
		color: '#667693',
		fontSize: 11,
		fontStyle: 'italic',
		marginTop: 2,
	},
	footerRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingLeft: 48,
		marginTop: 4,
		borderTopWidth: 1,
		borderTopColor: 'rgba(129,151,186,0.15)',
		paddingTop: 8,
	},
	footerText: {
		color: '#667693',
		fontSize: 11,
		fontWeight: '700',
	},
	reviewBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	reviewBtnText: {
		color: '#f59e0b',
		fontSize: 12,
		fontWeight: '700',
	},
});
