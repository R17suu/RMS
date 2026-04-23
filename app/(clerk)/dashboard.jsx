import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '../../FirebaseConfig';
import AppButton from '../../components/AppButton';

export default function ClerkDashboardScreen() {
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            router.replace('/');
        } catch (error) {
            console.error('Failed to sign out:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Clerk Module</Text>
            <Text style={styles.subtitle}>Front-Line Service - Coming Soon</Text>
            
            <View style={styles.buttonContainer}>
                <AppButton title="Sign Out" onPress={handleSignOut} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#020b24',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        color: '#f7f9ff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtitle: {
        color: '#8da2c0',
        fontSize: 16,
        marginTop: 8,
    },
    buttonContainer: {
        marginTop: 40,
        width: 200,
    }
});
