import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '../FirebaseConfig';

export const getDashboardStats = async () => {
    try {
        // 1. Users Created
        const usersColl = collection(db, 'users');
        const usersSnapshot = await getCountFromServer(usersColl);
        const totalUsers = usersSnapshot.data().count;

        // 2. Active Sessions (Users where status === 'Active')
        const activeUsersQuery = query(usersColl, where('status', '==', 'Active'));
        const activeUsersSnapshot = await getCountFromServer(activeUsersQuery);
        const activeSessions = activeUsersSnapshot.data().count;

        // 3. Roles Created
        const rolesColl = collection(db, 'roles');
        const rolesSnapshot = await getCountFromServer(rolesColl);
        const totalRoles = rolesSnapshot.data().count;

        // 4. Error Logs
        const logsColl = collection(db, 'audit_logs');
        const errorLogsQuery = query(logsColl, where('level', '==', 'ERROR'));
        const errorLogsSnapshot = await getCountFromServer(errorLogsQuery);
        const errorLogs = errorLogsSnapshot.data().count;

        return {
            totalUsers,
            activeSessions,
            totalRoles,
            errorLogs
        };
    } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        return {
            totalUsers: 0,
            activeSessions: 0,
            totalRoles: 0,
            errorLogs: 0
        };
    }
};
