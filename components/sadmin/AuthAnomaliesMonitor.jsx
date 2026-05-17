import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import AppCard from '../AppCard';

export default function AuthAnomaliesMonitor({ anomalies = [] }) {
    return (
        <>
            <View style={styles.sectionHeader}>
                <Ionicons name="shield-warning-outline" size={17} color="#ef4444" />
                <Text style={styles.sectionTitle}>Auth Security Alerts</Text>
            </View>

            <AppCard style={styles.card}>
                {anomalies.length === 0 ? (
                    <Text style={styles.emptyText}>No recent authentication anomalies.</Text>
                ) : (
                    anomalies.slice(0, 5).map((anomaly, idx) => (
                        <View key={anomaly.id || idx} style={styles.itemRow}>
                            <View style={styles.iconWrap}>
                                <Ionicons name="warning" size={16} color="#ef4444" />
                            </View>
                            <View style={styles.textWrap}>
                                <Text style={styles.actorText}>{anomaly.actor || 'Unknown'}</Text>
                                <Text style={styles.messageText}>{anomaly.message}</Text>
                            </View>
                            <Text style={styles.timeText}>
                                {anomaly.createdAt?.toDate ? anomaly.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                            </Text>
                        </View>
                    ))
                )}
            </AppCard>
        </>
    );
}

const styles = StyleSheet.create({
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
        marginTop: 18,
    },
    sectionTitle: {
        color: '#f3f6ff',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    card: {
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
    emptyText: {
        color: '#667693',
        fontSize: 13,
        textAlign: 'center',
        paddingVertical: 10,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(129,151,186,0.1)',
        gap: 12,
    },
    iconWrap: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: 'rgba(239,68,68,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textWrap: {
        flex: 1,
    },
    actorText: {
        color: '#f8fafc',
        fontSize: 13,
        fontWeight: '700',
    },
    messageText: {
        color: '#94a3b8',
        fontSize: 12,
        marginTop: 2,
    },
    timeText: {
        color: '#64748b',
        fontSize: 11,
    },
});
