import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ClerkHeader from '../../components/clerk/ClerkHeader';
import ProfileMenu from '../../components/sadmin/ProfileMenu';
import AppCard from '../../components/AppCard';
import AppButton from '../../components/AppButton';
import AppToast from '../../components/AppToast';
import ThemedView from '../../components/ThemedView';
import { auth } from '../../FirebaseConfig';
import { fetchProducts } from '../../services/productService';
import { recordSale } from '../../services/saleService';
import { fetchUserRecord } from '../../services/userService';
import AppTextField from '../../components/AppTextField';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function SadminPOSScreen() {
	const router = useRouter();
	const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
	const [toast, setToast] = useState({ message: '', type: 'error' });
	const [products, setProducts] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [cart, setCart] = useState([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [paymentMethod, setPaymentMethod] = useState('Cash');
	const [orNumber, setOrNumber] = useState('');
	const [currentUserRecord, setCurrentUserRecord] = useState(null);
	const [permissions, setPermissions] = useState([]);

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
			if (auth.currentUser?.uid) {
				const user = await fetchUserRecord(auth.currentUser.uid);
				setCurrentUserRecord(user);
			}

			const data = await fetchProducts();
			// Only show products with stock > 0 in POS
			setProducts(data.filter(p => p.stock > 0));
		} catch (error) {
			console.error('Error loading products for POS:', error);
			showToast('Failed to load products');
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

	const addToCart = (product) => {
		setCart(prevCart => {
			const existingItem = prevCart.find(item => item.productId === product.id);
			if (existingItem) {
				if (existingItem.quantity >= product.stock) {
					showToast(`Only ${product.stock} available in stock.`);
					return prevCart;
				}
				return prevCart.map(item =>
					item.productId === product.id
						? { ...item, quantity: item.quantity + 1 }
						: item
				);
			} else {
				return [...prevCart, {
					productId: product.id,
					name: product.name,
					price: product.price,
					quantity: 1
				}];
			}
		});
	};

	const updateQuantity = (productId, delta) => {
		setCart(prevCart => {
			return prevCart.map(item => {
				if (item.productId === productId) {
					const newQuantity = item.quantity + delta;
					return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
				}
				return item;
			}).filter(Boolean);
		});
	};

	const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
	const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

	const handleCompleteSale = async () => {
		if (cart.length === 0) {
			showToast('Cart is empty.');
			return;
		}
		
		if (paymentMethod === 'Cash' && !orNumber.trim()) {
			showToast('Please enter the OR Number for Cash payment.');
			return;
		}

		setIsSubmitting(true);
		try {
			let prNumber = null;
			if (paymentMethod === 'Purchase Request') {
				const today = new Date();
				const dd = String(today.getDate()).padStart(2, '0');
				const mm = String(today.getMonth() + 1).padStart(2, '0');
				const yyyy = today.getFullYear();
				const randomHash = Math.floor(1000 + Math.random() * 9000);
				prNumber = `${dd}${mm}${yyyy}-${randomHash}`;
			}

			const paymentDetails = {
				method: paymentMethod,
				orNumber: paymentMethod === 'Cash' ? orNumber.trim() : null,
				prDocument: prNumber,
			};

			const clerkName = currentUserRecord?.name || 'Unknown Clerk';
			await recordSale(cart, cartTotal, auth.currentUser?.uid || 'unknown', paymentDetails, clerkName);
			
			if (paymentMethod === 'Purchase Request') {
				showToast('PR submitted as Draft PO for approval.', 'success');
			} else {
				showToast('Sale completed successfully!', 'success');
			}
			
			if (paymentMethod === 'Purchase Request') {
				// Generate PDF
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
							<h1>Purchase Request Receipt</h1>
							<div class="header-info">
								<p><strong>PR Number:</strong> ${prNumber}</p>
								<p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
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
									${cart.map(item => `
										<tr>
											<td>${item.name}</td>
											<td>${item.quantity}</td>
											<td>PHP ${parseFloat(item.price).toFixed(2)}</td>
											<td>PHP ${(item.price * item.quantity).toFixed(2)}</td>
										</tr>
									`).join('')}
								</tbody>
							</table>
							<div class="total">Total Due: PHP ${cartTotal.toFixed(2)}</div>
						</body>
					</html>
				`;
				const { uri } = await Print.printToFileAsync({ html: htmlContent });
				if (await Sharing.isAvailableAsync()) {
					await Sharing.shareAsync(uri);
				}
			}

			setCart([]);
			setOrNumber('');
			// Reload products to get updated stock
			await loadData();
		} catch (error) {
			console.error('Error recording sale:', error);
			showToast('Failed to complete sale.');
		} finally {
			setIsSubmitting(false);
		}
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

			<View style={styles.innerContainer}>
				<View style={styles.headerWrap}>
					<ClerkHeader onProfilePress={openProfileMenu} title="Point of Sale" />
				</View>

				{isLoading ? (
					<View style={styles.loadingWrap}>
						<ActivityIndicator size="large" color="#3b82f6" />
						<Text style={styles.loadingText}>Loading POS...</Text>
					</View>
				) : (
					<ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
						<View style={[styles.posLayout, { flex: 0 }]}>
						{/* Product Selection (Left/Top) */}
						<View style={styles.productsSection}>
							<Text style={styles.sectionTitle}>Select Items</Text>
							{products.length === 0 ? (
								<Text style={styles.emptyText}>No items available in stock.</Text>
							) : (
								<ScrollView style={styles.productsScroll} contentContainerStyle={styles.productsGrid} nestedScrollEnabled={true}>
									{products.map((product) => (
										<Pressable
											key={product.id}
											style={styles.productButton}
											onPress={() => addToCart(product)}
										>
											<View style={styles.productButtonIcon}>
												<Ionicons name="pricetag" size={24} color="#60a5fa" />
											</View>
											<Text style={styles.productButtonName} numberOfLines={2}>
												{product.name}
											</Text>
											<Text style={styles.productButtonPrice}>
												₱{parseFloat(product.price).toFixed(2)}
											</Text>
											<Text style={styles.productButtonStock}>
												{product.stock} left
											</Text>
										</Pressable>
									))}
								</ScrollView>
							)}
						</View>

						{/* Cart Summary (Right/Bottom) */}
						<View style={styles.cartSection}>
							<AppCard style={styles.cartCard}>
								<View style={styles.cartHeader}>
									<Text style={styles.cartTitle}>Current Sale</Text>
									<Text style={styles.cartCount}>{cartItemsCount} items</Text>
								</View>

								<View style={styles.cartItemsScroll}>
									{cart.length === 0 ? (
										<View style={styles.emptyCartWrap}>
											<Ionicons name="cart-outline" size={48} color="#475569" />
											<Text style={styles.emptyCartText}>Cart is empty</Text>
										</View>
									) : (
										cart.map((item) => (
											<View key={item.productId} style={styles.cartItem}>
												<View style={styles.cartItemInfo}>
													<Text style={styles.cartItemName} numberOfLines={1}>{item.name}</Text>
													<Text style={styles.cartItemPrice}>
														₱{parseFloat(item.price).toFixed(2)} each
													</Text>
												</View>
												<View style={styles.quantityControls}>
													<Pressable
														style={styles.qtyBtn}
														onPress={() => updateQuantity(item.productId, -1)}
													>
														<Ionicons name="remove" size={16} color="#94a3b8" />
													</Pressable>
													<Text style={styles.qtyText}>{item.quantity}</Text>
													<Pressable
														style={styles.qtyBtn}
														onPress={() => updateQuantity(item.productId, 1)}
													>
														<Ionicons name="add" size={16} color="#94a3b8" />
													</Pressable>
												</View>
												<Text style={styles.cartItemSubtotal}>
													₱{(item.price * item.quantity).toFixed(2)}
												</Text>
											</View>
										))
									)}
								</View>

								<View style={styles.cartFooter}>
									<View style={styles.paymentSection}>
										<Text style={styles.paymentTitle}>Payment Method</Text>
										<View style={styles.paymentButtons}>
											<Pressable 
												style={[styles.payBtn, paymentMethod === 'Cash' && styles.payBtnActive]}
												onPress={() => setPaymentMethod('Cash')}
											>
												<Text style={[styles.payBtnText, paymentMethod === 'Cash' && styles.payBtnTextActive]}>Cash</Text>
											</Pressable>
											<Pressable 
												style={[styles.payBtn, paymentMethod === 'Purchase Request' && styles.payBtnActive]}
												onPress={() => setPaymentMethod('Purchase Request')}
											>
												<Text style={[styles.payBtnText, paymentMethod === 'Purchase Request' && styles.payBtnTextActive]}>PR</Text>
											</Pressable>
										</View>

										{paymentMethod === 'Cash' ? (
											<View style={{ marginTop: 12 }}>
												<AppTextField
													placeholder="OR Number (Required)"
													value={orNumber}
													onChangeText={setOrNumber}
													placeholderTextColor="#64748b"
													containerStyle={{ backgroundColor: 'rgba(15,23,42,0.8)' }}
												/>
											</View>
										) : (
											<Text style={styles.prNote}>A PR PDF will be generated upon completion.</Text>
										)}
									</View>

									<View style={styles.totalRow}>
										<Text style={styles.totalLabel}>Total Due</Text>
										<Text style={styles.totalValue}>₱{cartTotal.toFixed(2)}</Text>
									</View>

									{permissions.includes('create_sales') ? (
										<AppButton
											title={isSubmitting ? 'Processing...' : 'Complete Sale'}
											onPress={handleCompleteSale}
											disabled={cart.length === 0 || isSubmitting}
											iconName="checkmark-circle"
											style={styles.checkoutBtn}
										/>
									) : (
										<AppButton
											title="Read Only Mode"
											onPress={() => {}}
											disabled={true}
											iconName="lock-closed"
											style={styles.checkoutBtn}
										/>
									)}
									{cart.length > 0 && (
										<Pressable style={styles.clearBtn} onPress={() => setCart([])}>
											<Text style={styles.clearBtnText}>Clear Cart</Text>
										</Pressable>
									)}
								</View>
							</AppCard>
						</View>
					</View>
					</ScrollView>
				)}
			</View>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#020b24',
		position: 'relative',
	},
	innerContainer: {
		flex: 1,
		paddingHorizontal: 16,
	},
	headerWrap: {
		marginBottom: 14,
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
	loadingWrap: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	loadingText: {
		color: '#8da2c0',
		marginTop: 12,
	},
	posLayout: {
		flex: 1,
		flexDirection: 'column', // For mobile. For tablet, you'd use 'row'
		gap: 16,
	},
	productsSection: {
		height: 320,
	},
	sectionTitle: {
		color: '#f3f6ff',
		fontSize: 16,
		fontWeight: '800',
		marginBottom: 12,
	},
	emptyText: {
		color: '#667693',
		fontSize: 13,
		textAlign: 'center',
		marginTop: 20,
	},
	productsScroll: {
		flex: 1,
	},
	productsGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		gap: 10,
	},
	productButton: {
		width: '31%',
		backgroundColor: 'rgba(12,22,44,0.72)',
		borderRadius: 14,
		borderWidth: 1,
		borderColor: 'rgba(59,130,246,0.3)',
		padding: 12,
		alignItems: 'center',
	},
	productButtonIcon: {
		width: 44,
		height: 44,
		borderRadius: 12,
		backgroundColor: 'rgba(96,165,250,0.15)',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 8,
	},
	productButtonName: {
		color: '#e2e8f0',
		fontSize: 13,
		fontWeight: '700',
		textAlign: 'center',
		height: 36,
	},
	productButtonPrice: {
		color: '#34d399',
		fontSize: 14,
		fontWeight: '800',
		marginTop: 4,
	},
	productButtonStock: {
		color: '#64748b',
		fontSize: 10,
		marginTop: 2,
	},
	cartSection: {
		flex: 0,
	},
	cartCard: {
		flex: 1,
		width: '100%',
		maxWidth: '100%',
		padding: 0,
		backgroundColor: 'rgba(18,26,53,0.95)',
		borderColor: 'rgba(115,137,172,0.22)',
		overflow: 'hidden',
		display: 'flex',
		flexDirection: 'column',
	},
	cartHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(129,151,186,0.15)',
	},
	cartTitle: {
		color: '#f8fafc',
		fontSize: 16,
		fontWeight: '800',
	},
	cartCount: {
		color: '#94a3b8',
		fontSize: 13,
	},
	cartItemsScroll: {
		minHeight: 150,
	},
	emptyCartWrap: {
		padding: 40,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 12,
	},
	emptyCartText: {
		color: '#64748b',
		fontSize: 14,
	},
	cartItem: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 12,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(129,151,186,0.1)',
	},
	cartItemInfo: {
		flex: 1,
	},
	cartItemName: {
		color: '#e2e8f0',
		fontSize: 13,
		fontWeight: '600',
	},
	cartItemPrice: {
		color: '#64748b',
		fontSize: 11,
		marginTop: 2,
	},
	quantityControls: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(15,23,42,0.6)',
		borderRadius: 8,
		borderWidth: 1,
		borderColor: 'rgba(129,151,186,0.2)',
		marginHorizontal: 10,
	},
	qtyBtn: {
		padding: 6,
	},
	qtyText: {
		color: '#f8fafc',
		fontSize: 13,
		fontWeight: '700',
		minWidth: 20,
		textAlign: 'center',
	},
	cartItemSubtotal: {
		color: '#34d399',
		fontSize: 14,
		fontWeight: '700',
		width: 60,
		textAlign: 'right',
	},
	cartFooter: {
		padding: 16,
		backgroundColor: 'rgba(15,23,42,0.4)',
		borderTopWidth: 1,
		borderTopColor: 'rgba(129,151,186,0.2)',
	},
	totalRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 16,
	},
	totalLabel: {
		color: '#cbd5e1',
		fontSize: 16,
		fontWeight: '700',
	},
	totalValue: {
		color: '#fbbf24',
		fontSize: 24,
		fontWeight: '900',
	},
	checkoutBtn: {
		height: 52,
		marginBottom: 0,
	},
	clearBtn: {
		marginTop: 12,
		alignItems: 'center',
	},
	clearBtnText: {
		color: '#ef4444',
		fontSize: 13,
		fontWeight: '600',
	},
	paymentSection: {
		marginBottom: 16,
		paddingBottom: 16,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(129,151,186,0.15)',
	},
	paymentTitle: {
		color: '#cbd5e1',
		fontSize: 13,
		fontWeight: '700',
		marginBottom: 8,
	},
	paymentButtons: {
		flexDirection: 'row',
		gap: 8,
	},
	payBtn: {
		flex: 1,
		paddingVertical: 10,
		alignItems: 'center',
		borderRadius: 8,
		backgroundColor: 'rgba(15,23,42,0.8)',
		borderWidth: 1,
		borderColor: 'rgba(129,151,186,0.2)',
	},
	payBtnActive: {
		backgroundColor: 'rgba(59,130,246,0.15)',
		borderColor: 'rgba(59,130,246,0.5)',
	},
	payBtnText: {
		color: '#94a3b8',
		fontSize: 13,
		fontWeight: '600',
	},
	payBtnTextActive: {
		color: '#93c5fd',
	},
	prNote: {
		color: '#34d399',
		fontSize: 11,
		marginTop: 8,
		fontStyle: 'italic',
	},
});
