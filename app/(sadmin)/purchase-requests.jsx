import React from 'react';
import SharedPRScreen from '../../components/screens/SharedPRScreen';
import ClerkHeader from '../../components/clerk/ClerkHeader';

export default function SAdminPurchaseRequests() {
    return <SharedPRScreen headerComponent={<ClerkHeader title="Pending Draft POs" subtitle="Super Admin Module" showBack={true} />} />;
}
