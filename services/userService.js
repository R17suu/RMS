import { collection, getDocs, getDoc, setDoc, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, secondaryAuth } from '../FirebaseConfig';

const COLLECTION_NAME = 'users';

export const fetchUsers = async () => {
	const usersSnapshot = await getDocs(collection(db, COLLECTION_NAME));
	return usersSnapshot.docs.map(doc => ({
		id: doc.id,
		...doc.data()
	}));
};

export const fetchUserRecord = async (uid) => {
	const userDocRef = doc(db, COLLECTION_NAME, uid);
	const userDocSnap = await getDoc(userDocRef);
	
	if (userDocSnap.exists()) {
		return { id: userDocSnap.id, ...userDocSnap.data() };
	}
	return null;
};

export const createUser = async (userData, password) => {
	// 1. Create the user in Firebase Auth using the secondary instance
	const userCredential = await createUserWithEmailAndPassword(
		secondaryAuth,
		userData.email,
		password
	);

	const uid = userCredential.user.uid;

	// 2. Prepare the data for Firestore
	const dataWithTimestamp = {
		...userData,
		createdAt: serverTimestamp()
	};

	// 3. Save to Firestore using the exact Auth UID as the Document ID
	await setDoc(doc(db, COLLECTION_NAME, uid), dataWithTimestamp);

	return {
		id: uid,
		...dataWithTimestamp
	};
};

export const updateUserStatus = async (userId, status) => {
	await updateDoc(doc(db, COLLECTION_NAME, userId), { status });
};

export const updateUserRole = async (userId, role) => {
	await updateDoc(doc(db, COLLECTION_NAME, userId), { role });
};

export const deleteUserRecord = async (userId) => {
	await deleteDoc(doc(db, COLLECTION_NAME, userId));
};

export const updateUserPassword = async (userId) => {
	await updateDoc(doc(db, COLLECTION_NAME, userId), {
		passwordUpdated: serverTimestamp(),
		hasPassword: true
	});
};
