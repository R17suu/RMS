import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { db } from '../FirebaseConfig';

const COLLECTION_NAME = 'tickets';

export const fetchTickets = async () => {
	// Query to get tickets
	const q = query(collection(db, COLLECTION_NAME));
	const querySnapshot = await getDocs(q);
	
	const tickets = querySnapshot.docs.map(doc => ({
		id: doc.id,
		...doc.data()
	}));

	// Sort tickets by createdAt descending (most recent first)
	return tickets.sort((a, b) => {
		const timeA = a.createdAt?.seconds || 0;
		const timeB = b.createdAt?.seconds || 0;
		return timeB - timeA;
	});
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
