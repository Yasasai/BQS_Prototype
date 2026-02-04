import React, { useState } from 'react';
import { useBQS } from '../context/RoleContext';
import { AlertCircle, CheckSquare, Clock, Users } from 'lucide-react';
import { OpportunityTable } from '../components/OpportunityTable';
import { AssignModal } from '../components/AssignModal';
import type { Opportunity } from '../data';

export const ManagerDashboard: React.FC = () => {
    const { opportunities, assignOpportunity, currentRole } = useBQS();

    // Role-based permissions
    const isGH = currentRole === 'GH';
    const canAssign = ['PH', 'SH', 'GH'].includes(currentRole);
    const canViewUnassigned = canAssign;

    const unassignedOpps = opportunities.filter(o => {
        if (o.status !== 'NEW' && o.status !== 'ASSIGNED') return false;

        // GH: Unassigned if missing PH or SH assignment
        if (currentRole === 'GH') return !o.assignedPH || !o.assignedSH;

        // PH: Unassigned if Assigned to PH (or general pool) AND missing SA
        // Note: For now, if no PH is assigned but status is NEW, we might not show it to PH until GH assigns it, per requirements.
        if (currentRole === 'PH') return !!o.assignedPH && !o.assignedSA;

        // SH: Unassigned if Assigned to SH AND missing SP
        if (currentRole === 'SH') return !!o.assignedSH && !o.assignedSP;

        return false;
    });
    const assignedOpps = opportunities.filter(o => ['ASSIGNED', 'IN_PROGRESS'].includes(o.status));
    const reviewOpps = opportunities.filter(o => ['SUBMITTED', 'IN_REVIEW'].includes(o.status));
    const completedOpps = opportunities.filter(o => ['APPROVED', 'REJECTED'].includes(o.status));

    // Determine default tab based on role and urgency
    // GH: Prioritize Review if items exist, otherwise Unassigned
    const getInitialTab = () => {
        if (isGH && reviewOpps.length > 0) return 'review';
        return canViewUnassigned ? 'unassigned' : 'review';
    };

    const [activeTab, setActiveTab] = useState<'unassigned' | 'assigned' | 'review' | 'completed'>(getInitialTab);

    const [selectedOppForAssign, setSelectedOppForAssign] = useState<Opportunity | null>(null);

    const handleAssign = (roles: ('SA' | 'SP')[], sa: string, sp: string, ph?: string, sh?: string) => {
        if (selectedOppForAssign) {
            assignOpportunity(selectedOppForAssign.id, roles, sa, sp, ph, sh);
            setSelectedOppForAssign(null);
        }
    };

    const getCount = (tab: string) => {
        switch (tab) {
            case 'unassigned': return unassignedOpps.length;
            case 'assigned': return assignedOpps.length;
            case 'review': return reviewOpps.length;
            case 'completed': return completedOpps.length;
            default: return 0;
        }
    };

    const SummaryCard = ({ title, count, icon: Icon, color, onClick, active }: any) => (
        <div
            onClick={onClick}
            className={`bg-white p-4 rounded-lg shadow-sm border cursor-pointer transition-all hover:shadow-md ${active ? 'ring-2 ring-primary border-transparent' : 'border-gray-200'}`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${color}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">{title}</p>
                        <h3 className="text-2xl font-bold text-gray-900">{count}</h3>
                    </div>
                </div>
            </div>
        </div>
    );

    const tabClass = (tab: string) =>
        `px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${activeTab === tab
            ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-blue-50/50'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
        }`;

    // Define which tabs are visible for the current role
    const visibleTabs = [
        ...(canViewUnassigned ? ['unassigned'] : []),
        'assigned', // Everyone can see what's in progress
        'review',
        'completed'
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">
                    {isGH ? 'Global Pipeline & Assignment' : 'Review Dashboard'}
                </h1>
                <div className="text-sm text-gray-500">
                    Viewing as <span className="font-semibold text-gray-800">{currentRole}</span>
                    {canAssign && <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">Assigner</span>}
                    {!canAssign && <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full">Reviewer</span>}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                    {canViewUnassigned && (
                        <SummaryCard
                            title="Resource Gaps"
                            count={unassignedOpps.length}
                            icon={Users}
                            color="bg-purple-100 text-purple-600"
                            onClick={() => setActiveTab('unassigned')}
                            active={activeTab === 'unassigned'}
                        />
                    )}
                    <SummaryCard
                        title="In Review"
                        count={reviewOpps.length}
                        icon={AlertCircle}
                        color="bg-amber-100 text-amber-600"
                        onClick={() => setActiveTab('review')}
                        active={activeTab === 'review'}
                    />
                    <SummaryCard
                        title="Active Pipeline"
                        count={assignedOpps.length}
                        icon={Clock}
                        color="bg-blue-100 text-blue-600"
                        onClick={() => setActiveTab('assigned')}
                        active={activeTab === 'assigned'}
                    />
                    <SummaryCard
                        title="Completed"
                        count={completedOpps.length}
                        icon={CheckSquare}
                        color="bg-emerald-100 text-emerald-600"
                        onClick={() => setActiveTab('completed')}
                        active={activeTab === 'completed'}
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex border-b border-gray-200">
                    {visibleTabs.map((tab) => (
                        <button key={tab} className={tabClass(tab)} onClick={() => setActiveTab(tab as any)}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                {getCount(tab)}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {activeTab === 'unassigned' && canViewUnassigned && (
                        <OpportunityTable
                            type="unassigned"
                            opportunities={unassignedOpps}
                            onAssign={canAssign ? (opp) => setSelectedOppForAssign(opp) : undefined}
                        />
                    )}
                    {activeTab === 'assigned' && <OpportunityTable type="assigned" opportunities={assignedOpps} />}
                    {activeTab === 'review' && <OpportunityTable type="review" opportunities={reviewOpps} />}
                    {activeTab === 'completed' && <OpportunityTable type="completed" opportunities={completedOpps} />}
                </div>
            </div>

            {selectedOppForAssign && (
                <AssignModal
                    isOpen={true}
                    opportunity={selectedOppForAssign}
                    onClose={() => setSelectedOppForAssign(null)}
                    onAssign={handleAssign}
                    currentUserRole={currentRole}
                />
            )}
        </div>
    );
};
