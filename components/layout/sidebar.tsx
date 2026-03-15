"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "@/components/ui/icons";

interface SidebarProps {
    userRole: string;
    isOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar({ userRole, isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();

    // Define navigation items based on role
    // Common paths can be defined or filtering applied
    const getNavItems = (role: string) => {
        switch (role?.toUpperCase()) {
            case "ADMIN":
                return [
                    { href: "/admin/dashboard", label: "Dashboard", icon: Icons.Dashboard },
                    { href: "/admin/departments", label: "Departments", icon: Icons.List },
                    { href: "/admin/assignments/department-owners", label: "Department Owners", icon: Icons.Users },
                    {
                        href: "/admin/assignments/technicians",
                        label: "Request Type Technicians",
                        icon: Icons.Users,
                    },
                    { href: "/admin/service-status", label: "Statuses", icon: Icons.List },
                    { href: "/admin/service-type", label: "Service Types", icon: Icons.List },
                    {
                        href: "/admin/service-request-type",
                        label: "Request Types",
                        icon: Icons.List,
                    },
                    { href: "/admin/staff", label: "Staff", icon: Icons.Users },
                    { href: "/admin/users", label: "Users", icon: Icons.Users },
                    { href: "/admin/user-staff", label: "User-Staff Mapping", icon: Icons.Users },
                    { href: "/admin/roles", label: "Roles", icon: Icons.Settings },
                ];
            case "REQUESTOR":
                return [
                    { href: "/requestor/dashboard", label: "Dashboard", icon: Icons.Dashboard },
                    { href: "/requestor/requests", label: "My Requests", icon: Icons.FileText },
                    { href: "/requestor/requests/create", label: "Create Request", icon: Icons.Plus },
                ];
            case "TECHNICIAN":
                return [
                    { href: "/technician/dashboard", label: "Dashboard", icon: Icons.Dashboard },
                    { href: "/technician/assigned-requests", label: "Assigned Requests", icon: Icons.FileText },
                ];
            case "HOD":
                return [
                    { href: "/hod/dashboard", label: "Dashboard", icon: Icons.Dashboard },
                    { href: "/hod/approvals", label: "Approvals", icon: Icons.CheckCircle },
                    { href: "/hod/requests/all", label: "All Requests", icon: Icons.FileText },
                    { href: "/hod/requests/escalated", label: "Escalated", icon: Icons.AlertCircle },
                    { href: "/hod/team", label: "Team", icon: Icons.Users },
                    { href: "/hod/reports", label: "Reports", icon: Icons.BarChart },
                ];
            default:
                return [];
        }
    };

    const navItems = getNavItems(userRole);

    const isActive = (href: string) => {
        return pathname === href || pathname.startsWith(`${href}/`);
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:bloct ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex h-16 items-center justify-center border-b border-gray-200 px-6">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
                        <Icons.Logo className="h-6 w-6 text-blue-600" />
                        <span>ServiceReq</span>
                    </Link>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                    {navItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${active
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                    }`}
                                onClick={onClose} // Auto-close on mobile nav
                            >
                                <item.icon className={`h-5 w-5 ${active ? "text-blue-700" : "text-gray-400"}`} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t border-gray-200 p-4">
                    {/* Footer info or extra links could go here */}
                    <p className="text-xs text-center text-gray-400">© 2026 Admin System</p>
                </div>
            </aside>
        </>
    );
}
