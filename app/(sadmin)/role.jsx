import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppButton from '../../components/AppButton';
import AppCard from '../../components/AppCard';
import AppTextField from '../../components/AppTextField';
import AppToast from '../../components/AppToast';
import DashboardHeader from '../../components/sadmin/DashboardHeader';
import ProfileMenu from '../../components/sadmin/ProfileMenu';
import { auth } from '../../FirebaseConfig';
import ThemedView from '../../components/ThemedView';

const PERMISSION_GROUPS = [
	{
		title: 'User Access',
		permissions: [
			{ key: 'view_users', label: 'View Users' },
			{ key: 'create_users', label: 'Create Users' },
			{ key: 'edit_users', label: 'Edit Users' },
			{ key: 'delete_users', label: 'Delete Users' },
		],
	},
	{
		title: 'Role Access',
		permissions: [
			{ key: 'view_roles', label: 'View Roles' },
			{ key: 'create_roles', label: 'Create Roles' },
			{ key: 'edit_roles', label: 'Edit Roles' },
			{ key: 'assign_permissions', label: 'Assign Permissions' },
		],
	},
	{
		title: 'System Access',
		permissions: [
			{ key: 'view_logs', label: 'View Logs' },
			{ key: 'manage_tickets', label: 'Manage Tickets' },
		],
	},
];

const ALL_PERMISSION_KEYS = PERMISSION_GROUPS.flatMap((group) =>
	group.permissions.map((permission) => permission.key)
);

const getPermissionLabel = (permissionKey) => {
	const match = PERMISSION_GROUPS.flatMap((group) => group.permissions).find(
		(permission) => permission.key === permissionKey
	);
	return match ? match.label : permissionKey;
};

const PermissionSelector = ({ selectedPermissions, onTogglePermission, onSelectAll, onClear }) => {
	return (
		<View style={styles.selectorCard}>
			<View style={styles.selectorActionsRow}>
				<Pressable style={styles.secondaryAction} onPress={onSelectAll}>
					<Text style={styles.secondaryActionText}>Select All</Text>
				</Pressable>
				<Pressable style={styles.secondaryAction} onPress={onClear}>
					<Text style={styles.secondaryActionText}>Clear</Text>
				</Pressable>
			</View>

			{PERMISSION_GROUPS.map((group) => (
				<View key={group.title} style={styles.permissionGroup}>
					<Text style={styles.groupTitle}>{group.title}</Text>
					<View style={styles.permissionsWrap}>
						{group.permissions.map((permission) => {
							const isSelected = selectedPermissions.includes(permission.key);

							return (
								<Pressable
									key={permission.key}
									onPress={() => onTogglePermission(permission.key)}
									style={[
										styles.permissionChip,
										isSelected && styles.permissionChipSelected,
									]}
								>
									<Text
										style={[
											styles.permissionChipText,
											isSelected && styles.permissionChipTextSelected,
										]}
									>
										{permission.label}
									</Text>
								</Pressable>
							);
						})}
					</View>
				</View>
			))}
		</View>
	);
};

