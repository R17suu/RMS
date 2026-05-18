import React from 'react';
import SharedInventoryScreen from '../../components/screens/SharedInventoryScreen';
import ClerkHeader from '../../components/clerk/ClerkHeader';

export default function SAdminInventory() {
    return <SharedInventoryScreen headerComponent={<ClerkHeader title="Inventory Restock" subtitle="Super Admin Module" showBack={true} />} />;
}
