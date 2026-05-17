import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, Pressable, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function SaleCard({ sale, onPress }) {
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

	const [isDownloading, setIsDownloading] = useState(false);

	const handleDownloadReceipt = async () => {
		setIsDownloading(true);
		try {
			const isCash = sale.paymentDetails?.method === 'Cash';
			const docNumber = isCash ? (sale.paymentDetails?.orNumber || 'N/A') : (sale.paymentDetails?.prDocument || 'N/A');
			const title = isCash ? 'Official Receipt' : 'Purchase Request / PO';

			const htmlContent = `
				<html>
					<head>
						<style>
							body { font-family: 'Helvetica', sans-serif; padding: 20px; }
							h1 { color: #1e3a8a; text-align: center; }
							table { width: 100%; border-collapse: collapse; margin-top: 20px; }
							th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
							th { background-color: #f3f4f6; }
							.total { font-weight: bold; font-size: 18px; text-align: right; margin-top: 20px; }
							.header-info { margin-bottom: 30px; }
						</style>
					</head>
					<body>
						<h1>${title}</h1>
						<div class="header-info">
							<p><strong>Document Number:</strong> ${docNumber}</p>
							<p><strong>Date:</strong> ${formatDate(sale.createdAt)}</p>
							<p><strong>Transaction ID:</strong> ${sale.id}</p>
						</div>
						<table>
							<thead>
								<tr>
									<th>Item</th>
									<th>Qty</th>
									<th>Price</th>
									<th>Subtotal</th>
								</tr>
							</thead>
							<tbody>
								${sale.items?.map(item => `
									<tr>
										<td>${item.name}</td>
										<td>${item.quantity}</td>
										<td>PHP ${parseFloat(item.price).toFixed(2)}</td>
										<td>PHP ${(item.price * item.quantity).toFixed(2)}</td>
									</tr>
								`).join('') || ''}
							</tbody>
						</table>
						<div class="total">Total Due: PHP ${parseFloat(sale.totalAmount).toFixed(2)}</div>
					</body>
				</html>
			`;
			const { uri } = await Print.printToFileAsync({ html: htmlContent });
			await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
		} catch (error) {
			console.error('Error generating PDF:', error);
		} finally {
			setIsDownloading(false);
		}
	};

	const totalItems = sale.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

	return (
		<Pressable style={styles.card} onPress={() => onPress && onPress(sale)}>
			<View style={styles.topRow}>
				<View style={styles.iconWrap}>
					<Ionicons name="cart-outline" size={20} color="#34d399" />
				</View>
				<View style={styles.textWrap}>
					<View style={styles.titleRow}>
						<Text style={styles.saleTitle}>Sale #{sale.id.slice(0, 8).toUpperCase()}</Text>
						{sale.status && (
							<View style={[styles.statusBadge, sale.status === 'Completed' ? styles.statusCompleted : sale.status === 'Rejected' ? styles.statusRejected : styles.statusPending]}>
								<Text style={[styles.statusText, sale.status === 'Completed' ? styles.statusTextCompleted : sale.status === 'Rejected' ? styles.statusTextRejected : styles.statusTextPending]}>
									{sale.status}
								</Text>
							</View>
						)}
					</View>
					<Text style={styles.dateText}>{formatDate(sale.createdAt)}</Text>
					{sale.paymentDetails && (
						<Text style={styles.paymentText}>
							{sale.paymentDetails.method} 
							{sale.paymentDetails.method === 'Cash' && sale.paymentDetails.orNumber ? ` • OR: ${sale.paymentDetails.orNumber}` : ''}
							{sale.paymentDetails.method === 'Purchase Request' && sale.paymentDetails.prDocument ? ` • PR: ${sale.paymentDetails.prDocument}` : ''}
						</Text>
					)}
				</View>
				<Text style={styles.totalAmount}>₱{parseFloat(sale.totalAmount).toFixed(2)}</Text>
			</View>

			<View style={styles.itemsList}>
				{sale.items?.slice(0, 2).map((item, index) => (
					<View key={index} style={styles.itemRow}>
						<Text style={styles.itemQuantity}>{item.quantity}x</Text>
						<Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
						<Text style={styles.itemPrice}>₱{parseFloat(item.price * item.quantity).toFixed(2)}</Text>
					</View>
				))}
				{sale.items?.length > 2 && (
					<Text style={styles.moreItemsText}>+ {sale.items.length - 2} more items</Text>
				)}
			</View>

			<View style={styles.footerRow}>
				<Text style={styles.footerText}>{totalItems} Total Items</Text>
				<Pressable style={styles.downloadBtn} onPress={handleDownloadReceipt} disabled={isDownloading}>
					{isDownloading ? (
						<ActivityIndicator size="small" color="#60a5fa" />
					) : (
						<>
							<Ionicons name="download-outline" size={16} color="#60a5fa" />
							<Text style={styles.downloadText}>Download</Text>
						</>
					)}
				</Pressable>
			</View>
		</Pressable>
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
		backgroundColor: 'rgba(52,211,153,0.14)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	textWrap: {
		flex: 1,
	},
	saleTitle: {
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
	},
	statusCompleted: {
		backgroundColor: 'rgba(52,211,153,0.1)',
		borderColor: 'rgba(52,211,153,0.3)',
	},
	statusPending: {
		backgroundColor: 'rgba(251,191,36,0.1)',
		borderColor: 'rgba(251,191,36,0.3)',
	},
	statusRejected: {
		backgroundColor: 'rgba(239,68,68,0.1)',
		borderColor: 'rgba(239,68,68,0.3)',
	},
	statusText: {
		fontSize: 10,
		fontWeight: '700',
	},
	statusTextCompleted: {
		color: '#34d399',
	},
	statusTextPending: {
		color: '#fbbf24',
	},
	statusTextRejected: {
		color: '#ef4444',
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
		color: '#34d399',
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
	itemPrice: {
		color: '#8da2c0',
		fontSize: 12,
	},
	moreItemsText: {
		color: '#667693',
		fontSize: 11,
		fontStyle: 'italic',
		marginTop: 2,
	},
	footerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
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
	downloadBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		paddingHorizontal: 8,
		paddingVertical: 4,
		backgroundColor: 'rgba(96,165,250,0.1)',
		borderRadius: 6,
		borderWidth: 1,
		borderColor: 'rgba(96,165,250,0.2)',
	},
	downloadText: {
		color: '#60a5fa',
		fontSize: 11,
		fontWeight: '700',
	},
});
