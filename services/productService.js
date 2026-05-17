import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp, query, orderBy, getDoc } from 'firebase/firestore';
import { db, auth } from '../FirebaseConfig';
import { createLog } from './logService';

const COLLECTION_NAME = 'products';

export const fetchProducts = async (includeArchived = false) => {
	let q = query(collection(db, COLLECTION_NAME), orderBy('name', 'asc'));
	const querySnapshot = await getDocs(q);
	
	let products = querySnapshot.docs.map(d => ({
		id: d.id,
		...d.data()
	}));

	if (!includeArchived) {
		products = products.filter(p => !p.isArchived);
	}

	return products;
};

export const createProduct = async (productData) => {
	const dataWithTimestamp = {
		...productData,
		stock: parseInt(productData.stock, 10) || 0,
		price: parseFloat(productData.price) || 0,
        description: productData.description || '',
        uom: productData.uom || 'pcs',
        reorderPoint: parseInt(productData.reorderPoint, 10) || 10,
		isArchived: false,
		createdAt: serverTimestamp()
	};
	const docRef = await addDoc(collection(db, COLLECTION_NAME), dataWithTimestamp);

	if (dataWithTimestamp.stock > 0) {
		const movementData = {
			productId: docRef.id,
			type: 'IN',
			quantity: dataWithTimestamp.stock,
			referenceId: docRef.id,
            referenceNumber: 'INITIAL',
            userId: auth.currentUser?.email || 'System',
			description: 'Initial Stock',
			createdAt: serverTimestamp()
		};
		await addDoc(collection(db, 'stock_movements'), movementData);
	}

	await createLog({
		level: 'INFO',
		message: `Created new product: ${productData.name}`,
		service: 'Products',
		actor: auth.currentUser?.email || 'System'
	});

	return {
		id: docRef.id,
		...dataWithTimestamp
	};
};

export const updateProductStock = async (productId, newStock) => {
	const docRef = doc(db, COLLECTION_NAME, productId);
	await updateDoc(docRef, { stock: parseInt(newStock, 10) });

	await createLog({
		level: 'INFO',
		message: `Updated stock for product ID: ${productId} to ${newStock}`,
		service: 'Products',
		actor: auth.currentUser?.email || 'System'
	});
};

export const updateProduct = async (productId, updates) => {
	const docRef = doc(db, COLLECTION_NAME, productId);
	await updateDoc(docRef, updates);
	
	const productName = updates.name || productId;
	await createLog({
		level: 'INFO',
		message: `Updated product: ${productName}`,
		service: 'Products',
		actor: auth.currentUser?.email || 'System'
	});
};

export const deleteProduct = async (productId) => {
	// For now, always do a soft delete to preserve historical records in sales/restocks
	const docRef = doc(db, COLLECTION_NAME, productId);
	await updateDoc(docRef, { isArchived: true });

	await createLog({
		level: 'WARN',
		message: `Archived product ID: ${productId}`,
		service: 'Products',
		actor: auth.currentUser?.email || 'System'
	});
};
