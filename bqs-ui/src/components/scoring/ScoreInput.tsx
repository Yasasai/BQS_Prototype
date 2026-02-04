import React from 'react';
import type { SectionScore } from '../../data';
import { ReasonSelector } from './ReasonSelector';

interface ScoreInputProps {
    scoreData: SectionScore;
    onChange: (data: SectionScore) => void;
    readOnly?: boolean;
}

export const ScoreInput: React.FC<ScoreInputProps> = ({ scoreData, onChange, readOnly }) => {

    const handleScoreChange = (val: number) => {
        if (readOnly) return;
        onChange({ ...scoreData, score: val as 1 | 2 | 3 | 4 | 5 });
    };

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Score (1-5)</label>
                <div className="flex gap-4">
                    {[1, 2, 3, 4, 5].map((val) => (
                        <button
                            key={val}
                            disabled={readOnly}
                            onClick={() => handleScoreChange(val)}
                            className={`w-12 h-12 rounded-lg text-lg font-bold transition-all border-2
                ${scoreData.score === val
                                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-md scale-110'
                                    : 'border-gray-200 bg-white text-gray-500 hover:border-blue-300'
                                } ${readOnly ? 'cursor-default' : ''}`}
                        >
                            {val}
                        </button>
                    ))}
                </div>
                <div className="flex justify-between w-[280px] mt-1 text-xs text-gray-400 px-1">
                    <span>Low</span>
                    <span>High</span>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Justification (Select all that apply)</label>
                <ReasonSelector
                    selected={scoreData.reasons}
                    onChange={(reasons) => onChange({ ...scoreData, reasons })}
                    disabled={readOnly}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Notes</label>
                <textarea
                    value={scoreData.notes}
                    onChange={(e) => onChange({ ...scoreData, notes: e.target.value })}
                    disabled={readOnly}
                    rows={4}
                    className="w-full text-sm p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="Add specific details supporting your score..."
                />
            </div>
        </div>
    );
};
