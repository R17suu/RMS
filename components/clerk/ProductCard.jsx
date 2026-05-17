import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProductCard({ product, onEdit, onDelete }) {
	const getStockColor = (stock) => {
		if (stock === 0) return { color: '#ef4444', bg: 'rgba(239,68,68,0.14)', border: 'rgba(239,68,68,0.3)' };
		if (stock < 10) return { color: '#fbbf24', bg: 'rgba(251,191,36,0.14)', border: 'rgba(251,191,36,0.3)' };
		return { color: '#34d399', bg: 'rgba(52,211,153,0.14)', border: 'rgba(52,211,153,0.3)' };
	};

	const stockStyle = getStockColor(product.stock);

	return (
		<View style={styles.card}>
			<View style={styles.topRow}>
				<View style={styles.iconWrap}>
					<Ionicons name="pricetag-outline" size={20} color="#60a5fa" />
				</View>
				<View style={styles.textWrap}>
					<Text style={styles.title} numberOfLines={1}>{product.name}</Text>
					<Text style={styles.category}>{product.category}</Text>
                    {product.description ? (
                        <Text style={styles.description} numberOfLines={2}>{product.description}</Text>
                    ) : null}
				</View>
				<View style={[styles.stockBadge, { backgroundColor: stockStyle.bg, borderColor: stockStyle.border }]}>
					<Text style={[styles.stockText, { color: stockStyle.color }]}>
						{product.stock} {product.uom || 'pcs'}
					</Text>
				</View>
			</View>

			<View style={styles.metaRow}>
				<View style={styles.metaItem}>
					<Ionicons name="cash-outline" size={14} color="#667693" />
					<Text style={styles.priceText}>₱{parseFloat(product.price).toFixed(2)}</Text>
				</View>
				{product.sku ? (
					<View style={styles.metaItem}>
						<Ionicons name="barcode-outline" size={14} color="#667693" />
						<Text style={styles.metaText}>{product.sku}</Text>
					</View>
				) : null}
			</View>

			<View style={styles.actionRow}>
				{onEdit && (
					<Pressable style={styles.actionBtn} onPress={() => onEdit(product)}>
						<Ionicons name="pencil" size={16} color="#60a5fa" />
						<Text style={styles.actionText}>Edit</Text>
					</Pressable>
				)}
				{onDelete && (
					<Pressable style={[styles.actionBtn, styles.deleteBtn]} onPress={() => onDelete(product)}>
						<Ionicons name="trash" size={16} color="#ef4444" />
						<Text style={styles.deleteText}>Delete</Text>
					</Pressable>
				)}
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
		backgroundColor: 'rgba(96,165,250,0.14)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	textWrap: {
		flex: 1,
	},
	title: {
		color: '#f8fafc',
		fontSize: 16,
		fontWeight: '800',
		marginBottom: 4,
	},
	category: {
		color: '#60a5fa',
		fontSize: 12,
		fontWeight: '700',
	},
    description: {
        color: '#8da2c0',
        fontSize: 12,
        marginTop: 4,
    },
	stockBadge: {
		borderRadius: 999,
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderWidth: 1,
	},
	stockText: {
		fontSize: 11,
		fontWeight: '700',
	},
	metaRow: {
		flexDirection: 'row',
		gap: 16,
		paddingLeft: 48,
	},
	metaItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	metaText: {
		color: '#667693',
		fontSize: 12,
	},
	priceText: {
		color: '#fbbf24',
		fontSize: 13,
		fontWeight: '700',
	},
	actionRow: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		gap: 8,
		paddingTop: 10,
		marginTop: 6,
		borderTopWidth: 1,
		borderTopColor: 'rgba(129,151,186,0.1)',
	},
	actionBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 8,
		backgroundColor: 'rgba(59,130,246,0.1)',
	},
	deleteBtn: {
		backgroundColor: 'rgba(239,68,68,0.1)',
	},
	actionText: {
		color: '#60a5fa',
		fontSize: 12,
		fontWeight: '600',
	},
	deleteText: {
		color: '#ef4444',
		fontSize: 12,
		fontWeight: '600',
	},
});