export default function SuperAdminRoleManagementScreen() {
	const router = useRouter();
	const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
	const [roleName, setRoleName] = useState('');
	const [roleDescription, setRoleDescription] = useState('');
	const [selectedPermissions, setSelectedPermissions] = useState([]);
	const [isCreatingRole, setIsCreatingRole] = useState(false);
	const [toast, setToast] = useState({ message: '', type: 'error' });
	const [editingRoleId, setEditingRoleId] = useState(null);
	const [permissionDraft, setPermissionDraft] = useState([]);
	const [roles, setRoles] = useState([
		{
			id: 'ROLE-001',
			name: 'System Auditor',
			description: 'Read-only access to logs, tickets, and audit records.',
			permissions: ['view_logs', 'view_tickets', 'view_audit_reports'],
		},
	]);

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

	const toggleCreatePermission = (permissionKey) => {
		setSelectedPermissions((prev) =>
			prev.includes(permissionKey)
				? prev.filter((item) => item !== permissionKey)
				: [...prev, permissionKey]
		);
	};

	const selectAllCreatePermissions = () => {
		setSelectedPermissions(ALL_PERMISSION_KEYS);
	};

	const clearCreatePermissions = () => {
		setSelectedPermissions([]);
	};

	const startPermissionEdit = (role) => {
		setEditingRoleId(role.id);
		setPermissionDraft(role.permissions);
	};

	const cancelPermissionEdit = () => {
		setEditingRoleId(null);
		setPermissionDraft([]);
	};

	const toggleDraftPermission = (permissionKey) => {
		setPermissionDraft((prev) =>
			prev.includes(permissionKey)
				? prev.filter((item) => item !== permissionKey)
				: [...prev, permissionKey]
		);
	};

	const selectAllDraftPermissions = () => {
		setPermissionDraft(ALL_PERMISSION_KEYS);
	};

	const clearDraftPermissions = () => {
		setPermissionDraft([]);
	};

	const saveRolePermissions = (roleId) => {
		if (permissionDraft.length === 0) {
			showToast('Choose at least one permission before saving.');
			return;
		}

		setRoles((prev) =>
			prev.map((role) =>
				role.id === roleId ? { ...role, permissions: permissionDraft } : role
			)
		);

		showToast('Role permissions updated.', 'success');
		cancelPermissionEdit();
	};

	const handleCreateRole = async () => {
		const normalizedName = roleName.trim();
		const normalizedDescription = roleDescription.trim();
		const permissions = [...selectedPermissions];

		if (!normalizedName) {
			showToast('Role name is required.');
			return;
		}

		if (!normalizedDescription) {
			showToast('Role description is required.');
			return;
		}

		if (permissions.length === 0) {
			showToast('Select at least one permission.');
			return;
		}

		const duplicate = roles.some(
			(role) => role.name.toLowerCase() === normalizedName.toLowerCase()
		);

		if (duplicate) {
			showToast('Role name already exists. Use a different name.');
			return;
		}

		setIsCreatingRole(true);

		try {
			const newRole = {
				id: `ROLE-${String(roles.length + 1).padStart(3, '0')}`,
				name: normalizedName,
				description: normalizedDescription,
				permissions,
			};

			setRoles((prev) => [newRole, ...prev]);
			setRoleName('');
			setRoleDescription('');
			setSelectedPermissions([]);
			showToast('Role created successfully.', 'success');
		} finally {
			setIsCreatingRole(false);
		}
	};

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
					title="Role Management"
					subtitle="Admin Module"
				/>

				<AppCard style={styles.formCard}>
					<Text style={styles.cardTitle}>Create New Role</Text>
					<Text style={styles.subtitle}>Define permissions and assign access levels.</Text>

					<View style={styles.formFields}>
						<AppTextField
							label="Role Name"
							leftIconName="shield-outline"
							value={roleName}
							onChangeText={setRoleName}
							placeholder="e.g. Support Supervisor"
							placeholderTextColor="#667693"
						/>

						<AppTextField
							label="Description"
							leftIconName="document-text-outline"
							value={roleDescription}
							onChangeText={setRoleDescription}
							placeholder="Describe what this role can do"
							placeholderTextColor="#667693"
						/>
					</View>

					<Text style={styles.fieldLabel}>Assign Permissions</Text>
					<Text style={styles.fieldHint}>Selected: {selectedPermissions.length}</Text>

					<PermissionSelector
						selectedPermissions={selectedPermissions}
						onTogglePermission={toggleCreatePermission}
						onSelectAll={selectAllCreatePermissions}
						onClear={clearCreatePermissions}
					/>

					<AppButton
						title={isCreatingRole ? 'Creating Role...' : 'Create Role'}
						onPress={handleCreateRole}
						disabled={isCreatingRole}
						iconName="add-circle-outline"
						style={styles.createButton}
					/>
				</AppCard>

				<AppCard style={styles.rolesCard}>
					<Text style={styles.cardTitle}>Existing Roles ({roles.length})</Text>

					{roles.map((role) => (
						<View key={role.id} style={styles.roleItem}>
							<View style={styles.roleHeadRow}>
								<Text style={styles.roleName}>{role.name}</Text>
								<Pressable
									onPress={() => startPermissionEdit(role)}
									style={styles.assignButton}
								>
									<Text style={styles.assignButtonText}>Assign Permissions</Text>
								</Pressable>
							</View>

							<Text style={styles.roleDescription}>{role.description}</Text>

							<View style={styles.currentPermissionsWrap}>
								{role.permissions.map((permissionKey) => (
									<View key={permissionKey} style={styles.permissionPill}>
										<Text style={styles.permissionPillText}>{getPermissionLabel(permissionKey)}</Text>
									</View>
								))}
							</View>

							{editingRoleId === role.id ? (
								<View style={styles.editPanel}>
									<Text style={styles.editPanelTitle}>Update Permissions for {role.name}</Text>
									<Text style={styles.fieldHint}>Selected: {permissionDraft.length}</Text>

									<PermissionSelector
										selectedPermissions={permissionDraft}
										onTogglePermission={toggleDraftPermission}
										onSelectAll={selectAllDraftPermissions}
										onClear={clearDraftPermissions}
									/>

									<View style={styles.editActionsRow}>
										<Pressable style={styles.cancelButton} onPress={cancelPermissionEdit}>
											<Text style={styles.cancelButtonText}>Cancel</Text>
										</Pressable>
										<Pressable
											style={styles.saveButton}
											onPress={() => saveRolePermissions(role.id)}
										>
											<Text style={styles.saveButtonText}>Save</Text>
										</Pressable>
									</View>
								</View>
							) : null}
						</View>
					))}
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
	rolesCard: {
		width: '100%',
		maxWidth: '100%',
		alignSelf: 'stretch',
		borderRadius: 18,
		paddingHorizontal: 14,
		paddingVertical: 16,
		backgroundColor: 'rgba(18,26,53,0.95)',
		borderColor: 'rgba(115,137,172,0.22)',
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
	fieldLabel: {
		color: '#a8bbd7',
		fontSize: 13,
		fontWeight: '700',
		marginTop: 2,
	},
	fieldHint: {
		color: '#7f95b7',
		fontSize: 12,
		marginTop: 4,
		marginBottom: 8,
	},
	formFields: {
		gap: 10,
	},
	selectorCard: {
		borderRadius: 12,
		padding: 10,
		backgroundColor: 'rgba(12,22,44,0.72)',
		borderWidth: 1,
		borderColor: 'rgba(129,151,186,0.18)',
	},
	selectorActionsRow: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		gap: 8,
		marginBottom: 8,
	},
	secondaryAction: {
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: 'rgba(129,151,186,0.22)',
		backgroundColor: 'rgba(16,27,52,0.7)',
	},
	secondaryActionText: {
		color: '#a8bbd7',
		fontSize: 11,
		fontWeight: '700',
	},
	permissionGroup: {
		marginTop: 6,
	},
	groupTitle: {
		color: '#c8d8f0',
		fontSize: 12,
		fontWeight: '800',
		marginBottom: 7,
	},
	permissionsWrap: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	currentPermissionsWrap: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
		marginTop: 6,
	},
	permissionChip: {
		borderRadius: 999,
		borderWidth: 1,
		borderColor: 'rgba(129,151,186,0.28)',
		paddingHorizontal: 10,
		paddingVertical: 6,
		backgroundColor: 'rgba(16,27,52,0.8)',
	},
	permissionChipSelected: {
		backgroundColor: 'rgba(245,167,16,0.18)',
		borderColor: 'rgba(245,167,16,0.5)',
	},
	permissionChipText: {
		color: '#8ea3c4',
		fontSize: 12,
		fontWeight: '700',
	},
	permissionChipTextSelected: {
		color: '#ffd166',
	},
	createButton: {
		height: 52,
		marginTop: 12,
		marginBottom: 0,
	},
	roleItem: {
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(129,151,186,0.18)',
	},
	roleHeadRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 10,
	},
	roleName: {
		color: '#f2f6ff',
		fontSize: 14,
		fontWeight: '800',
	},
	assignButton: {
		borderRadius: 999,
		paddingHorizontal: 10,
		paddingVertical: 6,
		backgroundColor: 'rgba(63,140,255,0.2)',
		borderWidth: 1,
		borderColor: 'rgba(63,140,255,0.42)',
	},
	assignButtonText: {
		color: '#8cc0ff',
		fontSize: 12,
		fontWeight: '700',
	},
	roleDescription: {
		marginTop: 4,
		color: '#a6b7d4',
		fontSize: 13,
	},
	permissionPill: {
		borderRadius: 999,
		paddingHorizontal: 8,
		paddingVertical: 4,
		backgroundColor: 'rgba(20,48,94,0.7)',
		borderWidth: 1,
		borderColor: 'rgba(129,151,186,0.22)',
	},
	permissionPillText: {
		color: '#a8bbd7',
		fontSize: 11,
		fontWeight: '700',
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
});
