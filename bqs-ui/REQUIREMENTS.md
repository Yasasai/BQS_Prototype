# Bid Qualification System (BQS) - Requirements & Workflow

## Core Philosophy
**"Split Command, Unified Goal."**
Resource allocation is owned by the specific leader of that function. Governance is hierarchical.

## 1. Assignment Flow (Split Responsibility)
*   **Practice Head (PH)**
    *   **Owns:** Technical Resources (Solution Architects).
    *   **Action:** Sees opportunities with NO SA → Assigns **SA**.
*   **Sales Head (SH)** (Sector Head/Sales Leader)
    *   **Owns:** Sales Resources (Salespersons).
    *   **Action:** Sees opportunities with NO SP → Assigns **SP**.
*   **Geo-Head (GH)**
    *   **Role:** Governance / Regional Leader.
    *   **Action:** Monitors pipeline. Does **NOT** assign resources (usually). Acts as final escalation/approver.

## 2. Worker Flow (SA & SP)
*   **SA (Solution Architect)**: Scopes the technical solution. Assigned by PH.
*   **SP (Salesperson)**: Scopes the commercial/client side. Assigned by SH.
*   **Execution:** They work in parallel on the same opportunity.

## 3. Workflow States
1.  **New Opportunity:** `assigned_sa: null`, `assigned_sp: null`.
2.  **Partial Assignment:**
    *   PH assigns SA → `assigned_sa: 'John'`, `status: 'PARTIAL'` (or remains NEW).
    *   SH assigns SP → `assigned_sp: 'Jane'`.
3.  **Fully Assigned:** Both slots filled. Opportunity moves to **"In Progress"**.
4.  **Submission:** Workers submit independently.
5.  **Review:** Leaders review the combined output.

## 4. Dashboard Rules
*   **PH Dashboard:**
    *   **Unassigned Tab:** Shows items where `SA == null`.
    *   **Assign Modal:** Can ONLY select SA.
*   **SH Dashboard:**
    *   **Unassigned Tab:** Shows items where `SP == null`.
    *   **Assign Modal:** Can ONLY select SP.
*   **GH Dashboard:**
    *   **View:** Executive Oversight.
    *   **Actions:** Review/Approve final deals.

## 5. UI Implications
*   The "Assign" button needs to be context-aware.
*   The Dashboard "Unassigned" count is specific to the *viewer's* responsibility (e.g., PH might see 5 unassigned, SH might see 2, depending on who is missing).
