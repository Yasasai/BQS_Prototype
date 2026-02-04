import React from 'react';
import { useBQS } from '../context/RoleContext';
import { OpportunityTable } from '../components/OpportunityTable';

export const AllOpportunities: React.FC = () => {
    const { opportunities } = useBQS();
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">All Opportunities</h1>
            <OpportunityTable opportunities={opportunities} />
        </div>
    );
};
