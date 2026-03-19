"use client";

import React, { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { Icons } from "@/components/ui/icons";

interface DashboardData {
    summary: {
        total: number;
        PENDING: number;
        IN_PROGRESS: number;
        RESOLVED: number;
        REJECTED: number;
        CLOSED: number;
    };
    departmentStats: Array<{ name: string; total: number }>;
    statusStats: Array<{ status: string; count: number }>;
}

const COLORS = {
    total: "#A855F7",       // Purple
    PENDING: "#FACC15",     // Yellow
    IN_PROGRESS: "#3B82F6",  // Blue
    RESOLVED: "#22C55E",    // Green
    REJECTED: "#EF4444",    // Red
    CLOSED: "#6B7280",      // Gray
};

const PIE_COLORS = ["#A855F7", "#3B82F6", "#22C55E", "#FACC15", "#EF4444", "#8B5CF6", "#EC4899", "#F97316"];

export default function AdminDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch("/api/admin/dashboard");
                if (!response.ok) {
                    throw new Error("Failed to fetch dashboard data");
                }
                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Icons.Spinner className="h-8 w-8 animate-spin text-purple-600 mb-4" />
                <p className="text-gray-500 font-medium">Loading Dashboard...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-red-200 rounded-xl bg-red-50 p-6">
                <Icons.AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-semibold text-red-700">Error Loading Dashboard</h3>
                <p className="text-red-600 mt-2 text-center max-w-md">{error || "Data not available"}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                    Try Again
                </button>
            </div>
        );
    }

    const summaryCards = [
        { label: "Total Requests", value: data.summary.total, color: COLORS.total, icon: Icons.Dashboard },
        { label: "Pending", value: data.summary.PENDING, color: COLORS.PENDING, icon: Icons.Clock },
        { label: "In Progress", value: data.summary.IN_PROGRESS, color: COLORS.IN_PROGRESS, icon: Icons.Play },
        { label: "Resolved", value: data.summary.RESOLVED, color: COLORS.RESOLVED, icon: Icons.CheckCircle },
        { label: "Rejected", value: data.summary.REJECTED, color: COLORS.REJECTED, icon: Icons.XCircle },
        { label: "Closed", value: data.summary.CLOSED, color: COLORS.CLOSED, icon: Icons.FileText },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border">
                    Real-time Statistics
                </p>
            </div>

            {/* Section 1: Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {summaryCards.map((card, index) => (
                    <div 
                        key={index}
                        className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div 
                                className="p-2 rounded-lg"
                                style={{ backgroundColor: `${card.color}20` }}
                            >
                                <card.icon className="h-5 w-5" style={{ color: card.color }} />
                            </div>
                        </div>
                        <div>
                            <p className="text-3xl font-bold" style={{ color: card.color }}>
                                {card.value}
                            </p>
                            <p className="text-sm font-medium text-gray-500 mt-1">{card.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Section 2: Status Bar Chart */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Request Status Distribution</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.statusStats}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis 
                                    dataKey="status" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                />
                                <Tooltip 
                                    cursor={{ fill: '#f9fafb' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar 
                                    dataKey="count" 
                                    fill="#3B82F6" 
                                    radius={[4, 4, 0, 0]}
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Section 3: Department Pie Chart */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Requests by Department</h3>
                    <div className="flex flex-col md:flex-row items-center h-[300px]">
                        <div className="h-full w-full md:w-1/2">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.departmentStats}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="total"
                                    >
                                        {data.departmentStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-full md:w-1/2 mt-4 md:mt-0 overflow-y-auto max-h-full px-4 text-center md:text-left">
                            <div className="space-y-3">
                                {data.departmentStats.map((dept, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <div 
                                                className="w-3 h-3 rounded-full" 
                                                style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} 
                                            />
                                            <span className="text-sm font-medium text-gray-600 truncate max-w-[120px]">
                                                {dept.name}
                                            </span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-800">{dept.total}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 4: Department Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Department Performance</h3>
                    <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded">
                        {data.departmentStats.length} Departments
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Department Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Total Requests</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {data.departmentStats.map((dept, index) => (
                                <tr key={index} className="hover:bg-gray-50/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-gray-700">{dept.name}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                                            {dept.total}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}


