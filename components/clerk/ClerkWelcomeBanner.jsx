import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import AppCard from '../AppCard';

export default function ClerkWelcomeBanner() {
	const today = new Date();
	const dateString = today.toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});

	return (
		<AppCard style={styles.welcomeCard}>
			<View style={styles.welcomeTextWrap}>
				<Text style={styles.welcomeText}>
					Welcome back, <Text style={styles.highlight}>Clerk</Text>
				</Text>
				<Text style={styles.dateText}>{dateString}</Text>
			</View>
			<View style={styles.welcomeIconWrap}>
				<Ionicons name="document-text" size={24} color="#f7f9ff" />
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
		borderColor: 'rgba(59,130,246,0.35)',
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
		color: '#60a5fa',
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
		backgroundColor: '#3b82f6',
		alignItems: 'center',
		justifyContent: 'center',
	},
});
