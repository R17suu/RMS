import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import AppCard from '../AppCard';

const formatTimestamp = (ts) => {
    if (!ts) return 'Unknown';
    if (typeof ts === 'object' && ts.seconds) {
        return new Date(ts.seconds * 1000).toLocaleDateString();
    }
    return String(ts);
};

const severityStyles = {
    Critical: { bg: 'rgba(239,68,68,0.2)', text: '#ff6b76' },
    High: { bg: 'rgba(249,115,22,0.2)', text: '#ffa15a' },
    Medium: { bg: 'rgba(245,158,11,0.2)', text: '#ffd166' },
    Low: { bg: 'rgba(14,165,233,0.2)', text: '#77d6ff' },
};

const statusStyles = {
    Open: { bg: 'rgba(168,85,247,0.2)', text: '#cf9eff' },
    Investigating: { bg: 'rgba(59,130,246,0.2)', text: '#87b7ff' },
    Resolved: { bg: 'rgba(34,197,94,0.2)', text: '#7ae7a3' },
};

export default function TicketQueue({ tickets, onStatusChange }) {
    const handleStatusPress = (ticketId, currentStatus) => {
        if (!onStatusChange) return;
        
        // Cycle the status
        let nextStatus = 'Open';
        if (currentStatus === 'Open') nextStatus = 'Investigating';
        else if (currentStatus === 'Investigating') nextStatus = 'Resolved';
        
        onStatusChange(ticketId, nextStatus);
    };

    return (
        <>
            <View style={styles.sectionHeader}>
                <Ionicons name="bug-outline" size={17} color="#f5b41f" />
                <Text style={styles.sectionTitle}>Bug and Problem Tickets</Text>
            </View>

            <AppCard style={styles.queueCard}>
                {tickets.map((ticket) => {
                    const severity = severityStyles[ticket.severity] ?? severityStyles.Medium;
                    const status = statusStyles[ticket.status] ?? statusStyles.Open;

                    return (
                        <Pressable key={ticket.id} style={styles.ticketRow}>
                            <View style={styles.ticketHeader}>
                                <Text style={styles.ticketId}>{ticket.id}</Text>
                                <View style={[styles.badge, { backgroundColor: severity.bg }]}> 
                                    <Text style={[styles.badgeText, { color: severity.text }]}>{ticket.severity}</Text>
                                </View>
                                <Pressable 
                                    onPress={() => handleStatusPress(ticket.id, ticket.status)}
                                    style={[styles.badge, { backgroundColor: status.bg }]}
                                > 
                                    <Text style={[styles.badgeText, { color: status.text }]}>{ticket.status}</Text>
                                </Pressable>
                            </View>

                            <Text style={styles.ticketTitle}>{ticket.title}</Text>
                            <Text style={styles.ticketMeta}>Reported by {ticket.reportedBy} • {formatTimestamp(ticket.time || ticket.createdAt)}</Text>
                        </Pressable>
                    );
                })}
            </AppCard>
        </>
    );
}

const styles = StyleSheet.create({
    sectionHeader: {
        marginTop: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        color: '#f3f6ff',
        fontSize: 16,
        fontWeight: '800',
    },
    queueCard: {
        width: '100%',
        maxWidth: '100%',
        alignSelf: 'stretch',
        borderRadius: 18,
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(18,26,53,0.95)',
        borderColor: 'rgba(115,137,172,0.22)',
        gap: 0,
    },
    ticketRow: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(129,151,186,0.18)',
    },
    ticketHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    ticketId: {
        color: '#9db0ce',
        fontSize: 12,
        fontWeight: '700',
    },
    badge: {
        borderRadius: 999,
        paddingVertical: 2,
        paddingHorizontal: 8,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    ticketTitle: {
        color: '#f2f6ff',
        fontSize: 14,
        fontWeight: '700',
    },
    ticketMeta: {
        marginTop: 3,
        color: '#6e83a7',
        fontSize: 12,
        fontWeight: '600',
    },
});
