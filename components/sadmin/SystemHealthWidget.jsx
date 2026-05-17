import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import AppCard from '../AppCard';

export default function SystemHealthWidget({ healthStats }) {
    const { totalProducts = 0, totalSales = 0, totalTickets = 0, totalRestocks = 0 } = healthStats || {};

    const metrics = [
        { label: 'Products', value: totalProducts, icon: 'cube-outline', color: '#60a5fa', bg: 'rgba(96,165,250,0.15)' },
        { label: 'Sales', value: totalSales, icon: 'cart-outline', color: '#34d399', bg: 'rgba(52,211,153,0.15)' },
        { label: 'Tickets', value: totalTickets, icon: 'bug-outline', color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
        { label: 'Restocks', value: totalRestocks, icon: 'layers-outline', color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' },
    ];

    return (
        <>
            <View style={styles.sectionHeader}>
                <Ionicons name="server-outline" size={17} color="#a78bfa" />
                <Text style={styles.sectionTitle}>Database Health Metrics</Text>
            </View>

            <View style={styles.statsGrid}>
                {metrics.map((m, i) => (
                    <AppCard key={i} style={styles.statCard}>
                        <View style={[styles.statIconWrap, { backgroundColor: m.bg }]}>
                            <Ionicons name={m.icon} size={20} color={m.color} />
                        </View>
                        <View style={styles.statTextWrap}>
                            <Text style={styles.statValue}>{m.value}</Text>
                            <Text style={styles.statLabel}>{m.label}</Text>
                        </View>
                    </AppCard>
                ))}
            </View>
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
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 12,
    },
    statCard: {
        width: '48.5%',
        maxWidth: '48.5%',
        borderRadius: 18,
        paddingVertical: 14,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(18,26,53,0.95)',
        borderColor: 'rgba(115,137,172,0.22)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    statIconWrap: {
        width: 42,
        height: 42,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statTextWrap: {
        flexShrink: 1,
    },
    statValue: {
        color: '#f1f5ff',
        fontSize: 20,
        fontWeight: '900',
        lineHeight: 40,
    },
    statLabel: {
        color: '#6e83a7',
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
});
