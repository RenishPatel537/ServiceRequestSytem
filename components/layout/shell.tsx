"use client";

import React, { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface ShellProps {
    children: React.ReactNode;
    userRole: string;
    username: string;
}

export function Shell({ children, userRole, username }: ShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar
                userRole={userRole}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="flex flex-col flex-1 min-w-0">
                <Header
                    username={username}
                    role={userRole}
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <div className="mx-auto max-w-7xl animate-in fade-in zoom-in duration-300">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
