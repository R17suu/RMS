import React from 'react';
import SharedPOSScreen from '../../components/screens/SharedPOSScreen';
import ClerkHeader from '../../components/clerk/ClerkHeader';

export default function AdminPOS() {
    return <SharedPOSScreen headerComponent={<ClerkHeader title="Point of Sale" subtitle="Admin Module" showBack={true} />} />;
}
