"use client";

import { useEffect, useState } from "react";

interface DashboardData {
    pending: number;
    inProgress: number;
    resolved: number;
    rejected: number;
    closed: number;
    // The API returns total, but we will calculate it on frontend as requested
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/hod/dashboard")
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to fetch dashboard data");
                }
                return res.json();
            })
            .then((data) => {
                setData(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <p className="text-gray-500 animate-pulse">Loading dashboard statistics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg bg-red-50 p-4 border border-red-200 text-red-700">
                <p>Error loading dashboard: {error}</p>
            </div>
        );
    }

    // Calculate total on frontend as requested
    const totalRequests =
        (data?.pending || 0) +
        (data?.inProgress || 0) +
        (data?.resolved || 0) +
        (data?.rejected || 0) +
        (data?.closed || 0);

    const stats = [
        {
            label: "Pending",
            value: data?.pending || 0,
            className: "bg-yellow-50 border-yellow-200 text-yellow-800",
        },
        {
            label: "In Progress",
            value: data?.inProgress || 0,
            className: "bg-blue-50 border-blue-200 text-blue-800",
        },
        {
            label: "Resolved",
            value: data?.resolved || 0,
            className: "bg-green-50 border-green-200 text-green-800",
        },
        {
            label: "Rejected",
            value: data?.rejected || 0,
            className: "bg-red-50 border-red-200 text-red-800",
        },
        {
            label: "Closed",
            value: data?.closed || 0,
            className: "bg-gray-50 border-gray-200 text-gray-800",
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Summary of all service requests in your department.
                </p>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                {/* Total Card - Prominent */}
                <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200 sm:col-span-2 lg:col-span-1">
                    <div className="p-5">
                        <div className="mb-1 text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Total Requests
                        </div>
                        <div className="text-3xl font-bold text-gray-900">
                            {totalRequests}
                        </div>
                    </div>
                </div>

                {/* Status Cards */}
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className={`overflow-hidden rounded-lg border shadow-sm p-5 ${stat.className}`}
                    >
                        <div className="mb-1 text-xs font-semibold uppercase tracking-wider opacity-80">
                            {stat.label}
                        </div>
                        <div className="text-2xl font-bold">{stat.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
