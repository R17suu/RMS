import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

export default function RestockCard({ restock }) {
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

	return (
		<View style={styles.card}>
			<View style={styles.topRow}>
				<View style={styles.iconWrap}>
					<Ionicons name="cube-outline" size={20} color="#fbbf24" />
				</View>
				<View style={styles.textWrap}>
					<Text style={styles.productName}>{restock.productName}</Text>
					<Text style={styles.dateText}>{formatDate(restock.createdAt)}</Text>
				</View>
				<View style={styles.quantityBadge}>
					<Text style={styles.quantityText}>+{restock.quantityAdded}</Text>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: 'rgba(12,22,44,0.72)',
		borderRadius: 14,
		borderWidth: 1,
		borderColor: 'rgba(129,151,186,0.18)',
		padding: 14,
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
		backgroundColor: 'rgba(251,191,36,0.14)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	textWrap: {
		flex: 1,
	},
	productName: {
		color: '#f2f6ff',
		fontSize: 14,
		fontWeight: '700',
	},
	dateText: {
		color: '#7f95b7',
		fontSize: 12,
		marginTop: 2,
	},
	quantityBadge: {
		backgroundColor: 'rgba(52,211,153,0.15)',
		borderWidth: 1,
		borderColor: 'rgba(52,211,153,0.3)',
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 6,
	},
	quantityText: {
		color: '#34d399',
		fontSize: 14,
		fontWeight: '800',
	},
});
