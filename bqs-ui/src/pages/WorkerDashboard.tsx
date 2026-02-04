import React, { useState } from 'react';
import { useBQS } from '../context/RoleContext';
import { OpportunityTable } from '../components/OpportunityTable';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Clock, CheckCircle } from 'lucide-react';

export const WorkerDashboard: React.FC = () => {
    const { currentRole, opportunities, getAssessmentForOpp } = useBQS();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

    // Filter logic: Only show opportunities assigned to my role
    const myOpps = opportunities.filter(o =>
        o.assignedRoles.includes(currentRole as 'SA' | 'SP')
    );

    // Determine status based on assessment object
    const getMyStatus = (oppId: string) => {
        const assessment = getAssessmentForOpp(oppId); // get latest/v1
        if (!assessment) return 'ASSIGNED';
        return assessment.status || 'ASSIGNED';
    };

    const activeOpps = myOpps.filter(o => {
        const myStatus = getMyStatus(o.id);
        return myStatus === 'ASSIGNED' || myStatus === 'DRAFT';
    });

    const historyOpps = myOpps.filter(o => {
        const myStatus = getMyStatus(o.id);
        return myStatus === 'SUBMITTED';
    });

    // Calculates stats
    const totalValue = activeOpps.reduce((sum, o) => sum + o.dealValue, 0);
    const completedCount = historyOpps.length;

    const handleStart = (id: string) => {
        navigate(`/score/${id}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">My Workspace</h1>
                <div className="text-sm text-gray-500">
                    Role: <span className="font-semibold text-gray-800">{currentRole}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                            <PlayCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Active Assignments</p>
                            <p className="text-2xl font-bold text-gray-900">{activeOpps.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Completed</p>
                            <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Pipeline Value</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalValue)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex border-b border-gray-200">
                    <button
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'active' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}
                        onClick={() => setActiveTab('active')}
                    >
                        Active Tasks
                    </button>
                    <button
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}
                        onClick={() => setActiveTab('history')}
                    >
                        History
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'active' && (
                        <OpportunityTable opportunities={activeOpps} type="worker-active" />
                    )}
                    {activeTab === 'history' && (
                        // We reuse OpportunityTable but filtering by *My* submitted ones.
                        // OpportunityTable expects 'WorkflowStatus' on opps.
                        // Our filtered 'historyOpps' have global statuses.
                        // But for history view, it's fine to show the global status so I know if it's approved or not.
                        <OpportunityTable opportunities={historyOpps} type="completed" />
                    )}
                </div>
            </div>
        </div>
    );
};
