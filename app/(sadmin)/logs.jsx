import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, ActivityIndicator } from 'react-native';
import DashboardHeader from '../../components/sadmin/DashboardHeader';
import LogsFeed from '../../components/sadmin/LogsFeed';
import ProfileMenu from '../../components/sadmin/ProfileMenu';
import { auth } from '../../FirebaseConfig';
import ThemedView from '../../components/ThemedView';
import AppButton from '../../components/AppButton';
import AppToast from '../../components/AppToast';
import { fetchLogs, createLog, clearAllLogs } from '../../services/logService';



export default function SuperAdminLogsScreen() {
    const router = useRouter();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');
    
    // Action states
    const [isGenerating, setIsGenerating] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [toast, setToast] = useState({ message: '', type: 'error' });

    const loadLogs = async (filter) => {
        setIsLoading(true);
        try {
            const fetchedLogs = await fetchLogs(filter);
            setLogs(fetchedLogs);
        } catch (error) {
            console.error('Error fetching logs:', error);
            showToast('Failed to load logs');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadLogs(activeFilter);
    }, [activeFilter]);

    const showToast = (message, type = 'error') => {
        setToast({ message, type });
    };

    const handleGenerateFakeLog = async () => {
        setIsGenerating(true);
        try {
            const levels = ['INFO', 'WARN', 'ERROR'];
            const randomLevel = levels[Math.floor(Math.random() * levels.length)];
            
            const newLog = await createLog({
                level: randomLevel,
                message: `This is an auto-generated test log (${Math.random().toString(36).substring(7)}).`,
                service: 'Test Service',
                actor: 'Super Admin',
            });
            
            // Add to UI if it matches current filter
            if (activeFilter === 'All' || activeFilter === randomLevel) {
                setLogs(prev => [newLog, ...prev]);
            }
            showToast('Generated fake log', 'success');
        } catch (error) {
            console.error('Error creating log:', error);
            showToast('Failed to generate fake log');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleClearAllLogs = async () => {
        setIsClearing(true);
        try {
            await clearAllLogs();
            setLogs([]);
            showToast('All logs cleared successfully', 'success');
        } catch (error) {
            console.error('Error clearing logs:', error);
            showToast('Failed to clear logs');
        } finally {
            setIsClearing(false);
        }
    };

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

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <DashboardHeader onProfilePress={openProfileMenu} title="Logs Center" subtitle="Admin Module" />
                <Text style={styles.subtitle}>Track system events, warnings, and errors for diagnostics.</Text>
                
                <View style={styles.actionsRow}>
                    <AppButton 
                        title={isGenerating ? "Generating..." : "Generate Fake Log"} 
                        onPress={handleGenerateFakeLog} 
                        disabled={isGenerating || isClearing}
                        style={styles.actionButton}
                        iconName="construct-outline"
                    />
                    <AppButton 
                        title={isClearing ? "Clearing..." : "Clear All Logs"} 
                        onPress={handleClearAllLogs} 
                        disabled={isClearing || isGenerating || logs.length === 0}
                        style={[styles.actionButton, styles.dangerButton]}
                        textStyle={styles.dangerButtonText}
                        iconName="trash-outline"
                    />
                </View>

                {isLoading ? (
                    <ActivityIndicator size="small" color="#667693" style={{ marginTop: 20 }} />
                ) : logs.length === 0 ? (
                    <>
                        <LogsFeed logs={[]} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
                        <Text style={styles.emptyText}>No logs found for this filter.</Text>
                    </>
                ) : (
                    <LogsFeed logs={logs} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
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
        gap: 12,
    },
    subtitle: {
        color: '#8da2c0',
        fontSize: 14,
        marginTop: 2,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 10,
        marginVertical: 10,
    },
    actionButton: {
        flex: 1,
        height: 48,
        marginVertical: 0,
    },
    dangerButton: {
        backgroundColor: 'rgba(239,68,68,0.1)',
        borderColor: 'rgba(239,68,68,0.3)',
    },
    dangerButtonText: {
        color: '#ff6b76',
    },
    emptyText: {
        color: '#8da2c0',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 20,
    },
});
