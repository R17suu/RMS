import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function ProfileMenu({ onSignOut }) {
    return (
        <View style={styles.profileMenu}>
            <View style={styles.profileMenuHead}>
                <View style={styles.profileIconWrap}>
                    <Ionicons name="person-circle" size={28} color="#f5a710" />
                </View>
                <View>
                    <Text style={styles.profileMenuName}>Juan Admin</Text>
                    <Text style={styles.profileMenuRole}>Admin Module</Text>
                </View>
            </View>

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
    signOutText: {
        color: '#ff4d5b',
        fontSize: 14,
        fontWeight: '700',
    },
});
