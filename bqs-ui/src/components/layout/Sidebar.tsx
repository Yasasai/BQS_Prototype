import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, List, FileCheck, History, Settings } from 'lucide-react';
import { useBQS } from '../../context/RoleContext';

export const Sidebar: React.FC = () => {
    const { currentRole } = useBQS();

    const isManager = ['PH', 'SH', 'GH'].includes(currentRole);

    const navItemClass = ({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${isActive
            ? 'bg-blue-50 text-[var(--color-primary)]'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`;

    return (
        <aside className="w-64 bg-white border-r border-gray-200 h-[calc(100vh-3.5rem)] flex flex-col fixed left-0 top-14">
            <nav className="flex-1 p-4 space-y-1">
                <NavLink to="/dashboard" className={navItemClass}>
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                </NavLink>

                <NavLink to="/opportunities" className={navItemClass}>
                    <List className="w-5 h-5" />
                    All Opportunities
                </NavLink>

                {isManager && (
                    <NavLink to="/reviews" className={navItemClass}>
                        <FileCheck className="w-5 h-5" />
                        Reviews
                    </NavLink>
                )}

                {!isManager && (
                    <NavLink to="/history" className={navItemClass}>
                        <History className="w-5 h-5" />
                        History
                    </NavLink>
                )}
            </nav>

            <div className="p-4 border-t border-gray-200">
                <NavLink to="/settings" className={navItemClass}>
                    <Settings className="w-5 h-5" />
                    Settings
                </NavLink>
            </div>
        </aside>
    );
};
