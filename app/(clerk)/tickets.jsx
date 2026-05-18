import React from 'react';
import SharedTicketsScreen from '../../components/screens/SharedTicketsScreen';
import DashboardHeader from '../../components/sadmin/DashboardHeader';

export default function ClerkTickets() {
    return <SharedTicketsScreen headerComponent={<DashboardHeader title="Support Tickets" subtitle="Clerk Module" />} />;
}
