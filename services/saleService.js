import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, where, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../FirebaseConfig';
import { createLog } from './logService';

const COLLECTION_NAME = 'sales';

export const recordSale = async (items, totalAmount, clerkId, paymentDetails = { method: 'Cash' }, clerkName = 'Unknown User') => {
	const isPR = paymentDetails.method === 'Purchase Request';
	const status = isPR ? 'Pending' : 'Completed';

	// 1. Record the sale transaction
	const saleData = {
		items,
		totalAmount: parseFloat(totalAmount),
		clerkId,
		clerkName,
		paymentDetails,
		status,
		createdAt: serverTimestamp()
	};
	
	const docRef = await addDoc(collection(db, COLLECTION_NAME), saleData);

	// 2. Deduct stock from products and record movements IF NOT Pending
	if (status === 'Completed') {
		for (const item of items) {
			const productRef = doc(db, 'products', item.productId);
			const productSnap = await getDoc(productRef);
			if (productSnap.exists()) {
				const currentStock = productSnap.data().stock || 0;
				const newStock = Math.max(0, currentStock - item.quantity);
				await updateDoc(productRef, { stock: newStock });
				
				// Record stock movement
				const movementData = {
					productId: item.productId,
					type: 'OUT',
					quantity: item.quantity,
					referenceId: docRef.id, // sale ID
                    referenceNumber: paymentDetails.orNumber || paymentDetails.method,
                    userId: clerkId,
					description: `Sale - ${paymentDetails.method}`,
					createdAt: serverTimestamp()
				};
				await addDoc(collection(db, 'stock_movements'), movementData);
			}
		}
	}

	if (isPR) {
		await createLog({
			level: 'INFO',
			message: `Submitted draft Purchase Request (Total: ₱${parseFloat(totalAmount).toFixed(2)})`,
			service: 'Sales',
			actor: auth.currentUser?.email || 'System'
		});
	} else {
		await createLog({
			level: 'INFO',
			message: `Completed sale (Total: ₱${parseFloat(totalAmount).toFixed(2)}) via ${paymentDetails.method}`,
			service: 'Sales',
			actor: auth.currentUser?.email || 'System'
		});
	}

	return {
		id: docRef.id,
		...saleData
	};
};

export const fetchSalesHistory = async () => {
	const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
	const querySnapshot = await getDocs(q);
	return querySnapshot.docs.map(d => ({
		id: d.id,
		...d.data()
	}));
};

export const fetchSalesByClerk = async (clerkUid) => {
	const q = query(
		collection(db, COLLECTION_NAME),
		where('clerkId', '==', clerkUid),
		orderBy('createdAt', 'desc')
	);
	const querySnapshot = await getDocs(q);
	return querySnapshot.docs.map(d => ({
		id: d.id,
		...d.data()
	}));
};

export const fetchPendingPRs = async () => {
	const q = query(
		collection(db, COLLECTION_NAME),
		where('status', '==', 'Pending'),
		orderBy('createdAt', 'desc')
	);
	const querySnapshot = await getDocs(q);
	return querySnapshot.docs.map(d => ({
		id: d.id,
		...d.data()
	}));
};

export const approvePurchaseRequest = async (saleId, poNumber, officerId) => {
	const saleRef = doc(db, COLLECTION_NAME, saleId);
	const saleSnap = await getDoc(saleRef);
	
	if (!saleSnap.exists()) {
		throw new Error("Sale record not found");
	}
	
	const saleData = saleSnap.data();
	if (saleData.status !== 'Pending') {
		throw new Error("Record is not pending");
	}

	// 1. Update sale record
	const updatedPaymentDetails = {
		...saleData.paymentDetails,
		poDocument: poNumber
	};

	await updateDoc(saleRef, {
		status: 'Completed',
		paymentDetails: updatedPaymentDetails,
		approvedBy: officerId,
		approvedAt: serverTimestamp()
	});

	// 2. Deduct stock from products and record movements
	for (const item of saleData.items || []) {
		const productRef = doc(db, 'products', item.productId);
		const productSnap = await getDoc(productRef);
		if (productSnap.exists()) {
			const currentStock = productSnap.data().stock || 0;
			const newStock = Math.max(0, currentStock - item.quantity);
			await updateDoc(productRef, { stock: newStock });
			
			// Record stock movement
			const movementData = {
				productId: item.productId,
				type: 'OUT',
				quantity: item.quantity,
				referenceId: saleId,
                referenceNumber: poNumber,
                userId: officerId,
				description: `Sale - PO: ${poNumber}`,
				createdAt: serverTimestamp()
			};
			await addDoc(collection(db, 'stock_movements'), movementData);
		}
	}

	await createLog({
		level: 'INFO',
		message: `Approved PR and issued PO Number: ${poNumber}`,
		service: 'Sales',
		actor: auth.currentUser?.email || 'System'
	});
};

export const rejectPurchaseRequest = async (saleId, officerId) => {
	const saleRef = doc(db, COLLECTION_NAME, saleId);
	await updateDoc(saleRef, {
		status: 'Rejected',
		rejectedBy: officerId,
		rejectedAt: serverTimestamp()
	});

	await createLog({
		level: 'WARN',
		message: `Rejected Purchase Request ${saleId}`,
		service: 'Sales',
		actor: auth.currentUser?.email || 'System'
	});
};
