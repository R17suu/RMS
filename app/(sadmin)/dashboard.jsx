import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import DashboardHeader from '../../components/sadmin/DashboardHeader';
import ProfileMenu from '../../components/sadmin/ProfileMenu';
import StatsGrid from '../../components/sadmin/StatsGrid';
import TicketQueue from '../../components/sadmin/TicketQueue';
import { auth } from '../../FirebaseConfig';
import ThemedView from '../../components/ThemedView';
import WeeklyRevenueChart from '../../components/sadmin/WeeklyRevenueChart';
import WelcomeBanner from '../../components/sadmin/WelcomeBanner';

const stats = [
	{
		label: 'SYSTEM UPTIME',
		value: '99.98%',
		icon: 'pulse',
		iconColor: '#2bd576',
		iconBg: 'rgba(43,213,118,0.14)',
	},
	{
		label: 'API HEALTH',
		value: '24/24',
		icon: 'cloud-done-outline',
		iconColor: '#3f8cff',
		iconBg: 'rgba(63,140,255,0.14)',
	},
	{
		label: 'ERROR LOGS',
		value: '3 OPEN',
		icon: 'warning-outline',
		iconColor: '#a865ff',
		iconBg: 'rgba(168,101,255,0.14)',
	},
	{
		label: 'ACTIVE SESSIONS',
		value: '127',
		icon: 'git-network-outline',
		iconColor: '#f2b31f',
		iconBg: 'rgba(242,179,31,0.14)',
	},
	{
		label: 'USERS CREATED',
		value: '214',
		icon: 'people-circle-outline',
		iconColor: '#06b6d4',
		iconBg: 'rgba(6,182,212,0.14)',
	},
	{
		label: 'ROLES CREATED',
		value: '18',
		icon: 'shield-checkmark-outline',
		iconColor: '#f97316',
		iconBg: 'rgba(249,115,22,0.14)',
	},
];

const weeklySystemAlerts = [
	{ day: 'Mon', amount: '4', height: 52 },
	{ day: 'Tue', amount: '2', height: 34 },
	{ day: 'Wed', amount: '6', height: 82, accent: true },
	{ day: 'Thu', amount: '3', height: 44 },
	{ day: 'Fri', amount: '5', height: 68 },
	{ day: 'Sat', amount: '1', height: 24 },
	{ day: 'Sun', amount: '3', height: 44 },
];

const tickets = [
	{
		id: 'BUG-231',
		title: 'Role assignment fails for newly created accounts',
		severity: 'High',
		status: 'Open',
		reportedBy: 'System Auditor',
		time: '2h ago',
	},
	{
		id: 'OPS-114',
		title: 'Intermittent API timeout on permission sync endpoint',
		severity: 'Critical',
		status: 'Investigating',
		reportedBy: 'Monitoring Service',
		time: '45m ago',
	},
	{
		id: 'BUG-228',
		title: 'Audit log page crashes on large date ranges',
		severity: 'Medium',
		status: 'Open',
		reportedBy: 'QA Team',
		time: '5h ago',
	},
];

export default function SuperAdminDashboardScreen() {
	const router = useRouter();
	const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

	const openProfileMenu = () => {
		setIsProfileMenuOpen(true);
	};

	const closeProfileMenu = () => {
		setIsProfileMenuOpen(false);
	};

	const handleSignOut = async () => {
		try {
			await signOut(auth);
			setIsProfileMenuOpen(false);
			router.replace('/');
		} catch (error) {
			console.error('Failed to sign out:', error);
		}
	};

	return (
		<ThemedView style={styles.container} safe>
			{isProfileMenuOpen ? <Pressable style={styles.overlay} onPress={closeProfileMenu} /> : null}

			{isProfileMenuOpen ? (
				<View style={styles.profileMenuWrap}>
					<ProfileMenu onSignOut={handleSignOut} />
				</View>
			) : null}

			<ScrollView
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				<DashboardHeader onProfilePress={openProfileMenu} />
				<WelcomeBanner />
				<StatsGrid stats={stats} />
				<WeeklyRevenueChart data={weeklySystemAlerts} />
				<TicketQueue tickets={tickets} />
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
});
