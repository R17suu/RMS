import React from 'react';
import SharedProductsScreen from '../../components/screens/SharedProductsScreen';
import ClerkHeader from '../../components/clerk/ClerkHeader';

export default function ClerkProducts() {
    return <SharedProductsScreen role="clerk" headerComponent={<ClerkHeader title="Souvenir Catalog" />} />;
}
