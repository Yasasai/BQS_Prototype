export type Role = 'SA' | 'SP' | 'PH' | 'SH' | 'GH';

export type AssessmentStatus = 'DRAFT' | 'SUBMITTED';

export type ApprovalStatus = 'APPROVED' | 'REJECTED';

// Final status is derived from approvals
export type WorkflowStatus =
    | "NEW"
    | "ASSIGNED"
    | "IN_PROGRESS"
    | "SUBMITTED" // At least one assessment submitted
    | "IN_REVIEW" // Waiting for approvals
    | "APPROVED"  // All required approvers approved
    | "REJECTED"; // Any approver rejected

export interface Opportunity {
    id: string;
    name: string;
    customer: string;
    dealValue: number;
    closeDate: string;

    // Assignment
    assignedRoles: ('SA' | 'SP')[];
    assignedSA?: string; // specific user name (optional)
    assignedSP?: string; // specific user name (optional)
    assignedPH?: string; // Practice Head responsible
    assignedSH?: string; // Sales Head responsible

    // Approvals
    approvals: {
        PH?: ApprovalStatus;
        SH?: ApprovalStatus;
        GH?: ApprovalStatus;
    };
}

export type SectionId =
    | "strategic_fit"
    | "win_probability"
    | "financial_value"
    | "competitive_position"
    | "delivery_feasibility"
    | "customer_relationship"
    | "risk_exposure"
    | "compliance"
    | "legal_readiness";

export interface SectionScore {
    sectionId: SectionId;
    score: number; // 0-5
    reasons: string[];
    notes: string;
}

export interface Assessment {
    opportunityId: string;
    version: number;
    status: AssessmentStatus;
    scores: SectionScore[];
    submittedAt?: string;
    updatedAt?: string;
    submittedBy?: Role[]; // Track who has clicked submit? Or just status.
}

// Removing RoleAssessmentData as it is merged into Assessment


export const SECTIONS: { id: SectionId; label: string }[] = [
    { id: "strategic_fit", label: "Strategic Fit" },
    { id: "win_probability", label: "Win Probability" },
    { id: "financial_value", label: "Financial Value" },
    { id: "competitive_position", label: "Competitive Position" },
    { id: "delivery_feasibility", label: "Delivery Feasibility" },
    { id: "customer_relationship", label: "Customer Relationship" },
    { id: "risk_exposure", label: "Risk Exposure" },
    { id: "compliance", label: "Product / Service Compliance" },
    { id: "legal_readiness", label: "Legal & Commercial Readiness" },
];

