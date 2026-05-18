import React from 'react';
import SharedInventoryScreen from '../../components/screens/SharedInventoryScreen';
import ClerkHeader from '../../components/clerk/ClerkHeader';

export default function AdminInventory() {
    return <SharedInventoryScreen headerComponent={<ClerkHeader title="Inventory Restock" subtitle="Admin Module" showBack={true} />} />;
}
