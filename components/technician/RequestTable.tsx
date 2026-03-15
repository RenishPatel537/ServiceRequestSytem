"use client";

import React from "react";
import Link from "next/link";

interface Request {
    servicerequestid: number;
    servicerequestno: string;
    servicerequesttitle: string;
    prioritylevel: string;
    servicerequeststatus: {
        servicerequeststatusname: string;
    };
    createdat: string;
}

interface RequestTableProps {
    requests: Request[];
    emptyMessage?: string;
}

export function RequestTable({ requests, emptyMessage = "No requests found." }: RequestTableProps) {
    if (requests.length === 0) {
        return (
            <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-500">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">
                                Req No
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">
                                Title
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">
                                Priority
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">
                                Status
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">
                                Date
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {requests.map((req) => (
                            <tr key={req.servicerequestid} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                    #{req.servicerequestno}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                                    {req.servicerequesttitle}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${req.prioritylevel === "CRITICAL"
                                        ? "bg-red-100 text-red-700"
                                        : req.prioritylevel === "HIGH"
                                            ? "bg-amber-100 text-amber-700"
                                            : "bg-gray-100 text-gray-600"
                                        }`}>
                                        {req.prioritylevel || "MEDIUM"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-xs font-semibold text-gray-500">
                                        {req.servicerequeststatus?.servicerequeststatusname || "UNKNOWN"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(req.createdat).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <Link
                                        href={`/technician/requests/${req.servicerequestid}`}
                                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-bold rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300 transition-all active:scale-95"
                                    >
                                        VIEW
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
