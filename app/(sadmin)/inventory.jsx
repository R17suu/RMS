import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import ClerkHeader from '../../components/clerk/ClerkHeader';
import RestockCard from '../../components/clerk/RestockCard';
import ProfileMenu from '../../components/sadmin/ProfileMenu';
import AppCard from '../../components/AppCard';
import AppButton from '../../components/AppButton';
import AppTextField from '../../components/AppTextField';
import AppToast from '../../components/AppToast';
import ThemedView from '../../components/ThemedView';
import { auth } from '../../FirebaseConfig';
import { fetchProducts } from '../../services/productService';
import { fetchRestockHistory, recordRestock, fetchProductStockCard } from '../../services/inventoryService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function SadminInventoryScreen() {
	const router = useRouter();
	const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
	const [toast, setToast] = useState({ message: '', type: 'error' });
	const [products, setProducts] = useState([]);
	const [restocks, setRestocks] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [showAddForm, setShowAddForm] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [permissions, setPermissions] = useState([]);

	// Form fields
	const [selectedProductId, setSelectedProductId] = useState(null);
	const [quantityToAdd, setQuantityToAdd] = useState('');

	// Stock Card View
	const [viewMode, setViewMode] = useState('Restocks'); // 'Restocks' | 'StockCards'
	const [selectedStockCardProduct, setSelectedStockCardProduct] = useState(null);
	const [stockMovements, setStockMovements] = useState([]);
	const [isLoadingMovements, setIsLoadingMovements] = useState(false);

	useEffect(() => {
		loadData();
		loadPermissions();
	}, []);

	const loadPermissions = async () => {
		try {
			const perms = await AsyncStorage.getItem('user_permissions');
			if (perms) setPermissions(JSON.parse(perms));
		} catch (e) {
			console.error(e);
		}
	};

	const loadData = async () => {
		try {
			const [prods, hist] = await Promise.all([
				fetchProducts(),
				fetchRestockHistory()
			]);
			setProducts(prods);
			setRestocks(hist);
		} catch (error) {
			console.error('Error loading inventory data:', error);
			showToast('Failed to load inventory data');
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

	const handleRestock = async () => {
		if (!selectedProductId) {
			showToast('Please select a product.');
			return;
		}
		
		const qty = parseInt(quantityToAdd, 10);
		if (!qty || qty <= 0) {
			showToast('Enter a valid quantity to add.');
			return;
		}

		const selectedProd = products.find(p => p.id === selectedProductId);
		if (!selectedProd) return;

		setIsSubmitting(true);
		try {
			const newRestock = await recordRestock(
				selectedProductId,
				selectedProd.name,
				qty,
				auth.currentUser?.uid || 'unknown'
			);

			setRestocks((prev) => [newRestock, ...prev]);
			// Update local product stock
			setProducts(prev => prev.map(p => 
				p.id === selectedProductId ? { ...p, stock: p.stock + qty } : p
			));
			
			setQuantityToAdd('');
			setSelectedProductId(null);
			setShowAddForm(false);
			showToast('Stock added successfully.', 'success');
		} catch (error) {
			console.error('Error adding stock:', error);
			showToast('Failed to add stock.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleViewStockCard = async (product) => {
		setSelectedStockCardProduct(product);
		setIsLoadingMovements(true);
		try {
			const movements = await fetchProductStockCard(product.id);
			setStockMovements(movements);
		} catch (error) {
			console.error('Error fetching stock card:', error);
			showToast('Failed to load stock movements.');
		} finally {
			setIsLoadingMovements(false);
		}
	};

	const handlePrintStockCard = async () => {
		if (!selectedStockCardProduct || stockMovements.length === 0) {
			showToast('No stock movements to print.');
			return;
		}

		try {
			const htmlContent = `
				<html>
					<head>
						<style>
							body { font-family: 'Helvetica', sans-serif; padding: 20px; }
							h1 { color: #1e3a8a; text-align: center; }
							table { width: 100%; border-collapse: collapse; margin-top: 20px; }
							th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
							th { background-color: #f3f4f6; }
							.header-info { margin-bottom: 30px; }
							.in { color: #059669; font-weight: bold; }
							.out { color: #dc2626; font-weight: bold; }
						</style>
					</head>
					<body>
						<h1>Digital Stock Card</h1>
						<div class="header-info">
							<p><strong>Item Name:</strong> ${selectedStockCardProduct.name}</p>
							<p><strong>Current Stock:</strong> ${selectedStockCardProduct.stock}</p>
							<p><strong>Date Printed:</strong> ${new Date().toLocaleString()}</p>
						</div>
						<table>
							<thead>
								<tr>
									<th>Date</th>
									<th>Ref No.</th>
									<th>Type</th>
									<th>Quantity</th>
									<th>Description</th>
									<th>Actor ID</th>
								</tr>
							</thead>
							<tbody>
								${stockMovements.map(mov => `
									<tr>
										<td>${mov.createdAt?.toDate ? mov.createdAt.toDate().toLocaleString() : 'N/A'}</td>
										<td>${mov.referenceNumber || 'N/A'}</td>
										<td class="${mov.type === 'IN' ? 'in' : 'out'}">${mov.type}</td>
										<td>${mov.quantity}</td>
										<td>${mov.description}</td>
										<td>${mov.userId || 'System'}</td>
									</tr>
								`).join('')}
							</tbody>
						</table>
					</body>
				</html>
			`;
			const { uri } = await Print.printToFileAsync({ html: htmlContent });
			if (await Sharing.isAvailableAsync()) {
				await Sharing.shareAsync(uri);
			}
		} catch (error) {
			console.error('Error printing stock card:', error);
			showToast('Failed to print stock card.');
		}
	};

	const renderStockMovementsModal = () => {
		if (!selectedStockCardProduct) return null;

		return (
			<View style={styles.modalOverlay}>
				<AppCard style={styles.modalCard}>
					<View style={styles.modalHeader}>
						<Text style={styles.modalTitle}>{selectedStockCardProduct.name} - Stock Card</Text>
						<View style={styles.modalActions}>
							<Pressable onPress={handlePrintStockCard} style={styles.actionIconBtn}>
								<Ionicons name="print-outline" size={24} color="#34d399" />
							</Pressable>
							<Pressable onPress={() => setSelectedStockCardProduct(null)} style={styles.actionIconBtn}>
								<Ionicons name="close-circle-outline" size={24} color="#ef4444" />
							</Pressable>
						</View>
					</View>
					
					{isLoadingMovements ? (
						<ActivityIndicator size="small" color="#3b82f6" style={{ marginVertical: 20 }} />
					) : stockMovements.length === 0 ? (
						<Text style={styles.emptyText}>No stock movements recorded.</Text>
					) : (
						<ScrollView style={styles.movementsScroll}>
							{stockMovements.map((mov, idx) => (
								<View key={mov.id || idx} style={styles.movementItem}>
									<View style={styles.movementHeader}>
										<Text style={[styles.movementType, mov.type === 'IN' ? styles.inText : styles.outText]}>
											{mov.type === 'IN' ? '+' : '-'}{mov.quantity}
										</Text>
										<Text style={styles.movementDate}>
											{mov.createdAt?.toDate ? mov.createdAt.toDate().toLocaleString() : 'N/A'}
										</Text>
									</View>
									<Text style={styles.movementDesc}>{mov.description}</Text>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                                        <Text style={{ color: '#64748b', fontSize: 11 }}>Ref: {mov.referenceNumber || 'N/A'}</Text>
                                        <Text style={{ color: '#64748b', fontSize: 11 }}>By: {mov.userId || 'System'}</Text>
                                    </View>
								</View>
							))}
						</ScrollView>
					)}
				</AppCard>
			</View>
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
				<ClerkHeader onProfilePress={openProfileMenu} title="Inventory Restock" />
			</View>
			<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

				<View style={styles.viewModeToggle}>
					<Pressable 
						style={[styles.toggleBtn, viewMode === 'Restocks' && styles.toggleBtnActive]}
						onPress={() => setViewMode('Restocks')}
					>
						<Text style={[styles.toggleBtnText, viewMode === 'Restocks' && styles.toggleBtnTextActive]}>Restocks</Text>
					</Pressable>
					<Pressable 
						style={[styles.toggleBtn, viewMode === 'StockCards' && styles.toggleBtnActive]}
						onPress={() => setViewMode('StockCards')}
					>
						<Text style={[styles.toggleBtnText, viewMode === 'StockCards' && styles.toggleBtnTextActive]}>Stock Cards</Text>
					</Pressable>
				</View>

				{isLoading ? (
					<View style={styles.loadingWrap}>
						<ActivityIndicator size="large" color="#3b82f6" />
						<Text style={styles.loadingText}>Loading Inventory...</Text>
					</View>
				) : (
					<>
						{/* Add Stock Toggle */}
						{permissions.includes('add_stock') && (
							<Pressable
								style={styles.addToggle}
								onPress={() => setShowAddForm(!showAddForm)}
							>
								<Text style={styles.addToggleText}>
									{showAddForm ? '✕  Close Form' : '+  Add Stock'}
								</Text>
							</Pressable>
						)}

						{/* Add Stock Form */}
						{showAddForm && permissions.includes('add_stock') ? (
							<AppCard style={styles.formCard}>
								<Text style={styles.formTitle}>Record Stock Delivery</Text>

								<View style={styles.formFields}>
									<Text style={styles.fieldLabel}>Select Product</Text>
									<ScrollView style={styles.prodPickerScroll} nestedScrollEnabled>
										<View style={styles.prodPickerList}>
											{products.map((prod) => (
												<Pressable
													key={prod.id}
													style={[
														styles.prodPickerItem,
														selectedProductId === prod.id && styles.prodPickerItemSelected,
													]}
													onPress={() => setSelectedProductId(prod.id)}
												>
													<Text
														style={[
															styles.prodPickerText,
															selectedProductId === prod.id && styles.prodPickerTextSelected,
														]}
														numberOfLines={1}
													>
														{prod.name}
													</Text>
													<Text style={styles.prodPickerStock}>Stock: {prod.stock}</Text>
												</Pressable>
											))}
										</View>
									</ScrollView>

									<AppTextField
										label="Quantity Added"
										leftIconName="add-circle-outline"
										value={quantityToAdd}
										onChangeText={setQuantityToAdd}
										placeholder="0"
										keyboardType="number-pad"
										placeholderTextColor="#667693"
									/>
								</View>

								<AppButton
									title={isSubmitting ? 'Updating...' : 'Add Stock'}
									onPress={handleRestock}
									disabled={isSubmitting}
									iconName="cube-outline"
									style={styles.submitButton}
								/>
							</AppCard>
						) : null}

						{viewMode === 'Restocks' ? (
							<>
								{/* Restock History */}
								<View style={styles.listHeader}>
									<Text style={styles.sectionTitle}>
										Recent Deliveries
									</Text>
								</View>

								{restocks.length === 0 ? (
									<View style={styles.emptyWrap}>
										<Text style={styles.emptyText}>No stock additions recorded yet.</Text>
									</View>
								) : (
									<View style={styles.restockList}>
										{restocks.map((restock) => (
											<RestockCard key={restock.id} restock={restock} />
										))}
									</View>
								)}
							</>
						) : (
							<>
								<View style={styles.listHeader}>
									<Text style={styles.sectionTitle}>
										Product Stock Cards
									</Text>
								</View>
								<View style={styles.restockList}>
									{products.map(prod => (
										<Pressable key={prod.id} style={styles.productCardBtn} onPress={() => handleViewStockCard(prod)}>
											<View style={styles.productCardInfo}>
												<Text style={styles.prodPickerText}>{prod.name}</Text>
												<Text style={styles.prodPickerStock}>Current Stock: {prod.stock}</Text>
											</View>
											<Text style={styles.viewBtnText}>View Card</Text>
										</Pressable>
									))}
								</View>
							</>
						)}
					</>
				)}
			</ScrollView>
			
			{renderStockMovementsModal()}
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
	loadingWrap: {
		alignItems: 'center',
		paddingVertical: 40,
	},
	loadingText: {
		color: '#8da2c0',
		marginTop: 12,
	},
	addToggle: {
		borderRadius: 12,
		paddingVertical: 12,
		backgroundColor: 'rgba(59,130,246,0.12)',
		borderWidth: 1,
		borderColor: 'rgba(59,130,246,0.25)',
		alignItems: 'center',
	},
	addToggleText: {
		color: '#93c5fd',
		fontSize: 14,
		fontWeight: '700',
	},
	formCard: {
		width: '100%',
		maxWidth: '100%',
		alignSelf: 'stretch',
		borderRadius: 18,
		paddingHorizontal: 14,
		paddingVertical: 16,
		backgroundColor: 'rgba(18,26,53,0.95)',
		borderColor: 'rgba(59,130,246,0.3)',
	},
	formTitle: {
		color: '#f3f6ff',
		fontSize: 15,
		fontWeight: '800',
		marginBottom: 12,
	},
	formFields: {
		gap: 10,
	},
	fieldLabel: {
		color: '#a8bbd7',
		fontSize: 13,
		fontWeight: '700',
	},
	prodPickerScroll: {
		maxHeight: 180,
	},
	prodPickerList: {
		gap: 6,
	},
	prodPickerItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 14,
		paddingVertical: 12,
		borderRadius: 10,
		backgroundColor: 'rgba(12,22,44,0.72)',
		borderWidth: 1,
		borderColor: 'rgba(129,151,186,0.18)',
	},
	prodPickerItemSelected: {
		backgroundColor: 'rgba(59,130,246,0.15)',
		borderColor: 'rgba(59,130,246,0.45)',
	},
	prodPickerText: {
		color: '#c8d8f0',
		fontSize: 13,
		fontWeight: '600',
		flex: 1,
	},
	prodPickerTextSelected: {
		color: '#93c5fd',
	},
	prodPickerStock: {
		color: '#667693',
		fontSize: 11,
		fontWeight: '700',
		marginLeft: 8,
	},
	submitButton: {
		height: 52,
		marginTop: 14,
		marginBottom: 0,
	},
	listHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 4,
	},
	sectionTitle: {
		color: '#f3f6ff',
		fontSize: 15,
		fontWeight: '800',
	},
	emptyWrap: {
		alignItems: 'center',
		paddingVertical: 30,
	},
	emptyText: {
		color: '#667693',
		fontSize: 13,
	},
	restockList: {
		gap: 10,
	},
	viewModeToggle: {
		flexDirection: 'row',
		backgroundColor: 'rgba(15,23,42,0.8)',
		borderRadius: 10,
		padding: 4,
		marginBottom: 16,
	},
	toggleBtn: {
		flex: 1,
		paddingVertical: 10,
		alignItems: 'center',
		borderRadius: 8,
	},
	toggleBtnActive: {
		backgroundColor: 'rgba(59,130,246,0.2)',
	},
	toggleBtnText: {
		color: '#64748b',
		fontSize: 13,
		fontWeight: '600',
	},
	toggleBtnTextActive: {
		color: '#93c5fd',
	},
	productCardBtn: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 16,
		backgroundColor: 'rgba(12,22,44,0.72)',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: 'rgba(129,151,186,0.18)',
	},
	productCardInfo: {
		flex: 1,
	},
	viewBtnText: {
		color: '#60a5fa',
		fontSize: 12,
		fontWeight: '700',
	},
	modalOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(2,11,36,0.85)',
		zIndex: 100,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	modalCard: {
		width: '100%',
		maxHeight: '80%',
		backgroundColor: '#0f172a',
		borderColor: 'rgba(129,151,186,0.2)',
		padding: 20,
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
	modalActions: {
		flexDirection: 'row',
		gap: 8,
		alignItems: 'center',
	},
	actionIconBtn: {
		padding: 4,
	},
	movementsScroll: {
		maxHeight: 400,
	},
	movementItem: {
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(129,151,186,0.05)',
	},
	movementHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 4,
	},
	movementType: {
		fontSize: 16,
		fontWeight: '800',
	},
	inText: {
		color: '#34d399',
	},
	outText: {
		color: '#ef4444',
	},
	movementDate: {
		color: '#64748b',
		fontSize: 11,
	},
	movementDesc: {
		color: '#cbd5e1',
		fontSize: 13,
	},
});
