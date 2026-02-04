import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Opportunity, WorkflowStatus } from '../data';
import type { OpportunityWithStatus } from '../context/RoleContext';
import { ExternalLink, UserPlus, CheckCircle, Filter, Search, X } from 'lucide-react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

interface OpportunityTableProps {
    opportunities: (Opportunity | OpportunityWithStatus)[];
    onAssign?: (opp: Opportunity) => void;
    onReview?: (opp: Opportunity) => void;
    showActions?: boolean;
    type?: 'unassigned' | 'assigned' | 'review' | 'completed' | 'worker-active' | 'general';
}

const StatusBadge: React.FC<{ status: WorkflowStatus | undefined }> = ({ status }) => {
    if (!status) return null;

    const styles: Record<string, string> = {
        NEW: 'bg-blue-100 text-blue-800',
        ASSIGNED: 'bg-indigo-100 text-indigo-800',
        IN_PROGRESS: 'bg-purple-100 text-purple-800',
        SUBMITTED: 'bg-amber-100 text-amber-800',
        IN_REVIEW: 'bg-amber-100 text-amber-800',
        APPROVED: 'bg-emerald-100 text-emerald-800',
        REJECTED: 'bg-rose-100 text-rose-800',
    };

    return (
        <span className={clsx("px-2.5 py-0.5 rounded-full text-xs font-medium border border-transparent shadow-sm", styles[status] || 'bg-gray-100 text-gray-800')}>
            {status.replace('_', ' ')}
        </span>
    );
};

// --- Filter Components ---

type FilterType = 'text' | 'number-range' | 'date-range' | 'multi-select';

interface FilterState {
    name: string;
    customer: string;
    valueMin: string;
    valueMax: string;
    dateStart: string;
    dateEnd: string;
    status: string[];
    assigned: string[];
}

const initialFilters: FilterState = {
    name: '',
    customer: '',
    valueMin: '',
    valueMax: '',
    dateStart: '',
    dateEnd: '',
    status: [],
    assigned: []
};

interface FilterPopoverProps {
    type: FilterType;
    active: boolean;
    onClose: () => void;
    value: any;
    onChange: (val: any) => void;
    options?: string[]; // For multi-select
}

