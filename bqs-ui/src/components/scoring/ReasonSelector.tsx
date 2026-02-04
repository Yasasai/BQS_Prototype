import React from 'react';
import { Check } from 'lucide-react';

const COMMON_REASONS = [
    "Strong Technical Fit", "High Profit Margin", "Existing Client Relationship",
    "Resource Availability", "Strategic Priority", "Competitive Pricing",
    "Clear Scope", "Legal Compliance", "Low Risk", "Executive Sponsorship",
    "Budget Approved", "Unrealistic Timeline", "Lack of Expertise",
    "High Competition", "Undefined Scope"
];

interface ReasonSelectorProps {
    selected: string[];
    onChange: (reasons: string[]) => void;
    disabled?: boolean;
}

export const ReasonSelector: React.FC<ReasonSelectorProps> = ({ selected, onChange, disabled }) => {
    const toggleReason = (reason: string) => {
        if (disabled) return;
        if (selected.includes(reason)) {
            onChange(selected.filter(r => r !== reason));
        } else {
            onChange([...selected, reason]);
        }
    };

    return (
        <div className="flex flex-wrap gap-2">
            {COMMON_REASONS.map(reason => {
                const isSelected = selected.includes(reason);
                return (
                    <button
                        key={reason}
                        onClick={() => toggleReason(reason)}
                        disabled={disabled}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors flex items-center gap-1
              ${isSelected
                                ? 'bg-blue-100 border-blue-200 text-blue-700'
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        {isSelected && <Check className="w-3 h-3" />}
                        {reason}
                    </button>
                );
            })}
        </div>
    );
};
