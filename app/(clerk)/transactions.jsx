import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View, ActivityIndicator, Text, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ClerkHeader from '../../components/clerk/ClerkHeader';
import SaleCard from '../../components/clerk/SaleCard';
import ProfileMenu from '../../components/sadmin/ProfileMenu';
import AppCard from '../../components/AppCard';
import AppToast from '../../components/AppToast';
import ThemedView from '../../components/ThemedView';
import { auth } from '../../FirebaseConfig';
import { fetchSalesByClerk, fetchSalesHistory } from '../../services/saleService';

const FILTERS = ['My Sales', 'All Sales'];

export default function ClerkTransactionsScreen() {
	const router = useRouter();
	const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
	const [toast, setToast] = useState({ message: '', type: 'error' });
	const [sales, setSales] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedFilter, setSelectedFilter] = useState('My Sales');
	const [selectedSale, setSelectedSale] = useState(null);

	useEffect(() => {
		loadHistory();
	}, [selectedFilter]);

	const loadHistory = async () => {
		setIsLoading(true);
		try {
			const uid = auth.currentUser?.uid;
			if (!uid) {
				showToast('You must be logged in to view history.');
				setIsLoading(false);
				return;
			}
			
			let data;
			if (selectedFilter === 'My Sales') {
				data = await fetchSalesByClerk(uid);
			} else {
				data = await fetchSalesHistory();
			}
			setSales(data);
		} catch (error) {
			console.error('Error loading sales history:', error);
			showToast('Failed to load sales history');
		} finally {
			setIsLoading(false);
		}
	};

	const showToast = (message, type = 'error') => {
		setToast({ message, type });
	};

	const openProfileMenu = () => setIsProfileMenuOpen(true);
	const closeProfileMenu = () => setIsProfileMenuOpen(false);

	const handleSignOut = async () => {
		try {
			await signOut(auth);
			setIsProfileMenuOpen(false);
			router.replace('/');
		} catch (error) {
			console.error('Failed to sign out:', error);
		}
	};

	const totalRevenue = sales.reduce((sum, sale) => sum + (parseFloat(sale.totalAmount) || 0), 0);
	const totalItemsSold = sales.reduce((sum, sale) => {
		return sum + (sale.items?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0);
	}, 0);

	const renderSaleModal = () => {
		if (!selectedSale) return null;

		const totalItems = selectedSale.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

		return (
			<Modal
				visible={!!selectedSale}
				animationType="slide"
				transparent={true}
				onRequestClose={() => setSelectedSale(null)}
			>
				<View style={styles.modalOverlay}>
					<AppCard style={styles.modalCard}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>Transaction Details</Text>
							<Pressable onPress={() => setSelectedSale(null)} style={styles.closeBtn}>
								<Ionicons name="close-circle-outline" size={26} color="#ef4444" />
							</Pressable>
						</View>

						<ScrollView style={styles.reviewScroll} showsVerticalScrollIndicator={false}>
							<View style={styles.summaryBox}>
								<Text style={styles.summaryLabel}>Transaction ID:</Text>
								<Text style={styles.summaryValue}>{selectedSale.id}</Text>

								<Text style={[styles.summaryLabel, {marginTop: 8}]}>Payment Method:</Text>
								<Text style={styles.summaryValue}>{selectedSale.paymentDetails?.method || 'N/A'}</Text>
								
								{selectedSale.paymentDetails?.method === 'Cash' && selectedSale.paymentDetails?.orNumber && (
									<>
										<Text style={[styles.summaryLabel, {marginTop: 8}]}>OR Number:</Text>
										<Text style={styles.summaryValue}>{selectedSale.paymentDetails.orNumber}</Text>
									</>
								)}

								{selectedSale.paymentDetails?.method === 'Purchase Request' && selectedSale.paymentDetails?.prDocument && (
									<>
										<Text style={[styles.summaryLabel, {marginTop: 8}]}>PO Number:</Text>
										<Text style={styles.summaryValue}>{selectedSale.paymentDetails.prDocument}</Text>
									</>
								)}

								<Text style={[styles.summaryLabel, {marginTop: 8}]}>Clerk Name:</Text>
								<Text style={styles.summaryValue}>{selectedSale.clerkName || selectedSale.clerkId}</Text>
								
								<Text style={[styles.summaryLabel, {marginTop: 8}]}>Total Amount:</Text>
								<Text style={styles.summaryTotal}>₱{parseFloat(selectedSale.totalAmount).toFixed(2)}</Text>
								
								<Text style={[styles.summaryLabel, {marginTop: 8}]}>Total Items:</Text>
								<Text style={styles.summaryValue}>{totalItems}</Text>
							</View>

							<Text style={styles.itemsTitle}>Items Purchased:</Text>
							{selectedSale.items?.map((item, idx) => (
								<View key={idx} style={styles.itemRow}>
									<Text style={styles.itemQty}>{item.quantity}x</Text>
									<Text style={styles.itemName}>{item.name}</Text>
									<Text style={styles.itemPrice}>₱{(item.price * item.quantity).toFixed(2)}</Text>
								</View>
							))}
						</ScrollView>
					</AppCard>
				</View>
			</Modal>
		);
	};

	return (
		<ThemedView style={styles.container} safe>
			<AppToast
				message={toast.message}
				type={toast.type}
				onHide={() => setToast((prev) => ({ ...prev, message: '' }))}
			/>

			{isProfileMenuOpen ? <Pressable style={styles.overlay} onPress={closeProfileMenu} /> : null}

			{isProfileMenuOpen ? (
				<View style={styles.profileMenuWrap}>
					<ProfileMenu onSignOut={handleSignOut} />
				</View>
			) : null}

			<View style={styles.headerWrap}>
				<ClerkHeader onProfilePress={openProfileMenu} title="Sales History" />
			</View>
			<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

				{/* Summary Bar */}
				<View style={styles.summaryRow}>
					<View style={styles.summaryItem}>
						<Text style={styles.summaryValue}>{sales.length}</Text>
						<Text style={styles.summaryLabel}>Transactions</Text>
					</View>
					<View style={styles.summaryDivider} />
					<View style={styles.summaryItem}>
						<Text style={[styles.summaryValue, { color: '#60a5fa' }]}>{totalItemsSold}</Text>
						<Text style={styles.summaryLabel}>Items Sold</Text>
					</View>
					<View style={styles.summaryDivider} />
					<View style={styles.summaryItem}>
						<Text style={[styles.summaryValue, { color: '#34d399' }]}>₱{totalRevenue.toFixed(0)}</Text>
						<Text style={styles.summaryLabel}>Revenue</Text>
					</View>
				</View>

				{/* Filter Chips */}
				<View style={styles.filterRow}>
					{FILTERS.map((filter) => (
						<Pressable
							key={filter}
							style={[styles.filterChip, selectedFilter === filter && styles.filterChipActive]}
							onPress={() => setSelectedFilter(filter)}
						>
							<Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>
								{filter}
							</Text>
						</Pressable>
					))}
				</View>

				{isLoading ? (
					<View style={styles.loadingWrap}>
						<ActivityIndicator size="large" color="#3b82f6" />
						<Text style={styles.loadingText}>Loading Transactions...</Text>
					</View>
				) : sales.length === 0 ? (
					<View style={styles.emptyWrap}>
						<Text style={styles.emptyText}>
							No sales transactions found.
						</Text>
					</View>
				) : (
					<View style={styles.historyList}>
						{sales.map((sale) => (
							<SaleCard key={sale.id} sale={sale} onPress={setSelectedSale} />
						))}
					</View>
				)}
			</ScrollView>

			{renderSaleModal()}
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#020b24',
		position: 'relative',
	},
	headerWrap: {
		paddingHorizontal: 16,
		paddingBottom: 14,
	},
	overlay: {
		...StyleSheet.absoluteFillObject,
		zIndex: 20,
	},
	profileMenuWrap: {
		position: 'absolute',
		top: 96,
		right: 16,
		zIndex: 30,
	},
	scrollContent: {
		paddingHorizontal: 16,
		paddingBottom: 24,
		gap: 12,
	},
	summaryRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-around',
		backgroundColor: 'rgba(18,26,53,0.95)',
		borderRadius: 16,
		borderWidth: 1,
		borderColor: 'rgba(115,137,172,0.22)',
		paddingVertical: 16,
		paddingHorizontal: 10,
	},
	summaryItem: {
		alignItems: 'center',
		gap: 4,
	},
	summaryValue: {
		color: '#f1f5ff',
		fontSize: 20,
		fontWeight: '900',
	},
	summaryLabel: {
		color: '#6e83a7',
		fontSize: 11,
		fontWeight: '700',
		textTransform: 'uppercase',
	},
	summaryDivider: {
		width: 1,
		height: 30,
		backgroundColor: 'rgba(129,151,186,0.2)',
	},
	filterRow: {
		flexDirection: 'row',
		gap: 8,
	},
	filterChip: {
		borderRadius: 999,
		paddingHorizontal: 16,
		paddingVertical: 8,
		backgroundColor: 'rgba(16,27,52,0.8)',
		borderWidth: 1,
		borderColor: 'rgba(129,151,186,0.22)',
	},
	filterChipActive: {
		backgroundColor: 'rgba(59,130,246,0.18)',
		borderColor: 'rgba(59,130,246,0.5)',
	},
	filterText: {
		color: '#8ea3c4',
		fontSize: 13,
		fontWeight: '700',
	},
	filterTextActive: {
		color: '#93c5fd',
	},
	loadingWrap: {
		alignItems: 'center',
		paddingVertical: 40,
	},
	loadingText: {
		color: '#8da2c0',
		marginTop: 12,
	},
	emptyWrap: {
		alignItems: 'center',
		paddingVertical: 30,
	},
	emptyText: {
		color: '#667693',
		fontSize: 13,
	},
	historyList: {
		gap: 10,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(2,11,36,0.85)',
		justifyContent: 'center',
		alignItems: 'center',
		padding: 16,
	},
	modalCard: {
		width: '100%',
		maxHeight: '85%',
		flex: 1,
		backgroundColor: '#0f172a',
		borderColor: 'rgba(245,158,11,0.3)',
		padding: 20,
		display: 'flex',
		flexDirection: 'column',
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(129,151,186,0.1)',
		paddingBottom: 16,
		marginBottom: 16,
	},
	modalTitle: {
		color: '#f8fafc',
		fontSize: 16,
		fontWeight: '700',
		flex: 1,
	},
	closeBtn: {
		padding: 4,
	},
	reviewScroll: {
		flex: 1,
	},
	summaryBox: {
		backgroundColor: 'rgba(15,23,42,0.6)',
		padding: 16,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: 'rgba(129,151,186,0.2)',
		marginBottom: 20,
	},
	summaryLabel: {
		color: '#94a3b8',
		fontSize: 12,
		fontWeight: '600',
	},
	summaryValue: {
		color: '#e2e8f0',
		fontSize: 14,
		fontWeight: '700',
		marginTop: 2,
	},
	summaryTotal: {
		color: '#34d399',
		fontSize: 20,
		fontWeight: '900',
		marginTop: 2,
	},
	itemsTitle: {
		color: '#f1f5f9',
		fontSize: 14,
		fontWeight: '700',
		marginBottom: 10,
	},
	itemRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(129,151,186,0.1)',
	},
	itemQty: {
		color: '#60a5fa',
		fontSize: 13,
		fontWeight: '700',
		width: 30,
	},
	itemName: {
		color: '#c8d8f0',
		fontSize: 13,
		flex: 1,
	},
	itemPrice: {
		color: '#94a3b8',
		fontSize: 13,
		fontWeight: '600',
	},
});
