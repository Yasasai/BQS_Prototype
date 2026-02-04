import React, { useState } from 'react';
import type { Opportunity, Role } from '../data';
import { X } from 'lucide-react';

interface AssignModalProps {
    opportunity: Opportunity;
    isOpen: boolean;
    onClose: () => void;
    onAssign: (roles: ('SA' | 'SP')[], sa: string, sp: string, ph?: string, sh?: string) => void;
    currentUserRole: Role;
}

const AssignmentSection: React.FC<{
    title: string;
    role: string;
    enabled: boolean;
    setEnabled: (val: boolean) => void;
    canAssign: boolean;
    value: string;
    setValue: (val: string) => void;
    options: { value: string; label: string }[];
}> = ({ title, enabled, setEnabled, canAssign, value, setValue, options }) => (
    <div className={!canAssign ? 'hidden' : ''}>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={enabled}
                        onChange={e => setEnabled(e.target.checked)}
                        className="rounded text-blue-600"
                    />
                    {title}
                </label>
            </div>
            {enabled && (
                <select
                    className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-blue-500 focus:border-blue-500 mt-2"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                >
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            )}
        </div>
    </div>
);

export const AssignModal: React.FC<AssignModalProps> = ({ opportunity, isOpen, onClose, onAssign, currentUserRole }) => {
    // 3-Tier Logic:
    // GH: Assigns to Practice (PH) and Sales Sector (SH)
    // PH: Assigns SA
    // SH: Assigns SP

    const isGH = currentUserRole === 'GH';
    const isPH = currentUserRole === 'PH';
    const isSH = currentUserRole === 'SH';

    // State for Leadership Assignment (GH View)
    const [assignPH, setAssignPH] = useState(isGH && !opportunity.assignedPH);
    const [assignSH, setAssignSH] = useState(isGH && !opportunity.assignedSH);
    const [ph, setPh] = useState('John PH');
    const [sh, setSh] = useState('Jane SH');

    // State for Worker Assignment (PH/SH View)
    const [assignSA, setAssignSA] = useState(isPH && !opportunity.assignedSA);
    const [assignSP, setAssignSP] = useState(isSH && !opportunity.assignedSP);
    const [sa, setSa] = useState('John SA');
    const [sp, setSp] = useState('Jane SP');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const roles: ('SA' | 'SP')[] = []; // Used for old logic, kept for compatibility if needed
        if (assignSA) roles.push('SA');
        if (assignSP) roles.push('SP');

        // GH assigns PH/SH
        const phVal = isGH && assignPH ? ph : undefined;
        const shVal = isGH && assignSH ? sh : undefined;

        // PH/SH assign workers
        const saVal = isPH && assignSA ? sa : (isGH ? '' : opportunity.assignedSA || '');
        const spVal = isSH && assignSP ? sp : (isGH ? '' : opportunity.assignedSP || '');

        onAssign(roles, saVal, spVal, phVal, shVal);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-semibold mb-1 text-gray-800">Assign Opportunity</h2>
                <p className="text-sm text-gray-500 mb-6">Assign resources for {opportunity.name}</p>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* GH View: Assign Leaders */}
                    {isGH && (
                        <>
                            <AssignmentSection
                                title="Assign Practice Head"
                                role="PH"
                                enabled={assignPH}
                                setEnabled={setAssignPH}
                                canAssign={true}
                                value={ph}
                                setValue={setPh}
                                options={[
                                    { value: 'John PH', label: 'Cloud Practice (John PH)' },
                                    { value: 'Alice PH', label: 'Data Practice (Alice PH)' }
                                ]}
                            />
                            <AssignmentSection
                                title="Assign Sales Head"
                                role="SH"
                                enabled={assignSH}
                                setEnabled={setAssignSH}
                                canAssign={true}
                                value={sh}
                                setValue={setSh}
                                options={[
                                    { value: 'Jane SH', label: 'North America (Jane SH)' },
                                    { value: 'Bob SH', label: 'EMEA (Bob SH)' }
                                ]}
                            />
                        </>
                    )}

                    {/* PH/SH View: Assign Workers */}
                    {!isGH && (
                        <>
                            <AssignmentSection
                                title="Assign Solution Architect (SA)"
                                role="SA"
                                enabled={assignSA}
                                setEnabled={setAssignSA}
                                canAssign={isPH}
                                value={sa}
                                setValue={setSa}
                                options={[
                                    { value: 'John SA', label: 'John SA (Senior)' },
                                    { value: 'Mike SA', label: 'Mike SA (Junior)' },
                                    { value: 'Alice SA', label: 'Alice SA (Lead)' }
                                ]}
                            />

                            <AssignmentSection
                                title="Assign Salesperson (SP)"
                                role="SP"
                                enabled={assignSP}
                                setEnabled={setAssignSP}
                                canAssign={isSH}
                                value={sp}
                                setValue={setSp}
                                options={[
                                    { value: 'Jane SP', label: 'Jane SP' },
                                    { value: 'Sarah SP', label: 'Sarah SP' },
                                    { value: 'Bob SP', label: 'Bob SP' }
                                ]}
                            />
                        </>
                    )}

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-md hover:bg-blue-700 shadow-sm"
                        >
                            Confirm Assignment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
