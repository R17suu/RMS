import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { db } from '../FirebaseConfig';

const COLLECTION_NAME = 'tickets';

export const fetchTickets = async () => {
	// Query to get tickets, you could add ordering if you like: query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'))
	const q = query(collection(db, COLLECTION_NAME));
	const querySnapshot = await getDocs(q);
	
	return querySnapshot.docs.map(doc => ({
		id: doc.id,
		...doc.data()
	}));
};

export const createTicket = async (ticketData) => {
	const dataWithTimestamp = {
		...ticketData,
		createdAt: serverTimestamp()
	};
	const docRef = await addDoc(collection(db, COLLECTION_NAME), dataWithTimestamp);
	return {
		id: docRef.id,
		...dataWithTimestamp
	};
};

export const updateTicketStatus = async (ticketId, status) => {
	await updateDoc(doc(db, COLLECTION_NAME, ticketId), { status });
};

export const deleteTicketRecord = async (ticketId) => {
	await deleteDoc(doc(db, COLLECTION_NAME, ticketId));
};
