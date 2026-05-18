import React from 'react';
import SharedProductsScreen from '../../components/screens/SharedProductsScreen';
import ClerkHeader from '../../components/clerk/ClerkHeader';

export default function AdminProducts() {
    return <SharedProductsScreen role="admin" headerComponent={<ClerkHeader title="Souvenir Catalog" subtitle="Admin Module" showBack={true} />} />;
}
