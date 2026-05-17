import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../FirebaseConfig';
import { createLog } from './logService';

const COLLECTION_NAME = 'restocks';

export const recordRestock = async (productId, productName, quantityAdded, clerkId) => {
	// 1. Record the restock log
	const restockData = {
		productId,
		productName,
		quantityAdded: parseInt(quantityAdded, 10),
		clerkId,
		createdAt: serverTimestamp()
	};
	
	const docRef = await addDoc(collection(db, COLLECTION_NAME), restockData);

	// 2. Add stock to the product
	const productRef = doc(db, 'products', productId);
	const productSnap = await getDoc(productRef);
	if (productSnap.exists()) {
		const currentStock = productSnap.data().stock || 0;
		const newStock = currentStock + restockData.quantityAdded;
		await updateDoc(productRef, { stock: newStock });
	}

	// 3. Record stock movement
	const movementData = {
		productId,
		type: 'IN',
		quantity: restockData.quantityAdded,
		referenceId: docRef.id,
        referenceNumber: 'RESTOCK',
        userId: clerkId,
		description: 'Restock',
		createdAt: serverTimestamp()
	};
	await addDoc(collection(db, 'stock_movements'), movementData);

	await createLog({
		level: 'INFO',
		message: `Restocked ${restockData.quantityAdded} units for ${productName}`,
		service: 'Inventory',
		actor: auth.currentUser?.email || 'System'
	});

	return {
		id: docRef.id,
		...restockData
	};
};

export const fetchRestockHistory = async () => {
	const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
	const querySnapshot = await getDocs(q);
	return querySnapshot.docs.map(d => ({
		id: d.id,
		...d.data()
	}));
};

export const fetchProductStockCard = async (productId) => {
	// Need to query stock_movements for this product
	// Since we order by createdAt, we need an index in Firestore: productId (ASC) + createdAt (DESC)
	// We'll sort on client to avoid requiring composite index creation immediately, but the proper way is querying ordered.
	// For small datasets, client sorting is okay.
	const q = query(
		collection(db, 'stock_movements'),
		orderBy('createdAt', 'desc')
	);
	const querySnapshot = await getDocs(q);
	
	// Filter locally to avoid composite index error if index doesn't exist
	const movements = querySnapshot.docs
		.map(d => ({ id: d.id, ...d.data() }))
		.filter(m => m.productId === productId);
		
	return movements;
};
