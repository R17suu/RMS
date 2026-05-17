import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import AppCard from '../AppCard';

export default function WeeklySalesChart({ data }) {
    return (
        <>
            <View style={styles.sectionHeader}>
                <Ionicons name="bar-chart" size={17} color="#2bd576" />
                <Text style={styles.sectionTitle}>Weekly Revenue</Text>
            </View>

            <AppCard style={styles.chartCard}>
                <View style={styles.chartRow}>
                    {data.map((bar) => (
                        <View key={bar.day} style={styles.barItem}>
                            <Text style={styles.barAmount} numberOfLines={1} adjustsFontSizeToFit>{bar.amount}</Text>
                            <View
                                style={[
                                    styles.bar,
                                    { height: bar.height },
                                    bar.accent ? styles.barAccent : styles.barDefault,
                                ]}
                            />
                            <Text style={styles.barDay}>{bar.day}</Text>
                        </View>
                    ))}
                </View>
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
    chartCard: {
        width: '100%',
        maxWidth: '100%',
        alignSelf: 'stretch',
        borderRadius: 18,
        paddingTop: 16,
        paddingBottom: 14,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(18,26,53,0.95)',
        borderColor: 'rgba(115,137,172,0.22)',
    },
    chartRow: {
        height: 182,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    barItem: {
        width: '13%',
        alignItems: 'center',
    },
    barAmount: {
        color: '#8ea3c4',
        fontSize: 10,
        fontWeight: '700',
        marginBottom: 6,
    },
    bar: {
        width: '100%',
        borderRadius: 7,
        minHeight: 24,
    },
    barDefault: {
        backgroundColor: '#4f7de8',
    },
    barAccent: {
        backgroundColor: '#2bd576',
    },
    barDay: {
        marginTop: 8,
        color: '#6e83a7',
        fontSize: 12,
        fontWeight: '700',
    },
});
