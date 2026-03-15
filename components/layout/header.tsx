"use client";

import React from "react";
import { Icons } from "@/components/ui/icons";
import { useRouter } from "next/navigation";

interface HeaderProps {
    username?: string;
    role?: string;
    onMenuClick: () => void;
}

export function Header({ username, role, onMenuClick }: HeaderProps) {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
            router.refresh();
        } catch (e) {
            console.error("Logout failed", e);
        }
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm lg:px-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                    aria-label="Toggle Menu"
                >
                    <Icons.Menu className="h-6 w-6" />
                </button>
                {/* On desktop, we might want breadcrumbs here later */}
                <h1 className="text-lg font-semibold text-gray-800 lg:hidden">
                    ServiceReq
                </h1>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex flex-col items-end text-sm">
                    <span className="font-semibold text-gray-900">{username || "User"}</span>
                    <span className="text-xs text-gray-500">{role || "Role"}</span>
                </div>
                <div className="h-8 w-[1px] bg-gray-200 mx-1 hidden sm:block"></div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    title="Logout"
                >
                    <Icons.LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                </button>
            </div>
        </header>
    );
}
