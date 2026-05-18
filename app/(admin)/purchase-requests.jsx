import React from 'react';
import SharedPRScreen from '../../components/screens/SharedPRScreen';
import ClerkHeader from '../../components/clerk/ClerkHeader';

export default function AdminPurchaseRequests() {
    return <SharedPRScreen headerComponent={<ClerkHeader title="Pending Draft POs" subtitle="Admin Module" showBack={true} />} />;
}
