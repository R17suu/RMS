import React from 'react';
import SharedProductsScreen from '../../components/screens/SharedProductsScreen';
import ClerkHeader from '../../components/clerk/ClerkHeader';

export default function SAdminProducts() {
    return <SharedProductsScreen role="sadmin" headerComponent={<ClerkHeader title="Souvenir Catalog" subtitle="Super Admin Module" showBack={true} />} />;
}
