"use client";

import React, { useEffect, useState } from "react";
import { RequestTable } from "@/components/technician/RequestTable";

export default function ResolvedRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/technician/resolved")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch resolved requests");
                return res.json();
            })
            .then((data) => {
                setRequests(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Resolved</h2>
                <p className="text-sm text-gray-500 font-medium">Successfully completed service requests.</p>
            </div>

            {loading ? (
                <div className="bg-white border border-gray-100 rounded-xl p-20 text-center shadow-sm">
                    <div className="inline-flex items-center gap-2 text-gray-500 font-bold text-sm tracking-widest">
                        <svg className="animate-spin h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        FETCHING DATA
                    </div>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 font-medium flex items-center gap-3">
                    <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                </div>
            ) : (
                <RequestTable requests={requests} emptyMessage="No resolved requests found." />
            )}
        </div>
    );
}
