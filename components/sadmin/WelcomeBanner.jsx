import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import AppCard from '../AppCard';

export default function WelcomeBanner() {
    return (
        <AppCard style={styles.welcomeCard}>
            <View style={styles.welcomeTextWrap}>
                <Text style={styles.welcomeText}>
                    Welcome back, <Text style={styles.highlight}>Juan</Text>
                </Text>
                <Text style={styles.dateText}>Wednesday, April 22, 2026</Text>
            </View>
            <View style={styles.welcomeIconWrap}>
                <MaterialCommunityIcons name="shield-account" size={24} color="#07132f" />
            </View>
        </AppCard>
    );
}

const styles = StyleSheet.create({
    welcomeCard: {
        width: '100%',
        maxWidth: '100%',
        alignSelf: 'stretch',
        paddingHorizontal: 18,
        paddingVertical: 18,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(245,167,16,0.35)',
        backgroundColor: 'rgba(20,28,60,0.95)',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    welcomeTextWrap: {
        flexShrink: 1,
    },
    welcomeText: {
        color: '#f3f6ff',
        fontWeight: '800',
        fontSize: 18,
    },
    highlight: {
        color: '#f5a710',
    },
    dateText: {
        marginTop: 4,
        color: '#8da2c0',
        fontSize: 14,
    },
    welcomeIconWrap: {
        width: 60,
        height: 60,
        borderRadius: 16,
        backgroundColor: '#f5a710',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
