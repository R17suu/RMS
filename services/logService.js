import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, query, where, orderBy } from 'firebase/firestore';
import { db } from '../FirebaseConfig';

const COLLECTION_NAME = 'audit_logs';

export const fetchLogs = async (levelFilter = 'All') => {
	let q = query(collection(db, COLLECTION_NAME));
	
	if (levelFilter !== 'All') {
		q = query(collection(db, COLLECTION_NAME), where('level', '==', levelFilter));
	}
	
	// Note: If you add orderBy('createdAt', 'desc') along with 'where', you might need a composite index in Firestore.
	// For simplicity in development, we'll fetch and then sort on the client, or just rely on default ordering.
	
	const querySnapshot = await getDocs(q);
	
	const logs = querySnapshot.docs.map(doc => ({
		id: doc.id,
		...doc.data()
	}));

	// Sort newest first (client-side sort to avoid requiring a composite index immediately)
	return logs.sort((a, b) => {
		const timeA = a.createdAt?.seconds || 0;
		const timeB = b.createdAt?.seconds || 0;
		return timeB - timeA;
	});
};

export const createLog = async (logData) => {
	const dataWithTimestamp = {
		...logData,
		createdAt: serverTimestamp()
	};
	const docRef = await addDoc(collection(db, COLLECTION_NAME), dataWithTimestamp);
	return {
		id: docRef.id,
		...dataWithTimestamp
	};
};

export const clearAllLogs = async () => {
	// Fetch all logs and delete them one by one
	const q = query(collection(db, COLLECTION_NAME));
	const snapshot = await getDocs(q);
	
	const deletePromises = snapshot.docs.map(document => 
		deleteDoc(doc(db, COLLECTION_NAME, document.id))
	);
	
	await Promise.all(deletePromises);
};
