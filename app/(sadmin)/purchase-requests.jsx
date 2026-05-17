import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, Modal, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '../../FirebaseConfig';
import AppCard from '../../components/AppCard';
import AppButton from '../../components/AppButton';
import AppToast from '../../components/AppToast';
import AppTextField from '../../components/AppTextField';
import ThemedView from '../../components/ThemedView';
import ClerkHeader from '../../components/clerk/ClerkHeader';
import ProfileMenu from '../../components/sadmin/ProfileMenu';
import PendingPRCard from '../../components/admin/PendingPRCard';
import { fetchPendingPRs, approvePurchaseRequest, rejectPurchaseRequest } from '../../services/saleService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function SadminPurchaseRequestsScreen() {
	const router = useRouter();
	const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
	const [toast, setToast] = useState({ message: '', type: 'error' });
	const [isLoading, setIsLoading] = useState(true);
	const [pendingPRs, setPendingPRs] = useState([]);
	const [permissions, setPermissions] = useState([]);
	
	const [selectedPR, setSelectedPR] = useState(null);
	const [poNumber, setPoNumber] = useState('');
	const [isProcessing, setIsProcessing] = useState(false);

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
			setIsLoading(true);
			const prs = await fetchPendingPRs();
			setPendingPRs(prs);
		} catch (error) {
			console.error('Error fetching pending PRs:', error);
			showToast('Failed to load pending Purchase Requests');
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

	const handleApprove = async () => {
		if (!poNumber.trim()) {
			showToast('Official PO Number is required for approval.');
			return;
		}

		setIsProcessing(true);
		try {
			const officerId = auth.currentUser?.uid || 'admin';
			await approvePurchaseRequest(selectedPR.id, poNumber.trim(), officerId);
			
			// Generate PDF
			const htmlContent = `
				<html>
					<head>
						<style>
							body { font-family: 'Helvetica', sans-serif; padding: 20px; }
							h1 { color: #f59e0b; text-align: center; }
							table { width: 100%; border-collapse: collapse; margin-top: 20px; }
							th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
							th { background-color: #f3f4f6; }
							.total { font-weight: bold; font-size: 18px; text-align: right; margin-top: 20px; }
							.header-info { margin-bottom: 30px; }
						</style>
					</head>
					<body>
						<h1>Approved Purchase Order</h1>
						<div class="header-info">
							<p><strong>PO Number:</strong> ${poNumber.trim()}</p>
							<p><strong>Original PR Number:</strong> ${selectedPR.paymentDetails.prDocument || selectedPR.id}</p>
							<p><strong>Date Approved:</strong> ${new Date().toLocaleString()}</p>
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
								${(selectedPR.items || []).map(item => `
									<tr>
										<td>${item.name}</td>
										<td>${item.quantity}</td>
										<td>PHP ${parseFloat(item.price).toFixed(2)}</td>
										<td>PHP ${(item.price * item.quantity).toFixed(2)}</td>
									</tr>
								`).join('')}
							</tbody>
						</table>
						<div class="total">Total Approved: PHP ${parseFloat(selectedPR.totalAmount).toFixed(2)}</div>
					</body>
				</html>
			`;
			const { uri } = await Print.printToFileAsync({ html: htmlContent });
			
			showToast('Purchase Request approved and stock deducted.', 'success');
			setSelectedPR(null);
			setPoNumber('');
			loadData();

			if (await Sharing.isAvailableAsync()) {
				await Sharing.shareAsync(uri);
			}

		} catch (error) {
			console.error('Error approving PR:', error);
			showToast('Failed to approve PR.');
		} finally {
			setIsProcessing(false);
		}
	};

	const handleReject = () => {
		Alert.alert(
			'Reject Purchase Request',
			'Are you sure you want to reject this Purchase Request?',
			[
				{ text: 'Cancel', style: 'cancel' },
				{ 
					text: 'Reject', 
					style: 'destructive',
					onPress: async () => {
						setIsProcessing(true);
						try {
							const officerId = auth.currentUser?.uid || 'admin';
							await rejectPurchaseRequest(selectedPR.id, officerId);
							showToast('Purchase Request rejected.', 'success');
							setSelectedPR(null);
							loadData();
						} catch (error) {
							console.error('Error rejecting PR:', error);
							showToast('Failed to reject PR.');
						} finally {
							setIsProcessing(false);
						}
					}
				}
			]
		);
	};

	const renderReviewModal = () => {
		if (!selectedPR) return null;

		const totalItems = selectedPR.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

		return (
			<Modal
				visible={!!selectedPR}
				animationType="slide"
				transparent={true}
				onRequestClose={() => {
					setSelectedPR(null);
					setPoNumber('');
				}}
			>
				<KeyboardAvoidingView 
					style={styles.modalOverlay} 
					behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				>
					<AppCard style={styles.modalCard}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>Review Purchase Request</Text>
							<Pressable onPress={() => { setSelectedPR(null); setPoNumber(''); }} style={styles.closeBtn}>
								<Ionicons name="close-circle-outline" size={26} color="#ef4444" />
							</Pressable>
						</View>

						<ScrollView style={styles.reviewScroll} showsVerticalScrollIndicator={false}>
							<View style={styles.summaryBox}>
								<Text style={styles.summaryLabel}>Requested By Clerk:</Text>
								<Text style={styles.summaryValue}>{selectedPR.clerkName || selectedPR.clerkId}</Text>
								
								<Text style={[styles.summaryLabel, {marginTop: 8}]}>Total Amount:</Text>
								<Text style={styles.summaryTotal}>₱{parseFloat(selectedPR.totalAmount).toFixed(2)}</Text>
								
								<Text style={[styles.summaryLabel, {marginTop: 8}]}>Total Items:</Text>
								<Text style={styles.summaryValue}>{totalItems}</Text>
							</View>

							<Text style={styles.itemsTitle}>Requested Items:</Text>
							{selectedPR.items?.map((item, idx) => (
								<View key={idx} style={styles.itemRow}>
									<Text style={styles.itemQty}>{item.quantity}x</Text>
									<Text style={styles.itemName}>{item.name}</Text>
									<Text style={styles.itemPrice}>₱{(item.price * item.quantity).toFixed(2)}</Text>
								</View>
							))}
						</ScrollView>

						{/* Action Section pinned at bottom inside the Card */}
						{permissions.includes('approve_purchase_requests') && (
							<View style={styles.actionSection}>
								<View style={styles.inputWrap}>
									<AppTextField
										label="Assign Official PO Number *"
										placeholder="e.g. PO-2026-001"
										value={poNumber}
										onChangeText={setPoNumber}
										placeholderTextColor="#667693"
									/>
								</View>
								
								<View style={styles.actionButtons}>
									<Pressable 
										style={[styles.rejectBtn, isProcessing && {opacity: 0.5}]} 
										onPress={handleReject}
										disabled={isProcessing}
									>
										<Text style={styles.rejectBtnText}>Reject</Text>
									</Pressable>
									<AppButton
										title={isProcessing ? "Processing..." : "Approve & Issue PO"}
										onPress={handleApprove}
										disabled={isProcessing || !poNumber.trim()}
										style={styles.approveBtn}
									/>
								</View>
							</View>
						)}
					</AppCard>
				</KeyboardAvoidingView>
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

			<View style={styles.innerContainer}>
				<View style={styles.headerWrap}>
					<ClerkHeader onProfilePress={openProfileMenu} title="Pending Draft POs" />
				</View>

				{isLoading ? (
					<View style={styles.loadingWrap}>
						<ActivityIndicator size="large" color="#f59e0b" />
						<Text style={styles.loadingText}>Loading Requests...</Text>
					</View>
				) : (
					<ScrollView style={styles.listScroll} contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
						{pendingPRs.length === 0 ? (
							<View style={styles.emptyWrap}>
								<Text style={styles.emptyText}>No pending purchase requests.</Text>
							</View>
						) : (
							pendingPRs.map((pr) => (
								<PendingPRCard key={pr.id} pr={pr} onReview={setSelectedPR} />
							))
						)}
					</ScrollView>
				)}
			</View>

			{renderReviewModal()}
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
		paddingBottom: 24,
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
	listScroll: {
		flex: 1,
	},
	listContainer: {
		gap: 12,
		paddingBottom: 20,
	},
	emptyWrap: {
		alignItems: 'center',
		paddingVertical: 40,
	},
	emptyText: {
		color: '#667693',
		fontSize: 14,
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
		maxHeight: '90%',
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
		color: '#f59e0b',
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
	actionSection: {
		paddingTop: 16,
		borderTopWidth: 1,
		borderTopColor: 'rgba(129,151,186,0.2)',
	},
	inputWrap: {
		marginBottom: 6,
	},
	actionButtons: {
		flexDirection: 'row',
		gap: 12,
		marginTop: 16,
		alignItems: 'center',
	},
	rejectBtn: {
		flex: 1,
		paddingVertical: 14,
		alignItems: 'center',
		borderRadius: 12,
		backgroundColor: 'rgba(239,68,68,0.1)',
		borderWidth: 1,
		borderColor: 'rgba(239,68,68,0.3)',
	},
	rejectBtnText: {
		color: '#ef4444',
		fontSize: 14,
		fontWeight: '700',
	},
	approveBtn: {
		flex: 2,
		marginBottom: 0,
	},
});
