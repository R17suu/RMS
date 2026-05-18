import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function ClerkHeader({ onProfilePress, title = 'Dashboard', subtitle = 'Clerk Module', showBack = false }) {
	const router = useRouter();
	return (
		<View style={styles.headerRow}>
			<View style={styles.brandWrap}>
				{showBack ? (
					<Pressable 
						style={styles.backBtn} 
						onPress={() => router.back()}
						accessibilityRole="button"
						accessibilityLabel="Go back"
					>
						<Ionicons name="arrow-back" size={24} color="#f7f9ff" />
					</Pressable>
				) : (
					<View style={styles.brandBadge}>
						<Text style={styles.brandText}>EEU</Text>
					</View>
				)}

				<View>
					<Text style={styles.title}>{title}</Text>
					<Text style={styles.subtitle}>{subtitle}</Text>
				</View>
			</View>

			<View style={styles.topActions}>
				<Pressable style={styles.iconButton} accessibilityRole="button" accessibilityLabel="Notifications">
					<Ionicons name="notifications-outline" size={20} color="#9db0ce" />
					<View style={styles.badgeDot} />
				</Pressable>

				<Pressable
					style={styles.profileButton}
					onPress={onProfilePress}
					accessibilityRole="button"
					accessibilityLabel="Open profile"
				>
					<Text style={styles.profileText}>TC</Text>
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	headerRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingTop: 2,
		paddingBottom: 10,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(120,145,185,0.14)',
	},
	brandWrap: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
	},
	backBtn: {
		width: 38,
		height: 38,
		borderRadius: 10,
		backgroundColor: 'rgba(255,255,255,0.08)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	brandBadge: {
		width: 38,
		height: 38,
		borderRadius: 10,
		backgroundColor: 'rgba(59,130,246,0.18)',
		borderWidth: 1,
		borderColor: 'rgba(59,130,246,0.32)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	brandText: {
		color: '#93c5fd',
		fontWeight: '800',
		fontSize: 14,
	},
	title: {
		color: '#f7f9ff',
		fontSize: 20,
		fontWeight: '700',
	},
	subtitle: {
		marginTop: 1,
		color: '#7e94b6',
		fontSize: 13,
		fontWeight: '500',
	},
	topActions: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	iconButton: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: 'rgba(15,28,61,0.65)',
		borderWidth: 1,
		borderColor: 'rgba(129,151,186,0.2)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	badgeDot: {
		position: 'absolute',
		top: 8,
		right: 9,
		width: 6,
		height: 6,
		borderRadius: 3,
		backgroundColor: '#3b82f6',
	},
	profileButton: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: '#3b82f6',
		alignItems: 'center',
		justifyContent: 'center',
	},
	profileText: {
		color: '#f7f9ff',
		fontWeight: '700',
		fontSize: 12,
	},
});
