import React from 'react';
import SharedTransactionsScreen from '../../components/screens/SharedTransactionsScreen';
import ClerkHeader from '../../components/clerk/ClerkHeader';

export default function SAdminTransactions() {
    return <SharedTransactionsScreen role="sadmin" headerComponent={<ClerkHeader title="Sales History" subtitle="Super Admin Module" showBack={true} />} />;
}