const FilterPopover: React.FC<FilterPopoverProps> = ({ type, active, onClose, value, onChange, options = [] }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onClose();
            }
        };
        if (active) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [active, onClose]);

    if (!active) return null;

    return (
        <div ref={ref} className="absolute z-50 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-3 w-64 animate-in fade-in zoom-in duration-200 text-left cursor-auto">
            {type === 'text' && (
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        autoFocus
                    />
                </div>
            )}
            {type === 'number-range' && (
                <div className="space-y-2">
                    <div className="flex gap-2 items-center">
                        <span className="text-xs text-gray-500 w-8">Min:</span>
                        <input
                            type="number"
                            placeholder="0"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            value={value.min}
                            onChange={(e) => onChange({ ...value, min: e.target.value })}
                        />
                    </div>
                    <div className="flex gap-2 items-center">
                        <span className="text-xs text-gray-500 w-8">Max:</span>
                        <input
                            type="number"
                            placeholder="Any"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            value={value.max}
                            onChange={(e) => onChange({ ...value, max: e.target.value })}
                        />
                    </div>
                </div>
            )}
            {type === 'date-range' && (
                <div className="space-y-2">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">From:</label>
                        <input
                            type="date"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            value={value.start}
                            onChange={(e) => onChange({ ...value, start: e.target.value })}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">To:</label>
                        <input
                            type="date"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            value={value.end}
                            onChange={(e) => onChange({ ...value, end: e.target.value })}
                        />
                    </div>
                </div>
            )}
            {type === 'multi-select' && (
                <div className="max-h-48 overflow-y-auto space-y-1">
                    {options.length === 0 && <p className="text-xs text-gray-500 italic">No options available</p>}
                    {options.map((opt) => (
                        <label key={opt} className="flex items-center gap-2 px-1 py-1 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                                type="checkbox"
                                checked={(value as string[]).includes(opt)}
                                onChange={(e) => {
                                    const current = value as string[];
                                    if (e.target.checked) onChange([...current, opt]);
                                    else onChange(current.filter(v => v !== opt));
                                }}
                                className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 truncate">{opt}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

const HeaderCell: React.FC<{
    label: string,
    activeFilter: boolean,
    onOpenFilter: () => void,
    filterComponent: React.ReactNode
}> = ({ label, activeFilter, onOpenFilter, filterComponent }) => (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative group">
        <div className="flex items-center gap-2 cursor-pointer hover:text-gray-700" onClick={(e) => { e.preventDefault(); onOpenFilter(); }}>
            {label}
            <Filter className={clsx("w-4 h-4 transition-colors", activeFilter ? "text-blue-600 fill-blue-600" : "text-gray-400 hover:text-blue-500")} />
        </div>
        {filterComponent}
    </th>
);

export const OpportunityTable: React.FC<OpportunityTableProps> = ({ opportunities, onAssign, type = 'general' }) => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState<FilterState>(initialFilters);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    // Extract unique values for multi-selects
    const statusOptions = useMemo(() => Array.from(new Set(opportunities.map(o => (o as OpportunityWithStatus).status || 'NEW'))).sort(), [opportunities]);

    const assignedOptions = useMemo(() => {
        const names = new Set<string>();
        opportunities.forEach(o => {
            if (o.assignedSA) names.add(o.assignedSA);
            if (o.assignedSP) names.add(o.assignedSP);
            if (o.assignedPH) names.add(o.assignedPH);
            if (o.assignedSH) names.add(o.assignedSH);
        });
        return Array.from(names).sort();
    }, [opportunities]);

    const filteredOpps = useMemo(() => {
        return opportunities.filter(opp => {
            const status = (opp as OpportunityWithStatus).status || 'NEW';

            // Text Filters
            if (filters.name) {
                const term = filters.name.toLowerCase();
                const matchName = opp.name.toLowerCase().includes(term);
                const matchId = opp.id.toLowerCase().includes(term);
                if (!matchName && !matchId) return false;
            }
            if (filters.customer && !opp.customer.toLowerCase().includes(filters.customer.toLowerCase())) return false;

            // Value Range
            if (filters.valueMin && opp.dealValue < Number(filters.valueMin)) return false;
            if (filters.valueMax && opp.dealValue > Number(filters.valueMax)) return false;

            // Date Range
            if (filters.dateStart && opp.closeDate < filters.dateStart) return false;
            if (filters.dateEnd && opp.closeDate > filters.dateEnd) return false;

            // Multi-select
            if (filters.status.length > 0 && !filters.status.includes(status)) return false;

            // Assignee (Check if EITHER SA or SP or PH or SH matches ANY of the selected)
            if (filters.assigned.length > 0) {
                const matchesSA = opp.assignedSA && filters.assigned.includes(opp.assignedSA);
                const matchesSP = opp.assignedSP && filters.assigned.includes(opp.assignedSP);
                const matchesPH = opp.assignedPH && filters.assigned.includes(opp.assignedPH);
                const matchesSH = opp.assignedSH && filters.assigned.includes(opp.assignedSH);
                if (!matchesSA && !matchesSP && !matchesPH && !matchesSH) return false;
            }

            return true;
        });
    }, [opportunities, filters]);

    const clearFilters = () => setFilters(initialFilters);
    const hasActiveFilters = Object.values(filters).some(v => Array.isArray(v) ? v.length > 0 : v !== '');

    return (
        <div className="flex flex-col gap-2">
            {hasActiveFilters && (
                <div className="flex justify-end">
                    <button
                        onClick={clearFilters}
                        className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 bg-red-50 px-2 py-1 rounded"
                    >
                        <X className="w-3 h-3" /> Clear Filters
                    </button>
                </div>
            )}

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-visible">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <HeaderCell
                                label="Opportunity"
                                activeFilter={!!filters.name}
                                onOpenFilter={() => setActiveFilter(activeFilter === 'name' ? null : 'name')}
                                filterComponent={
                                    <FilterPopover
                                        type="text"
                                        active={activeFilter === 'name'}
                                        onClose={() => setActiveFilter(null)}
                                        value={filters.name}
                                        onChange={(val) => setFilters(prev => ({ ...prev, name: val }))}
                                    />
                                }
                            />
                            <HeaderCell
                                label="Customer"
                                activeFilter={!!filters.customer}
                                onOpenFilter={() => setActiveFilter(activeFilter === 'customer' ? null : 'customer')}
                                filterComponent={
                                    <FilterPopover
                                        type="text"
                                        active={activeFilter === 'customer'}
                                        onClose={() => setActiveFilter(null)}
                                        value={filters.customer}
                                        onChange={(val) => setFilters(prev => ({ ...prev, customer: val }))}
                                    />
                                }
                            />
                            <HeaderCell
                                label="Value"
                                activeFilter={!!filters.valueMin || !!filters.valueMax}
                                onOpenFilter={() => setActiveFilter(activeFilter === 'value' ? null : 'value')}
                                filterComponent={
                                    <FilterPopover
                                        type="number-range"
                                        active={activeFilter === 'value'}
                                        onClose={() => setActiveFilter(null)}
                                        value={{ min: filters.valueMin, max: filters.valueMax }}
                                        onChange={(val) => setFilters(prev => ({ ...prev, valueMin: val.min, valueMax: val.max }))}
                                    />
                                }
                            />
                            <HeaderCell
                                label="Close Date"
                                activeFilter={!!filters.dateStart || !!filters.dateEnd}
                                onOpenFilter={() => setActiveFilter(activeFilter === 'date' ? null : 'date')}
                                filterComponent={
                                    <FilterPopover
                                        type="date-range"
                                        active={activeFilter === 'date'}
                                        onClose={() => setActiveFilter(null)}
                                        value={{ start: filters.dateStart, end: filters.dateEnd }}
                                        onChange={(val) => setFilters(prev => ({ ...prev, dateStart: val.start, dateEnd: val.end }))}
                                    />
                                }
                            />
                            <HeaderCell
                                label="Status"
                                activeFilter={filters.status.length > 0}
                                onOpenFilter={() => setActiveFilter(activeFilter === 'status' ? null : 'status')}
                                filterComponent={
                                    <FilterPopover
                                        type="multi-select"
                                        active={activeFilter === 'status'}
                                        onClose={() => setActiveFilter(null)}
                                        value={filters.status}
                                        onChange={(val) => setFilters(prev => ({ ...prev, status: val }))}
                                        options={statusOptions}
                                    />
                                }
                            />

                            {(type === 'assigned' || type === 'review' || type === 'completed' || type === 'general') && (
                                <HeaderCell
                                    label="Assigned To"
                                    activeFilter={filters.assigned.length > 0}
                                    onOpenFilter={() => setActiveFilter(activeFilter === 'assigned' ? null : 'assigned')}
                                    filterComponent={
                                        <FilterPopover
                                            type="multi-select"
                                            active={activeFilter === 'assigned'}
                                            onClose={() => setActiveFilter(null)}
                                            value={filters.assigned}
                                            onChange={(val) => setFilters(prev => ({ ...prev, assigned: val }))}
                                            options={assignedOptions}
                                        />
                                    }
                                />
                            )}
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredOpps.map((opp) => {
                            // Handle both raw Opportunity and OpportunityWithStatus
                            const status = (opp as OpportunityWithStatus).status || 'NEW';

                            return (
                                <tr key={opp.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-900">{opp.name}</span>
                                            <span className="text-xs text-gray-500">{opp.id}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{opp.customer}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(opp.dealValue)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{opp.closeDate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={status} />
                                    </td>
                                    {(type === 'assigned' || type === 'review' || type === 'completed' || type === 'general' || type === 'worker-active') && (
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">
                                            <div className="flex flex-col gap-1">
                                                {opp.assignedRoles.includes('SA') && <span>SA: {opp.assignedSA || 'Assigned'}</span>}
                                                {opp.assignedRoles.includes('SP') && <span>SP: {opp.assignedSP || 'Assigned'}</span>}
                                            </div>
                                        </td>
                                    )}
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {type === 'unassigned' && (
                                            <button
                                                onClick={() => onAssign?.(opp)}
                                                className="text-[var(--color-primary)] hover:text-blue-800 flex items-center justify-end gap-1 ml-auto"
                                            >
                                                <UserPlus className="w-4 h-4" /> Assign
                                            </button>
                                        )}
                                        {(type === 'review' || type === 'completed' || type === 'assigned') && (
                                            <button
                                                onClick={() => navigate(`/score/${opp.id}`)}
                                                className="text-amber-600 hover:text-amber-800 flex items-center justify-end gap-1 ml-auto"
                                            >
                                                <CheckCircle className="w-4 h-4" /> {type === 'completed' ? 'View' : 'Review'}
                                            </button>
                                        )}
                                        {type === 'worker-active' && (
                                            <button
                                                onClick={() => navigate(`/score/${opp.id}`)}
                                                className="text-white bg-[var(--color-primary)] hover:bg-blue-700 px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center justify-end gap-1 ml-auto"
                                            >
                                                {status === 'IN_PROGRESS' ? 'Continue' : 'Start Assessment'}
                                            </button>
                                        )}
                                        {type === 'general' && (
                                            <button
                                                onClick={() => navigate(`/score/${opp.id}`)}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                        {filteredOpps.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                                    No opportunities matching filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
