import React from 'react';
import SharedTicketsScreen from '../../components/screens/SharedTicketsScreen';
import DashboardHeader from '../../components/sadmin/DashboardHeader';

export default function SAdminTickets() {
    return <SharedTicketsScreen role="sadmin" headerComponent={<DashboardHeader title="Ticket Center" subtitle="Super Admin Module" />} />;
}
