import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import React, { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import ProductCard from '../../components/clerk/ProductCard';
import ProfileMenu from '../../components/sadmin/ProfileMenu';
import AppCard from '../../components/AppCard';
import AppButton from '../../components/AppButton';
import AppTextField from '../../components/AppTextField';
import AppToast from '../../components/AppToast';
import ThemedView from '../../components/ThemedView';
import { auth } from '../../FirebaseConfig';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../../services/productService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CATEGORIES = ['All', 'Consigned', 'Purchased'];
const UOM_OPTIONS = ['pcs', 'boxes', 'sets', 'pairs', 'packs'];

export default function SharedProductsScreen({ headerComponent, role = 'admin' }) {
	const router = useRouter();
	const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
	const [toast, setToast] = useState({ message: '', type: 'error' });
	const [products, setProducts] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('All');
	const [showAddForm, setShowAddForm] = useState(false);
	const [isCreating, setIsCreating] = useState(false);

	// Form fields
	const [newName, setNewName] = useState('');
	const [newCategory, setNewCategory] = useState('Consigned');
	const [newPrice, setNewPrice] = useState('');
	const [newStock, setNewStock] = useState('');
	const [newSku, setNewSku] = useState('');
	const [newDescription, setNewDescription] = useState('');
	const [newUom, setNewUom] = useState('pcs');
	const [newReorderPoint, setNewReorderPoint] = useState('10');

	// Edit state
	const [editingProduct, setEditingProduct] = useState(null);
	const [isUpdating, setIsUpdating] = useState(false);
	const [userPermissions, setUserPermissions] = useState([]);

	useFocusEffect(
		useCallback(() => {
			loadProducts();
			loadPermissions();
		}, [])
	);

	const loadPermissions = async () => {
		try {
			const permsStr = await AsyncStorage.getItem('user_permissions');
			if (permsStr) setUserPermissions(JSON.parse(permsStr));
		} catch (error) {
			console.error('Failed to load permissions:', error);
		}
	};

	const loadProducts = async () => {
		try {
			const data = await fetchProducts();
			setProducts(data);
		} catch (error) {
			console.error('Error fetching products:', error);
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

	const handleCreateProduct = async () => {
		if (!newName.trim()) {
			showToast('Product name is required.');
			return;
		}
		if (!newPrice.trim() || isNaN(newPrice)) {
			showToast('Valid price is required.');
			return;
		}

		setIsCreating(true);
		try {
			const newProduct = await createProduct({
				name: newName.trim(),
				category: newCategory,
				price: parseFloat(newPrice),
				stock: parseInt(newStock) || 0,
				sku: newSku.trim().toUpperCase(),
				description: newDescription.trim(),
				uom: newUom,
				reorderPoint: parseInt(newReorderPoint) || 10,
			});

			setProducts((prev) => [newProduct, ...prev]);
			setNewName('');
			setNewPrice('');
			setNewStock('');
			setNewSku('');
			setNewDescription('');
			setNewUom('pcs');
			setNewReorderPoint('10');
			setNewCategory('Consigned');
			setShowAddForm(false);
			showToast('Product added successfully.', 'success');
		} catch (error) {
			console.error('Error creating product:', error);
			showToast('Failed to add product.');
		} finally {
			setIsCreating(false);
		}
	};

	const handleEditProduct = (product) => {
		setEditingProduct(product);
		setNewName(product.name);
		setNewCategory(product.category);
		setNewPrice(product.price.toString());
		setNewStock(product.stock.toString());
		setNewSku(product.sku || '');
		setNewDescription(product.description || '');
		setNewUom(product.uom || 'pcs');
		setNewReorderPoint(product.reorderPoint?.toString() || '10');
		setShowAddForm(true);
	};

	const handleUpdateProduct = async () => {
		if (!newName.trim()) {
			showToast('Product name is required.');
			return;
		}
		if (!newPrice.trim() || isNaN(newPrice)) {
			showToast('Valid price is required.');
			return;
		}

		setIsUpdating(true);
		try {
			const updates = {
				name: newName.trim(),
				category: newCategory,
				price: parseFloat(newPrice),
				stock: parseInt(newStock) || 0,
				sku: newSku.trim().toUpperCase(),
				description: newDescription.trim(),
				uom: newUom,
				reorderPoint: parseInt(newReorderPoint) || 10,
			};
			await updateProduct(editingProduct.id, updates);

			setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...updates } : p));

			setEditingProduct(null);
			setNewName('');
			setNewPrice('');
			setNewStock('');
			setNewSku('');
			setNewDescription('');
			setNewUom('pcs');
			setNewReorderPoint('10');
			setNewCategory('Consigned');
			setShowAddForm(false);
			showToast('Product updated successfully.', 'success');
		} catch (error) {
			console.error('Error updating product:', error);
			showToast('Failed to update product.');
		} finally {
			setIsUpdating(false);
		}
	};

	const handleDeleteProduct = async (product) => {
		// In a real app, you might use an Alert dialog here
		if (confirm(`Are you sure you want to delete ${product.name}?`)) {
			try {
				await deleteProduct(product.id);
				setProducts(prev => prev.filter(p => p.id !== product.id));
				showToast('Product deleted successfully.', 'success');
			} catch (error) {
				console.error('Error deleting product:', error);
				showToast('Failed to delete product.');
			}
		}
	};

	const filteredProducts = products.filter((prod) => {
		const matchesSearch = prod.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			prod.sku?.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesCategory = selectedCategory === 'All' || prod.category === selectedCategory;
		return matchesSearch && matchesCategory;
	});

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
				{headerComponent && React.cloneElement(headerComponent, { onProfilePress: openProfileMenu })}
			</View>
			<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

				<AppTextField
					leftIconName="search"
					leftIconColor="#667693"
					value={searchQuery}
					onChangeText={setSearchQuery}
					placeholder="Search products or SKU..."
					placeholderTextColor="#667693"
				/>

				<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
					{CATEGORIES.map((cat) => (
						<Pressable
							key={cat}
							style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
							onPress={() => setSelectedCategory(cat)}
						>
							<Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
								{cat}
							</Text>
						</Pressable>
					))}
				</ScrollView>

				{(role !== 'clerk' || userPermissions.includes('create_products') || userPermissions.includes('manage_products')) && (
					<Pressable
						style={styles.addToggle}
						onPress={() => {
							if (showAddForm) {
								setShowAddForm(false);
								setEditingProduct(null);
								setNewName('');
								setNewPrice('');
								setNewStock('');
								setNewSku('');
								setNewDescription('');
								setNewUom('pcs');
								setNewReorderPoint('10');
								setNewCategory('Consigned');
							} else {
								setShowAddForm(true);
							}
						}}
					>
						<Text style={styles.addToggleText}>
							{showAddForm ? '✕  Close Form' : '+  Add New Souvenir'}
						</Text>
					</Pressable>
				)}

				{showAddForm ? (
					<AppCard style={styles.formCard}>
						<Text style={styles.formTitle}>
							{editingProduct ? 'Edit Souvenir Item' : 'New Souvenir Item'}
						</Text>

						<View style={styles.formFields}>
							<AppTextField
								label="Product Name"
								leftIconName="pricetag-outline"
								value={newName}
								onChangeText={setNewName}
								placeholder="e.g. City Logo T-Shirt"
								placeholderTextColor="#667693"
							/>

							<Text style={styles.fieldLabel}>Category</Text>
							<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
								{CATEGORIES.filter(c => c !== 'All').map((cat) => (
									<Pressable
										key={cat}
										style={[styles.categoryChip, newCategory === cat && styles.categoryChipActive]}
										onPress={() => setNewCategory(cat)}
									>
										<Text style={[styles.categoryText, newCategory === cat && styles.categoryTextActive]}>
											{cat}
										</Text>
									</Pressable>
								))}
							</ScrollView>

							<View style={styles.rowFields}>
								<View style={{ flex: 1 }}>
									<AppTextField
										label="Price (₱)"
										leftIconName="cash-outline"
										value={newPrice}
										onChangeText={setNewPrice}
										placeholder="0.00"
										keyboardType="decimal-pad"
										placeholderTextColor="#667693"
									/>
								</View>
								<View style={{ flex: 1 }}>
									<AppTextField
										label="Initial Stock"
										leftIconName="layers-outline"
										value={newStock}
										onChangeText={setNewStock}
										placeholder="0"
										keyboardType="number-pad"
										placeholderTextColor="#667693"
									/>
								</View>
							</View>

							<AppTextField
								label="SKU (Optional)"
								leftIconName="barcode-outline"
								value={newSku}
								onChangeText={setNewSku}
								placeholder="e.g. TSHIRT-001"
								placeholderTextColor="#667693"
							/>

							<AppTextField
								label="Description (Optional)"
								leftIconName="document-text-outline"
								value={newDescription}
								onChangeText={setNewDescription}
								placeholder="Brief product description"
								placeholderTextColor="#667693"
							/>

							<Text style={styles.fieldLabel}>Unit of Measure</Text>
							<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
								{UOM_OPTIONS.map((u) => (
									<Pressable
										key={u}
										style={[styles.categoryChip, newUom === u && styles.categoryChipActive]}
										onPress={() => setNewUom(u)}
									>
										<Text style={[styles.categoryText, newUom === u && styles.categoryTextActive]}>
											{u}
										</Text>
									</Pressable>
								))}
							</ScrollView>

							<AppTextField
								label="Reorder Point (Low Stock Alert Threshold)"
								leftIconName="alert-circle-outline"
								value={newReorderPoint}
								onChangeText={setNewReorderPoint}
								placeholder="10"
								keyboardType="number-pad"
								placeholderTextColor="#667693"
							/>
						</View>

						<AppButton
							title={editingProduct ? (isUpdating ? 'Updating...' : 'Update Souvenir') : (isCreating ? 'Adding...' : 'Add Souvenir')}
							onPress={editingProduct ? handleUpdateProduct : handleCreateProduct}
							disabled={isCreating || isUpdating}
							iconName={editingProduct ? "save-outline" : "add-circle-outline"}
							style={styles.submitButton}
						/>
					</AppCard>
				) : null}

				<View style={styles.listHeader}>
					<Text style={styles.sectionTitle}>
						Catalog ({filteredProducts.length})
					</Text>
					{isLoading && <ActivityIndicator size="small" color="#3b82f6" />}
				</View>

				{isLoading ? (
					<View style={styles.loadingWrap}>
						<ActivityIndicator size="large" color="#3b82f6" />
						<Text style={styles.loadingText}>Loading Catalog...</Text>
					</View>
				) : filteredProducts.length === 0 ? (
					<View style={styles.emptyWrap}>
						<Text style={styles.emptyText}>
							{searchQuery || selectedCategory !== 'All'
								? 'No products match your filter.'
								: 'No products in catalog yet.'}
						</Text>
					</View>
				) : (
					<View style={styles.productList}>
						{filteredProducts.map((prod) => {
							const canEdit = role !== 'clerk' || userPermissions.includes('edit_products') || userPermissions.includes('manage_products');
							const canDelete = role !== 'clerk' || userPermissions.includes('delete_products') || userPermissions.includes('manage_products');

							return (
								<ProductCard 
									key={prod.id} 
									product={prod} 
									onEdit={canEdit ? handleEditProduct : undefined}
									onDelete={canDelete ? handleDeleteProduct : undefined}
								/>
							);
						})}
					</View>
				)}
			</ScrollView>
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
	categoryRow: {
		flexDirection: 'row',
		gap: 8,
		paddingVertical: 2,
	},
	categoryChip: {
		borderRadius: 999,
		paddingHorizontal: 14,
		paddingVertical: 8,
		backgroundColor: 'rgba(16,27,52,0.8)',
		borderWidth: 1,
		borderColor: 'rgba(129,151,186,0.22)',
	},
	categoryChipActive: {
		backgroundColor: 'rgba(59,130,246,0.18)',
		borderColor: 'rgba(59,130,246,0.5)',
	},
	categoryText: {
		color: '#8ea3c4',
		fontSize: 12,
		fontWeight: '700',
	},
	categoryTextActive: {
		color: '#93c5fd',
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
	rowFields: {
		flexDirection: 'row',
		gap: 10,
	},
	fieldLabel: {
		color: '#a8bbd7',
		fontSize: 13,
		fontWeight: '700',
		marginTop: 4,
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
	},
	sectionTitle: {
		color: '#f3f6ff',
		fontSize: 15,
		fontWeight: '800',
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
	productList: {
		gap: 10,
	},
});
