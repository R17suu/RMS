import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import AppCard from '../AppCard';

export default function LowStockAlerts({ lowStockProducts }) {
    if (!lowStockProducts || lowStockProducts.length === 0) {
        return null;
    }

    return (
        <>
            <View style={styles.sectionHeader}>
                <Ionicons name="warning" size={17} color="#ff4d5b" />
                <Text style={styles.sectionTitle}>Low Stock Alerts</Text>
            </View>

            <AppCard style={styles.alertCard}>
                {lowStockProducts.map((product, index) => (
                    <View key={product.id}>
                        <View style={styles.itemRow}>
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName}>{product.name}</Text>
                                <Text style={styles.itemStock}>
                                    Current Stock: <Text style={styles.stockHighlight}>{product.stock}</Text> units
                                </Text>
                            </View>
                        </View>
                        {index < lowStockProducts.length - 1 && <View style={styles.divider} />}
                    </View>
                ))}
            </AppCard>
        </>
    );
}

const styles = StyleSheet.create({
    sectionHeader: {
        marginTop: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        color: '#f3f6ff',
        fontSize: 16,
        fontWeight: '800',
    },
    alertCard: {
        width: '100%',
        maxWidth: '100%',
        alignSelf: 'stretch',
        borderRadius: 18,
        paddingTop: 12,
        paddingBottom: 12,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(255,77,91,0.05)',
        borderColor: 'rgba(255,77,91,0.2)',
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        color: '#f3f6ff',
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
    },
    itemStock: {
        color: '#8ea3c4',
        fontSize: 13,
        fontWeight: '500',
    },
    stockHighlight: {
        color: '#ff4d5b',
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(115,137,172,0.15)',
    },
});
