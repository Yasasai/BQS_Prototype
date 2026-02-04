import React from 'react';
import { useBQS } from '../context/RoleContext';
import { ManagerDashboard } from './ManagerDashboard';
import { WorkerDashboard } from './WorkerDashboard';

export const Dashboard: React.FC = () => {
    const { currentRole } = useBQS();
    const isManager = ['PH', 'SH', 'GH'].includes(currentRole);

    return isManager ? <ManagerDashboard /> : <WorkerDashboard />;
};