export const MOCK_OPPORTUNITIES: Opportunity[] = [
    // 1. GH Unassigned (No PH or SH assigned) - Visible to GH
    {
        id: "OPP-001", name: "Strategic Cloud Deal", customer: "Acme Corp", dealValue: 1200000, closeDate: "2024-12-15",
        assignedRoles: [], approvals: {}
    },
    {
        id: "OPP-007", name: "Global Blockchain Rollout", customer: "Cyberdyne Systems", dealValue: 150000, closeDate: "2025-02-15",
        assignedRoles: [], approvals: {}
    },
    {
        id: "OPP-009", name: "SAP Global Transformation", customer: "Massive Dynamic", dealValue: 5000000, closeDate: "2025-06-01",
        assignedRoles: [], approvals: {}
    },

    // 2. PH Unassigned (Assigned to PH, but needs SA) - Visible to PH
    {
        id: "OPP-011", name: "Data Lake Modernization", customer: "Tyrell Corp", dealValue: 850000, closeDate: "2025-03-01",
        assignedRoles: [], assignedPH: "John PH", assignedSH: "Jane SH", assignedSP: "Jane SP", // SP is assigned, but SA is missing
        approvals: {}
    },
    {
        id: "OPP-012", name: "Financial Risk Engine", customer: "Gringotts", dealValue: 2200000, closeDate: "2025-04-15",
        assignedRoles: [], assignedPH: "John PH", assignedSH: "Jane SH", // Neither SA nor SP assigned, but PH sees it because PH is assigned
        approvals: {}
    },

    // 3. SH Unassigned (Assigned to SH, but needs SP) - Visible to SH
    {
        id: "OPP-013", name: "Retail Analytics Platform", customer: "Buy n Large", dealValue: 1800000, closeDate: "2024-12-30",
        assignedRoles: [], assignedPH: "John PH", assignedSH: "Jane SH", assignedSA: "John SA", // SA is assigned, but SP is missing
        approvals: {}
    },

    // 4. Fully Assigned (In Progress)
    {
        id: "OPP-002", name: "ERP Upgrade", customer: "Globex Inc", dealValue: 4500000, closeDate: "2024-11-20",
        assignedRoles: ["SA", "SP"], assignedPH: "John PH", assignedSH: "Jane SH", assignedSA: "John SA", assignedSP: "Jane SP",
        approvals: {}
    },
    {
        id: "OPP-003", name: "Data Warehouse Build", customer: "Soylent Corp", dealValue: 800000, closeDate: "2025-01-10",
        assignedRoles: ["SA", "SP"], assignedPH: "John PH", assignedSH: "Jane SH", assignedSA: "John SA", assignedSP: "Jane SP",
        approvals: {}
    },

    // 5. In Review / Submitted
    {
        id: "OPP-004", name: "AI Implementation", customer: "Umbrella Corp", dealValue: 2500000, closeDate: "2024-12-01",
        assignedRoles: ["SA", "SP"], assignedPH: "John PH", assignedSH: "Jane SH", assignedSA: "John SA", assignedSP: "Jane SP",
        approvals: { PH: "APPROVED" } // Partially approved
    },

    // 6. Completed (Approved/Rejected)
    {
        id: "OPP-005", name: "Mobile App Refresh", customer: "Stark Ind", dealValue: 50000, closeDate: "2024-10-30",
        assignedRoles: ["SA", "SP"], assignedPH: "John PH", assignedSH: "Jane SH", assignedSA: "John SA", assignedSP: "Jane SP",
        approvals: { PH: "APPROVED", SH: "APPROVED", GH: "APPROVED" }
    },
    {
        id: "OPP-006", name: "Cybersecurity Audit", customer: "Wayne Ent", dealValue: 300000, closeDate: "2024-11-05",
        assignedRoles: ["SA", "SP"], assignedPH: "John PH", assignedSH: "Jane SH", assignedSA: "John SA", assignedSP: "Jane SP",
        approvals: { GH: "REJECTED" }
    },
];

// Helper to derive status
export function getOpportunityStatus(opp: Opportunity, assessments: Assessment[]): WorkflowStatus {
    // 1. Rejected?
    const approvalValues = Object.values(opp.approvals);
    if (approvalValues.includes('REJECTED')) return 'REJECTED';

    // 2. Approved? (All 3 must approve)
    if (opp.approvals.PH === 'APPROVED' && opp.approvals.SH === 'APPROVED' && opp.approvals.GH === 'APPROVED') {
        return 'APPROVED';
    }

    // 3. Submitted?
    // Find latest assessment
    const relatedAssessments = assessments.filter(a => a.opportunityId === opp.id);
    // Sort by version desc
    const latest = relatedAssessments.sort((a, b) => b.version - a.version)[0];

    if (latest) {
        if (latest.status === 'SUBMITTED') {
            // If partially approved, it's IN_REVIEW
            if (approvalValues.length > 0) return 'IN_REVIEW';
            return 'SUBMITTED';
        }

        // 4. In Progress?
        if (latest.status === 'DRAFT') return 'IN_PROGRESS';
    }

    // 5. Assigned?
    if (opp.assignedRoles.length > 0) return 'ASSIGNED';

    return 'NEW';
}

// Helper to create initial scores
export const createEmptyScores = (): SectionScore[] =>
    SECTIONS.map(s => ({ sectionId: s.id, score: 0, reasons: [], notes: "" }));

export const MOCK_ASSESSMENTS: Assessment[] = [
    {
        opportunityId: "OPP-004",
        version: 1,
        status: "SUBMITTED",
        submittedAt: "2024-09-28T10:00:00Z",
        scores: createEmptyScores().map(s => ({ ...s, score: 3, notes: "Good fit" }))
    },
    // In progress for OPP-003
    {
        opportunityId: "OPP-003",
        version: 1,
        status: "DRAFT",
        scores: createEmptyScores()
    }
];
