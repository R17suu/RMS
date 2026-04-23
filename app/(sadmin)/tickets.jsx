import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, ActivityIndicator, Pressable } from 'react-native';
import DashboardHeader from '../../components/sadmin/DashboardHeader';
import ProfileMenu from '../../components/sadmin/ProfileMenu';
import TicketQueue from '../../components/sadmin/TicketQueue';
import { auth } from '../../FirebaseConfig';
import ThemedView from '../../components/ThemedView';
import AppCard from '../../components/AppCard';
import AppTextField from '../../components/AppTextField';
import AppButton from '../../components/AppButton';
import AppToast from '../../components/AppToast';
import { fetchTickets, createTicket, updateTicketStatus, deleteTicketRecord } from '../../services/ticketService';

const SEVERITY_OPTIONS = ['Critical', 'High', 'Medium', 'Low'];



export default function SuperAdminTicketsScreen() {
    const router = useRouter();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Form state
    const [title, setTitle] = useState('');
    const [severity, setSeverity] = useState('Medium');
    const [isCreating, setIsCreating] = useState(false);
    const [toast, setToast] = useState({ message: '', type: 'error' });

    useEffect(() => {
        const loadTickets = async () => {
            try {
                const fetchedTickets = await fetchTickets();
                setTickets(fetchedTickets);
            } catch (error) {
                console.error('Error fetching tickets:', error);
                showToast('Failed to load tickets');
            } finally {
                setIsLoading(false);
            }
        };

        loadTickets();
    }, []);

    const showToast = (message, type = 'error') => {
        setToast({ message, type });
    };

    const handleCreateTicket = async () => {
        const normalizedTitle = title.trim();

        if (!normalizedTitle) {
            showToast('Ticket title is required.');
            return;
        }

        setIsCreating(true);

        try {
            const newTicketData = {
                title: normalizedTitle,
                severity: severity,
                status: 'Open',
                reportedBy: 'Super Admin', // Hardcoded for now
            };

            const newTicket = await createTicket(newTicketData);
            setTickets((prev) => [newTicket, ...prev]);
            
            setTitle('');
            setSeverity('Medium');
            showToast('Ticket created successfully.', 'success');
        } catch (error) {
            console.error('Error creating ticket:', error);
            showToast('Failed to create ticket.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleStatusChange = async (ticketId, nextStatus) => {
        try {
            // Optimistically update the UI
            setTickets((prev) => 
                prev.map(t => t.id === ticketId ? { ...t, status: nextStatus } : t)
            );
            
            // Update in Firestore
            await updateTicketStatus(ticketId, nextStatus);
            showToast(`Ticket status updated to ${nextStatus}`, 'success');
        } catch (error) {
            console.error('Error updating status:', error);
            showToast('Failed to update ticket status');
            
            // Revert UI on failure (simple refetch)
            const fetchedTickets = await fetchTickets();
            setTickets(fetchedTickets);
        }
    };

    const handleDeleteTicket = async (ticketId) => {
        try {
            // Optimistically update the UI
            setTickets((prev) => prev.filter(t => t.id !== ticketId));
            
            // Delete from Firestore
            await deleteTicketRecord(ticketId);
            showToast('Ticket deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting ticket:', error);
            showToast('Failed to delete ticket');
            
            // Revert UI on failure
            const fetchedTickets = await fetchTickets();
            setTickets(fetchedTickets);
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
                <DashboardHeader onProfilePress={openProfileMenu} title="Ticket Center" subtitle="Admin Module" />
                
                <AppCard style={styles.formCard}>
                    <Text style={styles.cardTitle}>Create New Ticket</Text>
                    <Text style={styles.subtitle}>Report a new bug or system issue.</Text>

                    <AppTextField
                        label="Issue Title"
                        leftIconName="bug-outline"
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Briefly describe the problem"
                        placeholderTextColor="#667693"
                    />

                    <Text style={styles.fieldLabel}>Severity Level</Text>
                    <View style={styles.rolesWrap}>
                        {SEVERITY_OPTIONS.map((level) => {
                            const isSelected = severity === level;

                            return (
                                <Pressable
                                    key={level}
                                    onPress={() => setSeverity(level)}
                                    style={[styles.roleChip, isSelected && styles.roleChipSelected]}
                                >
                                    <Text style={[styles.roleChipText, isSelected && styles.roleChipTextSelected]}>
                                        {level}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    <AppButton
                        title={isCreating ? 'Creating Ticket...' : 'Create Ticket'}
                        onPress={handleCreateTicket}
                        disabled={isCreating}
                        iconName="add-circle-outline"
                        style={styles.createButton}
                    />
                </AppCard>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <Text style={styles.subtitle}>Track and monitor bug and system problem reports.</Text>
                    {isLoading && <ActivityIndicator size="small" color="#667693" />}
                </View>

                {tickets.length === 0 && !isLoading ? (
                    <Text style={styles.emptyText}>No tickets found.</Text>
                ) : (
                    <TicketQueue 
                        tickets={tickets} 
                        onStatusChange={handleStatusChange} 
                        onDelete={handleDeleteTicket} 
                    />
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
    formCard: {
        width: '100%',
        maxWidth: '100%',
        alignSelf: 'stretch',
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingVertical: 16,
        backgroundColor: 'rgba(18,26,53,0.95)',
        borderColor: 'rgba(115,137,172,0.22)',
    },
    cardTitle: {
        color: '#f3f6ff',
        fontSize: 16,
        fontWeight: '800',
    },
    fieldLabel: {
        color: '#a8bbd7',
        fontSize: 13,
        fontWeight: '700',
        marginTop: 12,
        marginBottom: 8,
    },
    rolesWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    roleChip: {
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(129,151,186,0.28)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: 'rgba(16,27,52,0.8)',
    },
    roleChipSelected: {
        backgroundColor: 'rgba(245,167,16,0.18)',
        borderColor: 'rgba(245,167,16,0.5)',
    },
    roleChipText: {
        color: '#8ea3c4',
        fontSize: 12,
        fontWeight: '700',
    },
    roleChipTextSelected: {
        color: '#ffd166',
    },
    createButton: {
        height: 52,
        marginTop: 18,
        marginBottom: 0,
    },
    emptyText: {
        color: '#c7d2e7',
        fontSize: 14,
        paddingVertical: 12,
        textAlign: 'center'
    },
});
