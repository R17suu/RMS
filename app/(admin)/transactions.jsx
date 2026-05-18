import React from 'react';
import SharedTransactionsScreen from '../../components/screens/SharedTransactionsScreen';
import ClerkHeader from '../../components/clerk/ClerkHeader';

export default function AdminTransactions() {
    return <SharedTransactionsScreen role="admin" headerComponent={<ClerkHeader title="Sales History" subtitle="Admin Module" />} />;
}
