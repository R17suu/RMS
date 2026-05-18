import React from 'react';
import SharedTransactionsScreen from '../../components/screens/SharedTransactionsScreen';
import ClerkHeader from '../../components/clerk/ClerkHeader';

export default function ClerkTransactions() {
    return <SharedTransactionsScreen role="clerk" headerComponent={<ClerkHeader title="Sales History" />} />;
}
