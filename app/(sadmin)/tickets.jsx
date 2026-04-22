import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import DashboardHeader from '../../components/sadmin/DashboardHeader';
import ProfileMenu from '../../components/sadmin/ProfileMenu';
import TicketQueue from '../../components/sadmin/TicketQueue';
import { auth } from '../../FirebaseConfig';
import ThemedView from '../../components/ThemedView';
import { Pressable, View } from 'react-native';

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
    {
        id: 'BUG-225',
        title: 'Session timeout does not trigger warning banner',
        severity: 'Low',
        status: 'Resolved',
        reportedBy: 'Security Team',
        time: '1d ago',
    },
];

export default function SuperAdminTicketsScreen() {
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

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <DashboardHeader onProfilePress={openProfileMenu} title="Ticket Center" subtitle="Admin Module" />
                <Text style={styles.subtitle}>Track and monitor bug and system problem reports.</Text>
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
        gap: 12,
    },
    subtitle: {
        color: '#8da2c0',
        fontSize: 14,
        marginTop: 2,
    },
});
