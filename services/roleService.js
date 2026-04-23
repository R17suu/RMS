import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../FirebaseConfig';

const COLLECTION_NAME = 'roles';

export const fetchRoles = async () => {
	const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
	return querySnapshot.docs.map(doc => ({
		id: doc.id,
		...doc.data()
	}));
};

export const createRole = async (roleData) => {
	const dataWithTimestamp = {
		...roleData,
		createdAt: serverTimestamp()
	};
	const docRef = await addDoc(collection(db, COLLECTION_NAME), dataWithTimestamp);
	return {
		id: docRef.id,
		...dataWithTimestamp
	};
};

export const updateRolePermissions = async (roleId, permissions) => {
	const roleRef = doc(db, COLLECTION_NAME, roleId);
	await updateDoc(roleRef, {
		permissions: permissions
	});
};
