import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { MOCK_OPPORTUNITIES, MOCK_ASSESSMENTS, getOpportunityStatus } from '../data';
import type { Role, Opportunity, Assessment, WorkflowStatus, ApprovalStatus, SectionScore, AssessmentStatus } from '../data';

// Extended interface for UI consumption
export interface OpportunityWithStatus extends Opportunity {
    status: WorkflowStatus;
}

interface BQSContextType {
    currentRole: Role;
    setCurrentRole: (role: Role) => void;
    opportunities: OpportunityWithStatus[];
    assessments: Assessment[];
    assignOpportunity: (oppId: string, roles: ('SA' | 'SP')[], saId?: string, spId?: string, phId?: string, shId?: string) => void;
    saveAssessment: (oppId: string, data: { status: AssessmentStatus; scores: SectionScore[] }) => void;
    submitApproval: (oppId: string, decision: ApprovalStatus) => void;
    getAssessmentForOpp: (oppId: string, version?: number) => Assessment | undefined;
}

const BQSContext = createContext<BQSContextType | undefined>(undefined);

export const BQSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentRole, setCurrentRole] = useState<Role>('PH'); // Default to Practice Head
    const [opportunities, setOpportunities] = useState<Opportunity[]>(MOCK_OPPORTUNITIES);
    const [assessments, setAssessments] = useState<Assessment[]>(MOCK_ASSESSMENTS);

    // Compute status for all opportunities based on current assessments
    const opportunitiesWithStatus: OpportunityWithStatus[] = opportunities.map(o => ({
        ...o,
        status: getOpportunityStatus(o, assessments)
    }));

    const assignOpportunity = (oppId: string, roles: ('SA' | 'SP')[], saId?: string, spId?: string, phId?: string, shId?: string) => {
        setOpportunities(prev => prev.map(o => {
            if (o.id === oppId) {
                return {
                    ...o,
                    assignedRoles: roles,
                    assignedSA: saId || o.assignedSA,
                    assignedSP: spId || o.assignedSP,
                    assignedPH: phId || o.assignedPH,
                    assignedSH: shId || o.assignedSH
                };
            }
            return o;
        }));
    };

    const saveAssessment = (oppId: string, data: { status: AssessmentStatus; scores: SectionScore[] }) => {
        setAssessments(prev => {
            // Find existing assessment for version 1 (assuming v1 for prototype)
            const existingIndex = prev.findIndex(a => a.opportunityId === oppId && a.version === 1);

            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    ...data,
                    updatedAt: new Date().toISOString()
                };
                return updated;
            } else {
                return [...prev, {
                    opportunityId: oppId,
                    version: 1,
                    ...data,
                    updatedAt: new Date().toISOString()
                }];
            }
        });
    };

    const submitApproval = (oppId: string, decision: ApprovalStatus) => {
        if (!['PH', 'SH', 'GH'].includes(currentRole)) return;

        setOpportunities(prev => prev.map(o => {
            if (o.id === oppId) {
                const newApprovals = { ...o.approvals };
                if (currentRole === 'PH') newApprovals.PH = decision;
                if (currentRole === 'SH') newApprovals.SH = decision;
                if (currentRole === 'GH') newApprovals.GH = decision;

                return {
                    ...o,
                    approvals: newApprovals
                };
            }
            return o;
        }));
    };

    const getAssessmentForOpp = (oppId: string, version: number = 1) => {
        return assessments.find(a => a.opportunityId === oppId && a.version === version);
    };

    return (
        <BQSContext.Provider value={{
            currentRole,
            setCurrentRole,
            opportunities: opportunitiesWithStatus,
            assessments,
            assignOpportunity,
            saveAssessment,
            submitApproval,
            getAssessmentForOpp
        }}>
            {children}
        </BQSContext.Provider>
    );
};

export const useBQS = () => {
    const context = useContext(BQSContext);
    if (context === undefined) {
        throw new Error('useBQS must be used within a BQSProvider');
    }
    return context;
};
