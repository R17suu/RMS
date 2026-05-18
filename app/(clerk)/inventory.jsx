import React from 'react';
import SharedInventoryScreen from '../../components/screens/SharedInventoryScreen';
import ClerkHeader from '../../components/clerk/ClerkHeader';

export default function ClerkInventory() {
    return <SharedInventoryScreen headerComponent={<ClerkHeader title="Inventory Restock" />} />;
}
