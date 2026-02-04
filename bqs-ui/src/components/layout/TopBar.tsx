import React from 'react';
import { Search, Bell, UserCircle } from 'lucide-react';
import { useBQS } from '../../context/RoleContext';
import type { Role } from '../../data';

export const TopBar: React.FC = () => {
    const { currentRole, setCurrentRole } = useBQS();

    const ROLES: Role[] = ['SA', 'SP', 'PH', 'SH', 'GH'];

    return (
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-10 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-[var(--color-primary)] rounded flex items-center justify-center text-white font-bold">
                    O
                </div>
                <h1 className="text-lg font-semibold text-gray-800 tracking-tight">Bid Qualification System</h1>
            </div>

            <div className="flex-1 max-w-xl mx-8 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Search opportunities, customers, or IDs..."
                    className="w-full pl-10 pr-4 py-1.5 bg-gray-100 border-none rounded text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
            </div>

            <div className="flex items-center gap-4">
                <button className="text-gray-500 hover:text-gray-700 relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                    <div className="text-right">
                        <p className="text-xs font-semibold text-gray-700">Current Role</p>
                        <select
                            value={currentRole}
                            onChange={(e) => setCurrentRole(e.target.value as Role)}
                            className="text-sm font-bold text-[var(--color-primary)] bg-transparent border-none cursor-pointer focus:ring-0 p-0 text-right w-full"
                        >
                            {ROLES.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>
                    <UserCircle className="w-8 h-8 text-gray-400" />
                </div>
            </div>
        </header>
    );
};
