import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';

export const Layout: React.FC = () => {
    return (
        <div className="min-h-screen bg-[var(--color-app-bg)]">
            <TopBar />
            <div className="flex pt-14">
                <Sidebar />
                <main className="flex-1 ml-64 p-6 overflow-y-auto min-h-[calc(100vh-3.5rem)]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
