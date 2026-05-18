import React from 'react';
import SharedTicketsScreen from '../../components/screens/SharedTicketsScreen';
import DashboardHeader from '../../components/sadmin/DashboardHeader';

export default function AdminTickets() {
    return <SharedTicketsScreen headerComponent={<DashboardHeader title="Ticket Center" subtitle="Admin Module" />} />;
}
