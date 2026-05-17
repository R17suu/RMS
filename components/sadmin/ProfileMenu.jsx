import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { auth } from '../../FirebaseConfig';
import { fetchUserRecord } from '../../services/userService';
import { useRouter } from 'expo-router';

export default function ProfileMenu({ onSignOut }) {
    const router = useRouter();
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            if (auth.currentUser?.uid) {
                try {
                    const user = await fetchUserRecord(auth.currentUser.uid);
                    setUserData(user);
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }
            setIsLoading(false);
        };
        loadUser();
    }, []);

    return (
        <View style={styles.profileMenu}>
            <View style={styles.profileMenuHead}>
                <View style={styles.profileIconWrap}>
                    <Ionicons name="person-circle" size={28} color="#f5a710" />
                </View>
                <View>
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#f5a710" />
                    ) : (
                        <>
                            <Text style={styles.profileMenuName}>{userData?.name || 'Unknown User'}</Text>
                            <Text style={styles.profileMenuRole}>{userData?.role || 'No Role'}</Text>
                        </>
                    )}
                </View>
            </View>

            <View style={styles.menuDivider} />

            {userData?.role !== 'Super Admin' && (
                <Pressable 
                    style={styles.menuRow} 
                    onPress={() => {
                        const rolePath = userData?.role?.toLowerCase();
                        if (rolePath === 'admin') router.push('/(admin)/tickets');
                        else if (rolePath === 'clerk') router.push('/(clerk)/tickets');
                        else router.push('/(sadmin)/tickets');
                    }}
                >
                    <Ionicons name="help-buoy-outline" size={22} color="#8da2c0" />
                    <Text style={styles.menuText}>Support Tickets</Text>
                </Pressable>
            )}

            <View style={styles.menuDivider} />

            <Pressable style={styles.signOutRow} onPress={onSignOut} accessibilityRole="button" accessibilityLabel="Sign out">
                <Ionicons name="log-out-outline" size={22} color="#ff4d5b" />
                <Text style={styles.signOutText}>Sign Out</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    profileMenu: {
        width: 250,
        padding: 14,
        borderRadius: 18,
        backgroundColor: '#0f1c3d',
        borderWidth: 1,
        borderColor: 'rgba(129,151,186,0.2)',
    },
    profileMenuHead: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    profileIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: 'rgba(245,167,16,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileMenuName: {
        color: '#f2f6ff',
        fontSize: 16,
        fontWeight: '700',
    },
    profileMenuRole: {
        marginTop: 2,
        color: '#7f97bc',
        fontSize: 14,
        fontWeight: '500',
    },
    menuDivider: {
        marginTop: 14,
        marginBottom: 10,
        height: 1,
        backgroundColor: 'rgba(129,151,186,0.2)',
    },
    signOutRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 4,
    },
    menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 4,
    },
    menuText: {
        color: '#8da2c0',
        fontSize: 14,
        fontWeight: '600',
    },
    signOutText: {
        color: '#ff4d5b',
        fontSize: 14,
        fontWeight: '700',
    },
});
