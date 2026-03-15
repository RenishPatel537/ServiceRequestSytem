"use client";

import React from "react";
import { Icons } from "@/components/ui/icons";

interface DetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    data: Record<string, any>;
}

export function DetailModal({ isOpen, onClose, title, data }: DetailModalProps) {
    if (!isOpen) return null;

    // Helper to format keys/values
    const formatValue = (val: any) => {
        if (val === null || val === undefined) return "-";
        if (typeof val === "boolean") return val ? "Yes" : "No";
        if (val instanceof Date || (typeof val === "string" && !isNaN(Date.parse(val)) && val.includes("T"))) {
            return new Date(val).toLocaleString();
        }
        if (typeof val === "object") return JSON.stringify(val);
        return String(val);
    };

    const formatKey = (key: string) => {
        return key
            .replace(/([A-Z])/g, " $1")
            .replace(/_/g, " ")
            .replace(/^\w/, (c) => c.toUpperCase());
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-900">{title} Details</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <Icons.X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {Object.entries(data).map(([key, value]) => {
                            // Skip relations and complex objects for simple view
                            if (typeof value === "object" && value !== null && !(value instanceof Date)) return null;

                            return (
                                <div key={key} className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                                        {formatKey(key)}
                                    </p>
                                    <p className="text-sm font-bold text-gray-900 break-words">
                                        {formatValue(value)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
