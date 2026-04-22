import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import AppCard from '../AppCard';

export default function StatsGrid({ stats }) {
    return (
        <View style={styles.statsGrid}>
            {stats.map((item) => (
                <AppCard key={item.label} style={styles.statCard}>
                    <View style={[styles.statIconWrap, { backgroundColor: item.iconBg }]}>
                        <Ionicons name={item.icon} size={20} color={item.iconColor} />
                    </View>
                    <View style={styles.statTextWrap}>
                        <Text style={styles.statValue}>{item.value}</Text>
                        <Text style={styles.statLabel}>{item.label}</Text>
                    </View>
                </AppCard>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 12,
    },
    statCard: {
        width: '48.5%',
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
    },
});
