import React from 'react';
import SharedPOSScreen from '../../components/screens/SharedPOSScreen';
import DashboardHeader from '../../components/sadmin/DashboardHeader';

export default function SAdminPOS() {
    return <SharedPOSScreen headerComponent={<DashboardHeader title="Point of Sale" subtitle="POS Terminal" showBack={true} />} />;
}
