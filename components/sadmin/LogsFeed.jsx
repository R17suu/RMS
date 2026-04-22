import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import AppCard from '../AppCard';

const levelStyles = {
    INFO: { bg: 'rgba(14,165,233,0.2)', text: '#77d6ff', icon: 'information-circle-outline' },
    WARN: { bg: 'rgba(245,158,11,0.2)', text: '#ffd166', icon: 'warning-outline' },
    ERROR: { bg: 'rgba(239,68,68,0.2)', text: '#ff6b76', icon: 'alert-circle-outline' },
};

export default function LogsFeed({ logs }) {
    return (
        <>
            <View style={styles.sectionHeader}>
                <Ionicons name="document-text-outline" size={17} color="#f5b41f" />
                <Text style={styles.sectionTitle}>System Logs</Text>
            </View>

            <View style={styles.filtersRow}>
                <Pressable style={[styles.filterChip, styles.filterChipActive]}>
                    <Text style={[styles.filterText, styles.filterTextActive]}>All</Text>
                </Pressable>
                <Pressable style={styles.filterChip}>
                    <Text style={styles.filterText}>Info</Text>
                </Pressable>
                <Pressable style={styles.filterChip}>
                    <Text style={styles.filterText}>Warn</Text>
                </Pressable>
                <Pressable style={styles.filterChip}>
                    <Text style={styles.filterText}>Error</Text>
                </Pressable>
            </View>

            <AppCard style={styles.logsCard}>
                {logs.map((log) => {
                    const level = levelStyles[log.level] ?? levelStyles.INFO;

                    return (
                        <View key={log.id} style={styles.logRow}>
                            <View style={styles.logTopRow}>
                                <View style={[styles.levelBadge, { backgroundColor: level.bg }]}>
                                    <Ionicons name={level.icon} size={12} color={level.text} />
                                    <Text style={[styles.levelText, { color: level.text }]}>{log.level}</Text>
                                </View>
                                <Text style={styles.logTime}>{log.time}</Text>
                            </View>

                            <Text style={styles.logMessage}>{log.message}</Text>
                            <Text style={styles.logMeta}>{log.service} • {log.actor}</Text>
                        </View>
                    );
                })}
            </AppCard>
        </>
    );
}

const styles = StyleSheet.create({
    sectionHeader: {
        marginTop: 2,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        color: '#f3f6ff',
        fontSize: 16,
        fontWeight: '800',
    },
    filtersRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 2,
    },
    filterChip: {
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(129,151,186,0.25)',
        backgroundColor: 'rgba(13,28,57,0.8)',
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    filterChipActive: {
        backgroundColor: 'rgba(245,167,16,0.2)',
        borderColor: 'rgba(245,167,16,0.4)',
    },
    filterText: {
        color: '#8ea3c4',
        fontSize: 12,
        fontWeight: '700',
    },
    filterTextActive: {
        color: '#ffd166',
    },
    logsCard: {
        width: '100%',
        maxWidth: '100%',
        alignSelf: 'stretch',
        borderRadius: 18,
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(18,26,53,0.95)',
        borderColor: 'rgba(115,137,172,0.22)',
    },
    logRow: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(129,151,186,0.18)',
    },
    logTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    levelBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    levelText: {
        fontSize: 11,
        fontWeight: '800',
    },
    logTime: {
        color: '#8096bb',
        fontSize: 12,
        fontWeight: '600',
    },
    logMessage: {
        color: '#f2f6ff',
        fontSize: 14,
        fontWeight: '700',
    },
    logMeta: {
        marginTop: 3,
        color: '#6e83a7',
        fontSize: 12,
        fontWeight: '600',
    },
});
