import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import DashboardHeader from '../../components/sadmin/DashboardHeader';
import ProfileMenu from '../../components/sadmin/ProfileMenu';
import StatsGrid from '../../components/sadmin/StatsGrid';
import TicketQueue from '../../components/sadmin/TicketQueue';
import { auth } from '../../FirebaseConfig';
import ThemedView from '../../components/ThemedView';
import WeeklySystemAlertsChart from '../../components/sadmin/WeeklySystemAlertsChart';
import WelcomeBanner from '../../components/sadmin/WelcomeBanner';
import { getDashboardStats } from '../../services/dashboardService';
import { fetchTickets } from '../../services/ticketService';

const weeklySystemAlerts = [
	{ day: 'Mon', amount: '4', height: 52 },
	{ day: 'Tue', amount: '2', height: 34 },
	{ day: 'Wed', amount: '6', height: 82, accent: true },
	{ day: 'Thu', amount: '3', height: 44 },
	{ day: 'Fri', amount: '5', height: 68 },
	{ day: 'Sat', amount: '1', height: 24 },
	{ day: 'Sun', amount: '3', height: 44 },
];

export default function SuperAdminDashboardScreen() {
    const router = useRouter();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [dynamicStats, setDynamicStats] = useState({
        totalUsers: 0,
        activeSessions: 0,
        totalRoles: 0,
        errorLogs: 0
    });
    const [recentTickets, setRecentTickets] = useState([]);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                // Fetch stats and tickets concurrently
                const [statsData, ticketsData] = await Promise.all([
                    getDashboardStats(),
                    fetchTickets()
                ]);
                
                setDynamicStats(statsData);
                // Only show the 3 most recent tickets
                setRecentTickets(ticketsData.slice(0, 3));
            } catch (error) {
                console.error("Error loading dashboard data", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    // Construct the stats array dynamically using our design format
    const statsDataArray = [
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
            value: `${dynamicStats.errorLogs} FOUND`,
            icon: 'warning-outline',
            iconColor: '#a865ff',
            iconBg: 'rgba(168,101,255,0.14)',
        },
        {
            label: 'ACTIVE SESSIONS',
            value: String(dynamicStats.activeSessions),
            icon: 'git-network-outline',
            iconColor: '#f2b31f',
            iconBg: 'rgba(242,179,31,0.14)',
        },
        {
            label: 'USERS CREATED',
            value: String(dynamicStats.totalUsers),
            icon: 'people-circle-outline',
            iconColor: '#06b6d4',
            iconBg: 'rgba(6,182,212,0.14)',
        },
        {
            label: 'ROLES CREATED',
            value: String(dynamicStats.totalRoles),
            icon: 'shield-checkmark-outline',
            iconColor: '#f97316',
            iconBg: 'rgba(249,115,22,0.14)',
        },
    ];

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
                
                {isLoading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 }}>
                        <ActivityIndicator size="large" color="#667693" />
                        <Text style={{ color: '#8da2c0', marginTop: 12 }}>Loading System Status...</Text>
                    </View>
                ) : (
                    <>
                        <StatsGrid stats={statsDataArray} />
                        <WeeklySystemAlertsChart data={weeklySystemAlerts} />
                        <TicketQueue tickets={recentTickets} />
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
