import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import DashboardHeader from '../../components/sadmin/DashboardHeader';
import LogsFeed from '../../components/sadmin/LogsFeed';
import ProfileMenu from '../../components/sadmin/ProfileMenu';
import { auth } from '../../FirebaseConfig';
import ThemedView from '../../components/ThemedView';
import { Pressable, View } from 'react-native';

const logs = [
    {
        id: 'LOG-901',
        level: 'INFO',
        message: 'Role sync completed for all active users.',
        service: 'RBAC Service',
        actor: 'System Scheduler',
        time: '10:42 AM',
    },
    {
        id: 'LOG-902',
        level: 'WARN',
        message: 'Slow query detected on audit report endpoint (>1200ms).',
        service: 'Reporting API',
        actor: 'Performance Monitor',
        time: '10:55 AM',
    },
    {
        id: 'LOG-903',
        level: 'ERROR',
        message: 'Failed login attempts exceeded threshold for account clerk.14.',
        service: 'Auth Guard',
        actor: 'Security Gateway',
        time: '11:07 AM',
    },
    {
        id: 'LOG-904',
        level: 'INFO',
        message: 'Backup snapshot completed successfully.',
        service: 'Backup Worker',
        actor: 'Infra Bot',
        time: '11:20 AM',
    },
];

export default function SuperAdminLogsScreen() {
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
                <DashboardHeader onProfilePress={openProfileMenu} title="Logs Center" subtitle="Admin Module" />
                <Text style={styles.subtitle}>Track system events, warnings, and errors for diagnostics.</Text>
                <LogsFeed logs={logs} />
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
