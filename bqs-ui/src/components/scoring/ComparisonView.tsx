import React from 'react';
import type { SectionScore } from '../../data';

interface ComparisonViewProps {
    saScore?: SectionScore;
    spScore?: SectionScore;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ saScore, spScore }) => {
    if (!saScore && !spScore) return <div className="text-gray-400 italic">No data available for this section.</div>;

    const renderCard = (role: 'SA' | 'SP', data?: SectionScore) => (
        <div className={`flex-1 border rounded-lg p-4 ${data ? 'bg-white border-gray-200' : 'bg-gray-50 border-dashed border-gray-300'}`}>
            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                <span className="font-bold text-gray-700">{role === 'SA' ? 'Solution Architect' : 'Sales Person'}</span>
                {data ? (
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-white text-sm
            ${data.score >= 4 ? 'bg-emerald-500' : data.score >= 3 ? 'bg-amber-500' : 'bg-rose-500'}`}>
                        {data.score}
                    </span>
                ) : (
                    <span className="text-xs text-gray-400">Not submitted</span>
                )}
            </div>

            {data ? (
                <div className="space-y-3">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-tighter mb-1">Citations</p>
                        <div className="flex flex-wrap gap-1">
                            {data.reasons.length > 0 ? (
                                data.reasons.map((r, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full border border-gray-200">
                                        {r}
                                    </span>
                                ))
                            ) : <span className="text-xs text-gray-400 italic">No reasons selected</span>}
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-tighter mb-1">Notes</p>
                        <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded leading-relaxed">
                            {data.notes || <span className="text-gray-400 italic">No notes provided.</span>}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="h-24 flex items-center justify-center text-sm text-gray-400">
                    Pending submission
                </div>
            )}
        </div>
    );

    return (
        <div className="flex gap-4">
            {renderCard('SA', saScore)}
            {renderCard('SP', spScore)}
        </div>
    );
};
