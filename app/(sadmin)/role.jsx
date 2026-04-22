import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import DashboardHeader from '../../components/sadmin/DashboardHeader';
import ProfileMenu from '../../components/sadmin/ProfileMenu';
import { auth } from '../../FirebaseConfig';
import ThemedView from '../../components/ThemedView';

export default function SuperAdminRoleManagementScreen() {
	const router = useRouter();
	const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

	const openProfileMenu = () => {
		setIsProfileMenuOpen(true);
	};

	const closeProfileMenu = () => {
		setIsProfileMenuOpen(false);
	};

	const handleSignOut = async () => {
		try {
			await signOut(auth);
			setIsProfileMenuOpen(false);
			router.replace('/');
		} catch (error) {
			console.error('Failed to sign out:', error);
		}
	};

	return (
		<ThemedView style={styles.container} safe>
			{isProfileMenuOpen ? <Pressable style={styles.overlay} onPress={closeProfileMenu} /> : null}

			{isProfileMenuOpen ? (
				<View style={styles.profileMenuWrap}>
					<ProfileMenu onSignOut={handleSignOut} />
				</View>
			) : null}

			<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
				<DashboardHeader
					onProfilePress={openProfileMenu}
					title="Role Management"
					subtitle="Admin Module"
				/>
				<Text style={styles.subtitle}>Define permissions and assign access levels.</Text>

				<View style={styles.panel}>
					<Text style={styles.panelText}>No roles configured yet.</Text>
				</View>
			</ScrollView>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#020b24',
		position: 'relative',
	},
	overlay: {
		...StyleSheet.absoluteFillObject,
		zIndex: 20,
	},
	profileMenuWrap: {
		position: 'absolute',
		top: 96,
		right: 16,
		zIndex: 30,
	},
	scrollContent: {
		paddingHorizontal: 16,
		paddingBottom: 24,
		gap: 12,
	},
	subtitle: {
		color: '#8da2c0',
		fontSize: 14,
		marginTop: 2,
	},
	panel: {
		borderRadius: 18,
		borderWidth: 1,
		borderColor: 'rgba(115,137,172,0.22)',
		backgroundColor: 'rgba(18,26,53,0.95)',
		padding: 16,
	},
	panelText: {
		color: '#c7d2e7',
		fontSize: 14,
	},
});
