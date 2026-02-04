import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBQS } from '../context/RoleContext';
import { SECTIONS, createEmptyScores } from '../data';
import type { SectionScore, SectionId } from '../data';
import { ScoreInput } from '../components/scoring/ScoreInput';
import { ChevronRight, Save, Send, AlertTriangle, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import clsx from 'clsx';

export const ScoringWizard: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentRole, opportunities, getAssessmentForOpp, saveAssessment, submitApproval } = useBQS();

    const opportunity = opportunities.find(o => o.id === id);
    const isManager = ['PH', 'SH', 'GH'].includes(currentRole);
    const isWorker = !isManager;

    const [activeSectionId, setActiveSectionId] = useState<SectionId | 'overview'>(SECTIONS[0].id);

    // State for Assessment Data (Shared)
    const [data, setData] = useState<{ status: string, scores: SectionScore[] } | null>(null);

    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);

    useEffect(() => {
        if (!id) return;
        const assessment = getAssessmentForOpp(id);

        if (assessment) {
            setData({ status: assessment.status, scores: assessment.scores });
        } else if (isWorker) {
            // No assessment object yet, start fresh
            setData({
                status: 'DRAFT',
                scores: createEmptyScores()
            });
        }
    }, [id, currentRole, getAssessmentForOpp, isWorker]);

    if (!opportunity) return <div>Opportunity not found</div>;

    const handleScoreUpdate = (newScore: SectionScore) => {
        if (!data) return;
        const newScores = data.scores.map(s => s.sectionId === newScore.sectionId ? newScore : s);
        setData({ ...data, scores: newScores });
    };

    const handleSaveDraft = () => {
        if (data && id) {
            saveAssessment(id, { ...data, status: 'DRAFT' } as any);
        }
    };

    const handleSubmit = () => {
        if (data && id) {
            saveAssessment(id, { ...data, status: 'SUBMITTED' } as any);
            navigate('/dashboard');
        }
    };

    const handleManagerDecision = (decision: 'APPROVED' | 'REJECTED') => {
        if (!id) return;
        if (decision === 'REJECTED' && !rejectionReason) return;
        submitApproval(id, decision);
        navigate('/dashboard');
    };

    const isReadOnly = isManager || (data?.status === 'SUBMITTED');
    const myApproval = opportunity.approvals?.[currentRole as 'PH' | 'SH' | 'GH'];
    const canApprove = isManager && ['SUBMITTED', 'IN_REVIEW'].includes(opportunity.status) && !myApproval;

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-6">
            {/* LEFT SIDEBAR */}
            <div className="w-64 bg-white border border-gray-200 rounded-lg flex flex-col overflow-y-auto">
                <div className="p-4 border-b border-gray-100 font-semibold text-gray-700">
                    Qualification Criteria
                </div>
                <div className="flex-1 py-2">
                    {SECTIONS.map((section, idx) => {
                        const isActive = section.id === activeSectionId;
                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveSectionId(section.id)}
                                className={clsx(
                                    "w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-colors border-l-4",
                                    isActive
                                        ? "bg-blue-50 border-[var(--color-primary)] text-[var(--color-primary)] font-medium"
                                        : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400 font-mono">{idx + 1}.</span>
                                    {section.label}
                                </div>
                                {isActive && <ChevronRight className="w-4 h-4 ml-2" />}
                            </button>
                        );
                    })}
                </div>
                <div className="p-2 border-t border-gray-100">
                    <button
                        onClick={() => setActiveSectionId('overview')}
                        className={clsx(
                            "w-full text-left px-4 py-3 text-sm flex items-center gap-2 rounded transition-colors",
                            activeSectionId === 'overview'
                                ? "bg-blue-600 text-white font-medium"
                                : "text-gray-600 hover:bg-gray-50"
                        )}
                    >
                        <BarChart3 className="w-4 h-4" />
                        Assessment Overview
                    </button>
                </div>
            </div>

            {/* CENTER: SCORING */}
            <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-800">
                        {activeSectionId === 'overview' ? 'Full Assessment Overview' : SECTIONS.find(s => s.id === activeSectionId)?.label}
                    </h2>
                    {isWorker && !isReadOnly && activeSectionId !== 'overview' && (
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                            Draft
                        </span>
                    )}
                </div>

                <div className="flex-1 p-8 overflow-y-auto">
                    {activeSectionId === 'overview' ? (
                        <div className="space-y-6">
                            <p className="text-sm text-gray-500">Summary of scores across all criteria (Shared SA/SP Assessment).</p>
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Criteria</th>
                                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Score</th>
                                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {SECTIONS.map(s => {
                                            const scoreItem = data?.scores.find(sc => sc.sectionId === s.id);
                                            const score = scoreItem?.score || 0;

                                            return (
                                                <tr key={s.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setActiveSectionId(s.id)}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.label}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <span className={clsx(
                                                            "inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold outline outline-1 outline-offset-1",
                                                            score > 0 ? "bg-blue-100 text-blue-700 outline-blue-200" : "bg-gray-100 text-gray-400 outline-gray-200"
                                                        )}>
                                                            {score || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        {score > 0 ? <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold">Completed</span> : <span className="text-[10px] text-gray-400">Empy</span>}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        data && (
                            <div className="space-y-6">
                                <ScoreInput
                                    scoreData={data.scores.find(s => s.sectionId === activeSectionId)!}
                                    onChange={handleScoreUpdate}
                                    readOnly={isReadOnly}
                                />
                            </div>
                        )
                    )}
                </div>

                {/* WORKER ACTIONS */}
                {isWorker && !isReadOnly && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                        <button
                            onClick={handleSaveDraft}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium"
                        >
                            <Save className="w-4 h-4" /> Save Draft
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="flex items-center gap-2 px-6 py-2 bg-[var(--color-primary)] text-white rounded shadow text-sm font-medium hover:bg-blue-700"
                        >
                            <Send className="w-4 h-4" /> Submit Assessment
                        </button>
                    </div>
                )}

                {/* MANAGER ACTIONS */}
                {canApprove && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end items-center gap-4">
                        <button
                            onClick={() => setShowRejectModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded hover:bg-rose-100 text-sm font-medium"
                        >
                            <XCircle className="w-4 h-4" /> Reject Deal
                        </button>
                        <button
                            onClick={() => handleManagerDecision('APPROVED')}
                            className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded shadow text-sm font-medium hover:bg-emerald-700"
                        >
                            <CheckCircle className="w-4 h-4" /> Approve Deal
                        </button>
                    </div>
                )}
                {isManager && myApproval && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end items-center gap-4">
                        <span className={clsx("text-sm font-medium", myApproval === 'APPROVED' ? "text-emerald-600" : "text-rose-600")}>
                            You viewed and {myApproval} this deal.
                        </span>
                    </div>
                )}
            </div>

            {/* RIGHT SIDEBAR: CONTEXT */}
            <div className="w-72 flex flex-col gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Deal Context</h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-gray-400">Customer</p>
                            <p className="font-semibold text-gray-900">{opportunity.customer}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Deal Value</p>
                            <p className="text-2xl font-bold text-[var(--color-primary)]">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(opportunity.dealValue)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Status Tracker */}
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm flex-1">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Workflow</h3>
                    <div className="space-y-4 relative pl-2">
                        <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-gray-100"></div>
                        {['ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED'].map((step) => {
                            const isCompleted = ['APPROVED'].includes(opportunity.status) || (opportunity.status === step);
                            return (
                                <div key={step} className="relative flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full z-10 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                                    <span className={`text-xs font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                        {step.replace('_', ' ')}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-100">
                        <h4 className="text-xs font-bold text-gray-500 mb-2">Approvals</h4>
                        <div className="flex flex-col gap-2">
                            {['PH', 'SH', 'GH'].map(role => (
                                <div key={role} className="flex justify-between items-center text-xs">
                                    <span>{role}:</span>
                                    <span className={clsx(
                                        "font-medium",
                                        opportunity.approvals?.[role as 'PH' | 'SH' | 'GH'] === 'APPROVED' ? "text-emerald-600" :
                                            opportunity.approvals?.[role as 'PH' | 'SH' | 'GH'] === 'REJECTED' ? "text-rose-600" : "text-gray-400"
                                    )}>
                                        {opportunity.approvals?.[role as 'PH' | 'SH' | 'GH'] || 'Pending'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-xl w-[400px] p-6">
                        <div className="flex items-center gap-2 mb-4 text-rose-600">
                            <AlertTriangle className="w-5 h-5" />
                            <h3 className="text-lg font-bold">Reject Opportunity</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">Please provide a reason for rejection.</p>
                        <textarea
                            className="w-full border rounded p-2 text-sm mb-4 h-24"
                            placeholder="Reason..."
                            value={rejectionReason}
                            onChange={e => setRejectionReason(e.target.value)}
                        />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowRejectModal(false)} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                            <button
                                onClick={() => handleManagerDecision('REJECTED')}
                                className="px-3 py-1.5 text-sm bg-rose-600 text-white rounded hover:bg-rose-700 disabled:opacity-50"
                                disabled={!rejectionReason.trim()}
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
