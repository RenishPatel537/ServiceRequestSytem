"use client";

import Link from "next/link";
import React from "react";

// Define a flexible interface for the data
export interface RequestItem {
    id: number | string;
    requestNo: string;
    title: string;
    priority: string;
    status: string;
    assignedTo?: string | null; // Can be a name or null
    createdAt: string | Date;
}

interface RequestTableProps {
    title: string;
    data: RequestItem[];
    loading?: boolean; // Make loading optional with default false
}

const formatDate = (date: string | Date) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

export default function RequestTable({ title, data, loading = false }: RequestTableProps) {
    return (
        <div className="overflow-hidden rounded-lg bg-white shadow ring-1 ring-black ring-opacity-5">
            <div className="border-b border-gray-200 bg-white px-6 py-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Request No
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Title
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Priority
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Assigned To
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Created Date
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">View</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                                    Loading...
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                                    No requests found.
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                        {item.requestNo}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="truncate max-w-xs" title={item.title}>{item.title}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        <span
                                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${item.priority === "HIGH" || item.priority === "CRITICAL"
                                                    ? "bg-red-100 text-red-800"
                                                    : item.priority === "MEDIUM"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-green-100 text-green-800"
                                                }`}
                                        >
                                            {item.priority}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        <span
                                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                    item.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                                        item.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                                                            item.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                                'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {item.assignedTo || <span className="text-gray-400 italic">Unassigned</span>}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {formatDate(item.createdAt)}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                        <Link href={`/hod/requests/${item.id}`} className="text-indigo-600 hover:text-indigo-900">
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
