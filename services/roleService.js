import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from '../FirebaseConfig';

const COLLECTION_NAME = 'roles';

export const fetchRoles = async () => {
	const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
	return querySnapshot.docs.map(doc => ({
		id: doc.id,
		...doc.data()
	}));
};

export const fetchRoleByName = async (roleName) => {
	const q = query(collection(db, COLLECTION_NAME), where("name", "==", roleName));
	const querySnapshot = await getDocs(q);
	
	if (!querySnapshot.empty) {
		const roleDoc = querySnapshot.docs[0];
		return { id: roleDoc.id, ...roleDoc.data() };
	}
	return null;
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
