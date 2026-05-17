import { collection, query, where, getDocs, getCountFromServer, Timestamp } from 'firebase/firestore';
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

export const getSystemHealth = async () => {
    try {
        const [productsSnap, salesSnap, ticketsSnap, restocksSnap] = await Promise.all([
            getCountFromServer(collection(db, 'products')),
            getCountFromServer(collection(db, 'sales')),
            getCountFromServer(collection(db, 'tickets')),
            getCountFromServer(collection(db, 'restocks'))
        ]);

        return {
            totalProducts: productsSnap.data().count,
            totalSales: salesSnap.data().count,
            totalTickets: ticketsSnap.data().count,
            totalRestocks: restocksSnap.data().count
        };
    } catch (error) {
        console.error("Failed to fetch system health:", error);
        return { totalProducts: 0, totalSales: 0, totalTickets: 0, totalRestocks: 0 };
    }
};

export const getAuthAnomalies = async () => {
    try {
        const logsColl = collection(db, 'audit_logs');
        const q = query(
            logsColl,
            where('service', '==', 'Authentication'),
            where('level', '==', 'WARN')
        );
        const snapshot = await getDocs(q);
        
        const anomalies = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Sort newest first
        return anomalies.sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
        });
    } catch (error) {
        console.error("Failed to fetch auth anomalies:", error);
        return [];
    }
};

export const getWeeklyAlerts = async () => {
    try {
        const logsColl = collection(db, 'audit_logs');
        
        // Get date 7 days ago
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const logsQuery = query(
            logsColl, 
            where('createdAt', '>=', Timestamp.fromDate(sevenDaysAgo))
        );

        const snapshot = await getDocs(logsQuery);
        
        // Initialize days
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const alertsMap = new Map();
        
        // Create an entry for the last 7 days
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            alertsMap.set(days[d.getDay()], 0);
        }

        // Count WARN and ERROR logs
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.level === 'WARN' || data.level === 'ERROR') {
                const date = data.createdAt.toDate();
                const dayName = days[date.getDay()];
                if (alertsMap.has(dayName)) {
                    alertsMap.set(dayName, alertsMap.get(dayName) + 1);
                }
            }
        });

        // Format for the chart (find max for relative height)
        let maxAlerts = 1;
        const result = [];
        alertsMap.forEach((amount, day) => {
            if (amount > maxAlerts) maxAlerts = amount;
            result.push({ day, amount });
        });

        // Calculate heights (max height is ~82 in the UI)
        return result.map(item => ({
            day: item.day,
            amount: String(item.amount),
            height: Math.max(10, Math.floor((item.amount / maxAlerts) * 82)),
            accent: item.amount === maxAlerts && item.amount > 0
        }));

    } catch (error) {
        console.error("Failed to fetch weekly alerts:", error);
        // Fallback static structure
        return [
            { day: 'Mon', amount: '0', height: 10 },
            { day: 'Tue', amount: '0', height: 10 },
            { day: 'Wed', amount: '0', height: 10 },
            { day: 'Thu', amount: '0', height: 10 },
            { day: 'Fri', amount: '0', height: 10 },
            { day: 'Sat', amount: '0', height: 10 },
            { day: 'Sun', amount: '0', height: 10 },
        ];
    }
};

export const getWeeklySalesData = async () => {
    try {
        const salesColl = collection(db, 'sales');
        
        // Get date 7 days ago
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const salesQuery = query(
            salesColl, 
            where('createdAt', '>=', Timestamp.fromDate(sevenDaysAgo))
        );

        const snapshot = await getDocs(salesQuery);
        
        // Initialize days
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const salesMap = new Map();
        
        // Create an entry for the last 7 days
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            salesMap.set(days[d.getDay()], 0);
        }

        // Sum sales amounts
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.status === 'Completed') {
                const date = data.createdAt.toDate();
                const dayName = days[date.getDay()];
                if (salesMap.has(dayName)) {
                    salesMap.set(dayName, salesMap.get(dayName) + parseFloat(data.totalAmount || 0));
                }
            }
        });

        // Format for the chart (find max for relative height)
        let maxSales = 1; // Prevent div by 0
        const result = [];
        salesMap.forEach((amount, day) => {
            if (amount > maxSales) maxSales = amount;
            result.push({ day, amount });
        });

        // Calculate heights (max height is ~82 in the UI)
        return result.map(item => ({
            day: item.day,
            amount: '₱' + Math.round(item.amount),
            height: Math.max(10, Math.floor((item.amount / maxSales) * 82)),
            accent: item.amount === maxSales && item.amount > 0
        }));

    } catch (error) {
        console.error("Failed to fetch weekly sales:", error);
        return [
            { day: 'Mon', amount: '₱0', height: 10 },
            { day: 'Tue', amount: '₱0', height: 10 },
            { day: 'Wed', amount: '₱0', height: 10 },
            { day: 'Thu', amount: '₱0', height: 10 },
            { day: 'Fri', amount: '₱0', height: 10 },
            { day: 'Sat', amount: '₱0', height: 10 },
            { day: 'Sun', amount: '₱0', height: 10 },
        ];
    }
};
