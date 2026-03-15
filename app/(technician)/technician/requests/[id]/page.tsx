"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface RequestDetail {
    servicerequestid: number;
    servicerequestno: string;
    servicerequesttitle: string;
    servicerequestdescription: string;
    prioritylevel: string;
    servicerequeststatus: {
        servicerequeststatusname: string;
    };
    createdat: string;
}

export default function RequestDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;

    const [request, setRequest] = useState<RequestDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const fetchRequest = () => {
        setLoading(true);
        fetch(`/api/technician/request/${id}`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch request details");
                return res.json();
            })
            .then((data) => {
                setRequest(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        if (id) fetchRequest();
    }, [id]);

    const handleResolve = async () => {
        if (!id || actionLoading) return;

        setActionLoading(true);
        setSuccessMsg(null);
        setError(null);

        try {
            const res = await fetch(`/api/technician/request/${id}/resolve`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to resolve request");
            }

            setSuccessMsg("Request successfully marked as resolved!");
            fetchRequest(); // Refresh data
        } catch (err: any) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500 font-bold text-sm tracking-widest flex items-center gap-3">
                    <svg className="animate-spin h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    LOADING DETAILS...
                </div>
            </div>
        );
    }

    if (error && !request) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 font-medium">
                {error}
            </div>
        );
    }

    if (!request) return null;

    const isCritical = request.prioritylevel === "CRITICAL";
    const isInProgress = request.servicerequeststatus.servicerequeststatusname === "IN_PROGRESS";

    return (
        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Request Details</h2>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">#{request.servicerequestno}</p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                >
                    &larr; GO BACK
                </button>
            </div>

            {successMsg && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 font-bold text-sm flex items-center gap-2">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {successMsg}
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 font-bold text-sm flex items-center gap-2">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </div>
            )}

            {/* Info Card */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{request.servicerequesttitle}</h3>
                        <p className="text-gray-500 mt-2 leading-relaxed text-sm">
                            {request.servicerequestdescription}
                        </p>
                    </div>
                    <span className={`flex-shrink-0 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isInProgress ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                        }`}>
                        {request.servicerequeststatus.servicerequeststatusname}
                    </span>
                </div>
                <div className="p-8 bg-gray-50/50 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Priority Level</span>
                        <span className={`text-sm font-bold uppercase tracking-tight ${isCritical ? "text-red-600" : request.prioritylevel === "HIGH" ? "text-amber-600" : "text-gray-700"
                            }`}>
                            {request.prioritylevel || "MEDIUM"}
                        </span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Created At</span>
                        <span className="text-sm font-bold text-gray-700 tracking-tight">
                            {new Date(request.createdat).toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Action Panel */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Technician Actions</h4>

                <div className="flex flex-col gap-4">
                    {isInProgress ? (
                        <>
                            {isCritical ? (
                                <div className="flex flex-col gap-3">
                                    <button
                                        disabled
                                        className="w-full sm:w-fit px-8 py-3 bg-gray-100 text-gray-400 rounded-xl font-black text-xs uppercase tracking-widest cursor-not-allowed border border-gray-200"
                                    >
                                        RESOLVE
                                    </button>
                                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wide flex items-center gap-2 italic">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        Critical requests must be resolved by HOD
                                    </p>
                                </div>
                            ) : (
                                <button
                                    onClick={handleResolve}
                                    disabled={actionLoading}
                                    className="w-full sm:w-fit px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:shadow-lg disabled:opacity-50 disabled:scale-100 active:scale-95 flex items-center justify-center gap-3 shadow-blue-100 shadow-xl"
                                >
                                    {actionLoading ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            PROCESSING...
                                        </>
                                    ) : (
                                        "RESOLVE REQUEST"
                                    )}
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center italic">
                                No actions available for status: {request.servicerequeststatus.servicerequeststatusname}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
