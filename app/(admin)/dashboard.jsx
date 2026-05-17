import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import ClerkHeader from '../../components/clerk/ClerkHeader';
import AdminWelcomeBanner from '../../components/admin/AdminWelcomeBanner';
import ClerkStatsGrid from '../../components/clerk/ClerkStatsGrid';
import AdminQuickActions from '../../components/admin/AdminQuickActions';
import SaleCard from '../../components/clerk/SaleCard';
import ProfileMenu from '../../components/sadmin/ProfileMenu';
import AppCard from '../../components/AppCard';
import AppToast from '../../components/AppToast';
import ThemedView from '../../components/ThemedView';
import { auth } from '../../FirebaseConfig';
import { fetchProducts } from '../../services/productService';
import { fetchSalesHistory, fetchPendingPRs } from '../../services/saleService';
import { getWeeklySalesData } from '../../services/dashboardService';
import WeeklySalesChart from '../../components/admin/WeeklySalesChart';
import LowStockAlerts from '../../components/admin/LowStockAlerts';

export default function AdminDashboardScreen() {
	const router = useRouter();
	const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [toast, setToast] = useState({ message: '', type: 'error' });
	const [stats, setStats] = useState({
		todaysRevenue: 0,
		pendingPRCount: 0,
		lowStockAlerts: 0,
		totalProducts: 0,
	});
	const [recentSales, setRecentSales] = useState([]);
    const [weeklySales, setWeeklySales] = useState([]);
    const [lowStockItems, setLowStockItems] = useState([]);

	useEffect(() => {
		const loadDashboardData = async () => {
			try {
				const [products, sales, pendingPRs, weeklySalesData] = await Promise.all([
					fetchProducts(),
					fetchSalesHistory(),
					fetchPendingPRs(),
                    getWeeklySalesData()
				]);

				// Calculate today's revenue and items sold
				const today = new Date();
				today.setHours(0, 0, 0, 0);
				
				let todaysRev = 0;
				let itemsSold = 0;
				
				sales.forEach(sale => {
					const saleDate = sale.createdAt?.toDate ? sale.createdAt.toDate() : new Date(sale.createdAt);
					if (saleDate >= today) {
						todaysRev += parseFloat(sale.totalAmount || 0);
						sale.items?.forEach(item => {
							itemsSold += parseInt(item.quantity || 0, 10);
						});
					}
				});

				const lowStock = products.filter(p => p.stock <= (p.reorderPoint || 10));

				setStats({
					todaysRevenue: todaysRev,
					pendingPRCount: pendingPRs.length,
					lowStockAlerts: lowStock.length,
					totalProducts: products.length,
				});

				setRecentSales(sales.slice(0, 3));
                setWeeklySales(weeklySalesData);
                setLowStockItems(lowStock);
			} catch (error) {
				console.error('Error loading dashboard:', error);
				showToast('Failed to load dashboard data');
			} finally {
				setIsLoading(false);
			}
		};

		loadDashboardData();
	}, []);

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

	const handleNavigate = (tabName) => {
		router.push(`/(admin)/${tabName}`);
	};

	const statsDataArray = [
		{
			label: "TODAY'S REVENUE",
			value: `₱${stats.todaysRevenue.toFixed(2)}`,
			icon: 'cash-outline',
			iconColor: '#34d399',
			iconBg: 'rgba(52,211,153,0.14)',
		},
		{
			label: 'DRAFT POs',
			value: String(stats.pendingPRCount),
			icon: 'document-text-outline',
			iconColor: '#f59e0b',
			iconBg: 'rgba(245,158,11,0.14)',
		},
		{
			label: 'LOW STOCK',
			value: String(stats.lowStockAlerts),
			icon: 'alert-circle-outline',
			iconColor: '#ef4444',
			iconBg: 'rgba(239,68,68,0.14)',
		},
		{
			label: 'TOTAL PRODUCTS',
			value: String(stats.totalProducts),
			icon: 'pricetags-outline',
			iconColor: '#fbbf24',
			iconBg: 'rgba(251,191,36,0.14)',
		},
	];

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
				<ClerkHeader onProfilePress={openProfileMenu} />
			</View>
			<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
				<AdminWelcomeBanner />

				{isLoading ? (
					<View style={styles.loadingWrap}>
						<ActivityIndicator size="large" color="#f59e0b" />
						<Text style={styles.loadingText}>Loading Dashboard...</Text>
					</View>
				) : (
					<>
						<ClerkStatsGrid stats={statsDataArray} />
						<AdminQuickActions onNavigate={handleNavigate} />
                        
                        <WeeklySalesChart data={weeklySales} />
                        
                        <LowStockAlerts lowStockProducts={lowStockItems} />

						<AppCard style={styles.recentCard}>
							<Text style={styles.sectionTitle}>Recent Sales</Text>
							{recentSales.length === 0 ? (
								<Text style={styles.emptyText}>No sales yet today</Text>
							) : (
								<View style={styles.salesList}>
									{recentSales.map((sale) => (
										<SaleCard key={sale.id} sale={sale} />
									))}
								</View>
							)}
						</AppCard>
					</>
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
		gap: 14,
	},
	loadingWrap: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 40,
	},
	loadingText: {
		color: '#8da2c0',
		marginTop: 12,
	},
	recentCard: {
		width: '100%',
		maxWidth: '100%',
		alignSelf: 'stretch',
		borderRadius: 18,
		paddingHorizontal: 14,
		paddingVertical: 16,
		backgroundColor: 'rgba(18,26,53,0.95)',
		borderColor: 'rgba(115,137,172,0.22)',
	},
	sectionTitle: {
		color: '#f3f6ff',
		fontSize: 15,
		fontWeight: '800',
		marginBottom: 12,
	},
	emptyText: {
		color: '#667693',
		fontSize: 13,
		textAlign: 'center',
		paddingVertical: 20,
	},
	salesList: {
		gap: 10,
	},
});
