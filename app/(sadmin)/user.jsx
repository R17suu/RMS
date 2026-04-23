import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import AppButton from '../../components/AppButton';
import AppCard from '../../components/AppCard';
import AppTextField from '../../components/AppTextField';
import AppToast from '../../components/AppToast';
import DashboardHeader from '../../components/sadmin/DashboardHeader';
import ProfileMenu from '../../components/sadmin/ProfileMenu';
import { auth } from '../../FirebaseConfig';
import { fetchUsers, createUser, updateUserStatus, updateUserRole, deleteUserRecord, updateUserPassword } from '../../services/userService';
import { fetchRoles } from '../../services/roleService';
import ThemedView from '../../components/ThemedView';

const AVAILABLE_ROLES = ['System Auditor', 'Support Supervisor', 'Operations Manager', 'Security Admin'];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const generateRandomPassword = (length = 12) => {
	const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
	let passwordValue = '';
	for (let index = 0; index < length; index += 1) {
		passwordValue += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return passwordValue;
};

export default function SuperAdminUserManagementScreen() {
	const router = useRouter();
	const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
	const [fullName, setFullName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [selectedRole, setSelectedRole] = useState('System Auditor');
	const [searchTerm, setSearchTerm] = useState('');
	const [isCreatingUser, setIsCreatingUser] = useState(false);
	const [toast, setToast] = useState({ message: '', type: 'error' });
	const [editingUserId, setEditingUserId] = useState(null);
	const [draftRole, setDraftRole] = useState('');
	const [editingPasswordUserId, setEditingPasswordUserId] = useState(null);
	const [passwordDraft, setPasswordDraft] = useState('');
	const [passwordConfirmDraft, setPasswordConfirmDraft] = useState('');
	const [showEditPassword, setShowEditPassword] = useState(false);
	const [users, setUsers] = useState([]);
	const [availableRoles, setAvailableRoles] = useState(AVAILABLE_ROLES);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const fetchedUsers = await fetchUsers();
				setUsers(fetchedUsers);

				const fetchedRolesDocs = await fetchRoles();
				const fetchedRoles = fetchedRolesDocs.map(r => r.name);
				if (fetchedRoles.length > 0) {
					setAvailableRoles(fetchedRoles);
					if (fetchedRoles.includes(selectedRole) === false) {
						setSelectedRole(fetchedRoles[0]);
					}
				}
			} catch (error) {
				console.error('Error fetching data:', error);
				showToast('Failed to load data');
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, []);

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

	const showToast = (message, type = 'error') => {
		setToast({ message, type });
	};

	const handleCreateUser = async () => {
		const normalizedName = fullName.trim();
		const normalizedEmail = email.trim().toLowerCase();

		if (!normalizedName) {
			showToast('Full name is required.');
			return;
		}

		if (!normalizedEmail) {
			showToast('Email address is required.');
			return;
		}

		if (!EMAIL_PATTERN.test(normalizedEmail)) {
			showToast('Please enter a valid email address.');
			return;
		}

		if (!password) {
			showToast('Password is required.');
			return;
		}

		if (password.length < 8) {
			showToast('Password must be at least 8 characters.');
			return;
		}

		if (password !== confirmPassword) {
			showToast('Password and confirmation do not match.');
			return;
		}

		const duplicate = users.some((user) => user.email.toLowerCase() === normalizedEmail);

		if (duplicate) {
			showToast('A user with that email already exists.');
			return;
		}

		setIsCreatingUser(true);

		try {
			const newUserData = {
				fullName: normalizedName,
				email: normalizedEmail,
				role: selectedRole,
				status: 'Active',
				lastActive: 'just now',
				hasPassword: true
			};

			const newUser = await createUser(newUserData, password);

			setUsers((prev) => [newUser, ...prev]);
			setFullName('');
			setEmail('');
			setPassword('');
			setConfirmPassword('');
			setSelectedRole(availableRoles[0] || 'System Auditor');
			showToast('User created successfully.', 'success');
		} catch (error) {
			console.error('Error creating user:', error);
			if (error.code === 'auth/email-already-in-use') {
				showToast('That email address is already registered in Auth.');
			} else if (error.code === 'auth/weak-password') {
				showToast('Password is too weak.');
			} else {
				showToast('Failed to create user. Check the console.');
			}
		} finally {
			setIsCreatingUser(false);
		}
	};

	const toggleUserStatus = async (userId) => {
		const user = users.find(u => u.id === userId);
		if (!user || user.status === 'Archived') return;
		
		const newStatus = user.status === 'Active' ? 'Disabled' : 'Active';

		try {
			await updateUserStatus(userId, newStatus);
			setUsers((prev) =>
				prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
			);
		} catch (error) {
			console.error('Error toggling status:', error);
			showToast('Failed to update status');
		}
	};

	const archiveUser = async (userId) => {
		try {
			await updateUserStatus(userId, 'Archived');
			setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: 'Archived' } : u)));
			showToast('User archived.', 'success');
		} catch (error) {
			console.error('Error archiving user:', error);
			showToast('Failed to archive user');
		}
	};

	const unarchiveUser = async (userId) => {
		try {
			await updateUserStatus(userId, 'Active');
			setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: 'Active' } : u)));
			showToast('User unarchived.', 'success');
		} catch (error) {
			console.error('Error unarchiving user:', error);
			showToast('Failed to unarchive user');
		}
	};

	const deleteUser = async (userId) => {
		try {
			await deleteUserRecord(userId);
			setUsers((prev) => prev.filter((user) => user.id !== userId));
			if (editingUserId === userId) {
				cancelRoleEdit();
			}
			showToast('User deleted.', 'success');
		} catch (error) {
			console.error('Error deleting user:', error);
			showToast('Failed to delete user');
		}
	};

	const startRoleEdit = (user) => {
		setEditingUserId(user.id);
		setDraftRole(user.role);
	};

	const cancelRoleEdit = () => {
		setEditingUserId(null);
		setDraftRole('');
	};

	const saveUserRole = async (userId) => {
		try {
			await updateUserRole(userId, draftRole);
			setUsers((prev) =>
				prev.map((user) => (user.id === userId ? { ...user, role: draftRole } : user))
			);
			showToast('User role updated.', 'success');
			cancelRoleEdit();
		} catch (error) {
			console.error('Error updating role:', error);
			showToast('Failed to update role');
		}
	};

	const handleGeneratePasswordForCreate = () => {
		const newPassword = generateRandomPassword();
		setPassword(newPassword);
		setConfirmPassword(newPassword);
		showToast('Password generated and filled.', 'success');
	};

	const startPasswordEdit = (user) => {
		setEditingPasswordUserId(user.id);
		setPasswordDraft('');
		setPasswordConfirmDraft('');
		setShowEditPassword(false);
	};

	const cancelPasswordEdit = () => {
		setEditingPasswordUserId(null);
		setPasswordDraft('');
		setPasswordConfirmDraft('');
		setShowEditPassword(false);
	};

	const generatePasswordForEdit = () => {
		const newPassword = generateRandomPassword();
		setPasswordDraft(newPassword);
		setPasswordConfirmDraft(newPassword);
		showToast('Password generated.', 'success');
	};

	const saveUserPassword = async (userId) => {
		const newPassword = passwordDraft.trim();

		if (!newPassword) {
			showToast('Password cannot be empty.');
			return;
		}

		if (newPassword.length < 8) {
			showToast('Password must be at least 8 characters.');
			return;
		}

		if (newPassword !== passwordConfirmDraft) {
			showToast('Passwords do not match.');
			return;
		}

		try {
			await updateUserPassword(userId);
			setUsers((prev) =>
				prev.map((user) => (user.id === userId ? { ...user, hasPassword: true } : user))
			);
			showToast('Password changed successfully.', 'success');
			cancelPasswordEdit();
		} catch (error) {
			console.error('Error changing password:', error);
			showToast('Failed to change password');
		}
	};

	const filteredUsers = users.filter((user) => {
		const query = searchTerm.trim().toLowerCase();
		if (!query) {
			return true;
		}

		return (
			user.fullName.toLowerCase().includes(query) ||
			user.email.toLowerCase().includes(query) ||
			user.role.toLowerCase().includes(query)
		);
	});

	return (
		<ThemedView style={styles.container} safe>
			<AppToast
				message={toast.message}
				type={toast.type}
				onHide={() => setToast((prev) => ({ ...prev, message: '' }))}
			/>

			{isProfileMenuOpen ? <Pressable style={styles.overlay} onPress={closeProfileMenu} /> : null}

			{isProfileMenuOpen ? (
				<View style={styles.profileMenuWrap}>
					<ProfileMenu onSignOut={handleSignOut} />
				</View>
			) : null}

			<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
				<DashboardHeader
					onProfilePress={openProfileMenu}
					title="User Management"
					subtitle="Admin Module"
				/>

				<AppCard style={styles.formCard}>
					<Text style={styles.cardTitle}>Create User</Text>
					<Text style={styles.subtitle}>Register a user account and assign an initial role.</Text>

					<View style={styles.formFields}>
						<AppTextField
							label="Full Name"
							leftIconName="person-outline"
							value={fullName}
							onChangeText={setFullName}
							placeholder="e.g. Jane Santos"
							placeholderTextColor="#667693"
						/>
						<AppTextField
							label="Email Address"
							leftIconName="mail-outline"
							value={email}
							onChangeText={setEmail}
							placeholder="jane@eeu.local"
							placeholderTextColor="#667693"
							autoCapitalize="none"
							autoCorrect={false}
							keyboardType="email-address"
						/>
						<AppTextField
							label="Password"
							leftIconName="lock-closed-outline"
							value={password}
							onChangeText={setPassword}
							placeholder="Create a secure password"
							placeholderTextColor="#667693"
							secureTextEntry={!showPassword}
							autoCapitalize="none"
							autoCorrect={false}
							rightAccessory={(
								<Pressable onPress={() => setShowPassword((prev) => !prev)}>
									<Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#8ea3c4" />
								</Pressable>
							)}
						/>
						<AppTextField
							label="Confirm Password"
							leftIconName="lock-closed-outline"
							value={confirmPassword}
							onChangeText={setConfirmPassword}
							placeholder="Re-enter password"
							placeholderTextColor="#667693"
							secureTextEntry={!showPassword}
							autoCapitalize="none"
							autoCorrect={false}
						/>

						<Pressable
							onPress={handleGeneratePasswordForCreate}
							style={styles.generateButton}
						>
							<Ionicons name="shuffle-outline" size={14} color="#ffd166" />
							<Text style={styles.generateButtonText}>Generate Random Password</Text>
						</Pressable>
					</View>

					<Text style={styles.fieldLabel}>Assign Role</Text>
					<View style={styles.rolesWrap}>
						{availableRoles.map((role) => {
							const isSelected = selectedRole === role;

							return (
								<Pressable
									key={role}
									onPress={() => setSelectedRole(role)}
									style={[styles.roleChip, isSelected && styles.roleChipSelected]}
								>
									<Text style={[styles.roleChipText, isSelected && styles.roleChipTextSelected]}>
										{role}
									</Text>
								</Pressable>
							);
						})}
					</View>

					<AppButton
						title={isCreatingUser ? 'Creating User...' : 'Create User'}
						onPress={handleCreateUser}
						disabled={isCreatingUser}
						iconName="person-add-outline"
						style={styles.createButton}
					/>
				</AppCard>

				<AppCard style={styles.usersCard}>
					<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
						<Text style={styles.cardTitle}>User Directory ({filteredUsers.length})</Text>
						{isLoading && <ActivityIndicator size="small" color="#667693" />}
					</View>

					<AppTextField
						label="Search"
						leftIconName="search-outline"
						value={searchTerm}
						onChangeText={setSearchTerm}
						placeholder="Find by name, email, or role"
						placeholderTextColor="#667693"
						containerStyle={styles.searchField}
					/>

					{filteredUsers.length === 0 ? (
						<Text style={styles.emptyText}>No users matched your search.</Text>
					) : null}

					{filteredUsers.map((user) => {
						const isEditing = editingUserId === user.id;

						return (
							<View key={user.id} style={styles.userItem}>
								<View style={styles.userHeadRow}>
									<View>
										<Text style={styles.userName}>{user.fullName}</Text>
										<Text style={styles.userEmail}>{user.email}</Text>
									</View>

									<View
										style={[
											styles.statusPill,
											user.status === 'Active'
												? styles.statusActive
												: user.status === 'Archived'
													? styles.statusArchived
													: styles.statusDisabled,
										]}
									>
										<Text
											style={[
												styles.statusText,
												user.status === 'Active'
													? styles.statusTextActive
													: user.status === 'Archived'
														? styles.statusTextArchived
														: styles.statusTextDisabled,
											]}
										>
											{user.status}
										</Text>
									</View>
								</View>

								<View style={styles.metaRow}>
									<Text style={styles.metaLabel}>Role: </Text>
									<Text style={styles.metaValue}>{user.role}</Text>
									<Text style={styles.metaLabel}> • Password: </Text>
									<Text style={styles.metaValue}>{user.hasPassword ? 'Set' : 'Not Set'}</Text>
									<Text style={styles.metaLabel}> • Last active: </Text>
									<Text style={styles.metaValue}>
										{typeof user.lastActive === 'object' && user.lastActive?.seconds 
											? new Date(user.lastActive.seconds * 1000).toLocaleDateString() 
											: String(user.lastActive || 'Unknown')}
									</Text>
								</View>

								<View style={styles.actionRow}>
									{user.status !== 'Archived' ? (
										<Pressable
											onPress={() => toggleUserStatus(user.id)}
											style={styles.secondaryAction}
										>
											<Text style={styles.secondaryActionText}>
												{user.status === 'Active' ? 'Disable' : 'Enable'}
											</Text>
										</Pressable>
									) : (
										<Pressable
											onPress={() => unarchiveUser(user.id)}
											style={styles.secondaryAction}
										>
											<Text style={styles.secondaryActionText}>Unarchive</Text>
										</Pressable>
									)}

									<Pressable
										onPress={() => startRoleEdit(user)}
										style={styles.secondaryAction}
									>
										<Text style={styles.secondaryActionText}>Change Role</Text>
									</Pressable>

									<Pressable
										onPress={() => startPasswordEdit(user)}
										style={styles.secondaryAction}
									>
										<Text style={styles.secondaryActionText}>Change Password</Text>
									</Pressable>

									{user.status !== 'Archived' ? (
										<Pressable
											onPress={() => archiveUser(user.id)}
											style={[styles.secondaryAction, styles.archiveAction]}
										>
											<Text style={[styles.secondaryActionText, styles.archiveActionText]}>Archive</Text>
										</Pressable>
									) : null}

									<Pressable
										onPress={() => deleteUser(user.id)}
										style={[styles.secondaryAction, styles.deleteAction]}
									>
										<Text style={[styles.secondaryActionText, styles.deleteActionText]}>Delete</Text>
									</Pressable>
								</View>

								{isEditing ? (
									<View style={styles.editPanel}>
										<Text style={styles.editPanelTitle}>Assign New Role</Text>
										<View style={styles.rolesWrap}>
											{availableRoles.map((role) => {
												const isSelected = draftRole === role;

												return (
													<Pressable
														key={role}
														onPress={() => setDraftRole(role)}
														style={[styles.roleChip, isSelected && styles.roleChipSelected]}
													>
														<Text style={[styles.roleChipText, isSelected && styles.roleChipTextSelected]}>
															{role}
														</Text>
													</Pressable>
												);
											})}
										</View>

										<View style={styles.editActionsRow}>
											<Pressable style={styles.cancelButton} onPress={cancelRoleEdit}>
												<Text style={styles.cancelButtonText}>Cancel</Text>
											</Pressable>
											<Pressable style={styles.saveButton} onPress={() => saveUserRole(user.id)}>
												<Text style={styles.saveButtonText}>Save</Text>
											</Pressable>
										</View>
									</View>
								) : null}

								{editingPasswordUserId === user.id ? (
									<View style={styles.editPanel}>
										<Text style={styles.editPanelTitle}>Change Password</Text>
										
										<AppTextField
											label="New Password"
											leftIconName="lock-closed-outline"
											value={passwordDraft}
											onChangeText={setPasswordDraft}
											placeholder="Enter new password"
											placeholderTextColor="#667693"
											secureTextEntry={!showEditPassword}
											autoCapitalize="none"
											autoCorrect={false}
											rightAccessory={(
												<Pressable onPress={() => setShowEditPassword((prev) => !prev)}>
													<Ionicons name={showEditPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#8ea3c4" />
												</Pressable>
											)}
										/>

										<AppTextField
											label="Confirm Password"
											leftIconName="lock-closed-outline"
											value={passwordConfirmDraft}
											onChangeText={setPasswordConfirmDraft}
											placeholder="Confirm password"
											placeholderTextColor="#667693"
											secureTextEntry={!showEditPassword}
											autoCapitalize="none"
											autoCorrect={false}
										/>

										<Pressable
											onPress={generatePasswordForEdit}
											style={styles.generateButtonSmall}
										>
											<Ionicons name="shuffle-outline" size={12} color="#ffd166" />
											<Text style={styles.generateButtonSmallText}>Generate Random Password</Text>
										</Pressable>

										<View style={styles.editActionsRow}>
											<Pressable style={styles.cancelButton} onPress={cancelPasswordEdit}>
												<Text style={styles.cancelButtonText}>Cancel</Text>
											</Pressable>
											<Pressable style={styles.saveButton} onPress={() => saveUserPassword(user.id)}>
												<Text style={styles.saveButtonText}>Save Password</Text>
											</Pressable>
										</View>
									</View>
								) : null}
							</View>
						);
					})}
				</AppCard>
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
	formCard: {
		width: '100%',
		maxWidth: '100%',
		alignSelf: 'stretch',
		borderRadius: 18,
		paddingHorizontal: 14,
		paddingVertical: 16,
		backgroundColor: 'rgba(18,26,53,0.95)',
		borderColor: 'rgba(115,137,172,0.22)',
	},
	usersCard: {
		width: '100%',
		maxWidth: '100%',
		alignSelf: 'stretch',
		borderRadius: 18,
		borderColor: 'rgba(115,137,172,0.22)',
		backgroundColor: 'rgba(18,26,53,0.95)',
		paddingHorizontal: 14,
		paddingVertical: 16,
	},
	cardTitle: {
		color: '#f3f6ff',
		fontSize: 16,
		fontWeight: '800',
	},
	subtitle: {
		color: '#8da2c0',
		fontSize: 14,
		marginTop: 6,
		marginBottom: 12,
	},
	formFields: {
		gap: 10,
	},
	fieldLabel: {
		color: '#a8bbd7',
		fontSize: 13,
		fontWeight: '700',
		marginTop: 4,
		marginBottom: 8,
	},
	rolesWrap: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	roleChip: {
		borderRadius: 999,
		borderWidth: 1,
		borderColor: 'rgba(129,151,186,0.28)',
		paddingHorizontal: 10,
		paddingVertical: 6,
		backgroundColor: 'rgba(16,27,52,0.8)',
	},
	roleChipSelected: {
		backgroundColor: 'rgba(245,167,16,0.18)',
		borderColor: 'rgba(245,167,16,0.5)',
	},
	roleChipText: {
		color: '#8ea3c4',
		fontSize: 12,
		fontWeight: '700',
	},
	roleChipTextSelected: {
		color: '#ffd166',
	},
	createButton: {
		height: 52,
		marginTop: 12,
		marginBottom: 0,
	},
	searchField: {
		marginTop: 10,
		marginBottom: 12,
	},
	emptyText: {
		color: '#c7d2e7',
		fontSize: 14,
		paddingVertical: 12,
	},
	userItem: {
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(129,151,186,0.18)',
	},
	userHeadRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		gap: 10,
	},
	userName: {
		color: '#f2f6ff',
		fontSize: 14,
		fontWeight: '800',
	},
	userEmail: {
		color: '#8ea3c4',
		fontSize: 12,
		marginTop: 2,
	},
	statusPill: {
		borderRadius: 999,
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderWidth: 1,
	},
	statusActive: {
		backgroundColor: 'rgba(34,197,94,0.2)',
		borderColor: 'rgba(34,197,94,0.45)',
	},
	statusDisabled: {
		backgroundColor: 'rgba(239,68,68,0.2)',
		borderColor: 'rgba(239,68,68,0.45)',
	},
	statusArchived: {
		backgroundColor: 'rgba(245,158,11,0.2)',
		borderColor: 'rgba(245,158,11,0.45)',
	},
	statusText: {
		fontSize: 11,
		fontWeight: '700',
	},
	statusTextActive: {
		color: '#86efac',
	},
	statusTextDisabled: {
		color: '#fda4af',
	},
	statusTextArchived: {
		color: '#fcd34d',
	},
	metaRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginTop: 6,
	},
	metaLabel: {
		color: '#7f95b7',
		fontSize: 12,
	},
	metaValue: {
		color: '#b9cae3',
		fontSize: 12,
		fontWeight: '700',
	},
	actionRow: {
		marginTop: 8,
		flexDirection: 'row',
		gap: 8,
	},
	secondaryAction: {
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 999,
		backgroundColor: 'rgba(63,140,255,0.2)',
		borderWidth: 1,
		borderColor: 'rgba(63,140,255,0.42)',
	},
	secondaryActionText: {
		color: '#8cc0ff',
		fontSize: 12,
		fontWeight: '700',
	},
	archiveAction: {
		backgroundColor: 'rgba(245,158,11,0.2)',
		borderColor: 'rgba(245,158,11,0.42)',
	},
	archiveActionText: {
		color: '#fcd34d',
	},
	deleteAction: {
		backgroundColor: 'rgba(239,68,68,0.2)',
		borderColor: 'rgba(239,68,68,0.42)',
	},
	deleteActionText: {
		color: '#fda4af',
	},
	editPanel: {
		marginTop: 10,
		borderRadius: 12,
		padding: 12,
		backgroundColor: 'rgba(10,20,42,0.92)',
		borderWidth: 1,
		borderColor: 'rgba(129,151,186,0.22)',
	},
	editPanelTitle: {
		color: '#d3e1f7',
		fontSize: 12,
		fontWeight: '700',
		marginBottom: 8,
	},
	editActionsRow: {
		marginTop: 10,
		flexDirection: 'row',
		justifyContent: 'flex-end',
		gap: 8,
	},
	cancelButton: {
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 8,
		backgroundColor: 'rgba(129,151,186,0.16)',
	},
	cancelButtonText: {
		color: '#b7c7df',
		fontSize: 12,
		fontWeight: '700',
	},
	saveButton: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 8,
		backgroundColor: 'rgba(34,197,94,0.22)',
	},
	saveButtonText: {
		color: '#86efac',
		fontSize: 12,
		fontWeight: '800',
	},
	generateButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 6,
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 8,
		backgroundColor: 'rgba(245,167,16,0.15)',
		borderWidth: 1,
		borderColor: 'rgba(245,167,16,0.3)',
		marginTop: 8,
	},
	generateButtonText: {
		color: '#ffd166',
		fontSize: 12,
		fontWeight: '700',
	},
	generateButtonSmall: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 6,
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 6,
		backgroundColor: 'rgba(245,167,16,0.12)',
		borderWidth: 1,
		borderColor: 'rgba(245,167,16,0.25)',
		marginTop: 8,
	},
	generateButtonSmallText: {
		color: '#ffd166',
		fontSize: 11,
		fontWeight: '700',
	},
});
