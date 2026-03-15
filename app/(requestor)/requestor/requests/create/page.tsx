"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/ui/icons";

interface RequestType {
    servicerequesttypeid: number;
    servicerequesttypename: string;
    description: string | null;
}

export default function CreateRequestPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [requestTypes, setRequestTypes] = useState<RequestType[]>([]);

    const [formData, setFormData] = useState({
        serviceRequestTypeId: "", // Renamed from requestTypeId
        title: "",
        description: "",
        attachment: null as File | null, // Added attachment
    });

    // Fetch All Request Types
    useEffect(() => {
        const fetchAllRequestTypes = async () => {
            try {
                // Fetch all request types without filtering by departmentId
                const res = await fetch("/api/requestor/request-types");
                if (res.ok) {
                    const data = await res.json();
                    setRequestTypes(data);
                }
            } catch (err) {
                console.error("Failed to fetch all request types", err);
            }
        };
        fetchAllRequestTypes();
    }, []); // No dependency on departmentId anymore

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFormData(prev => ({ ...prev, attachment: e.target.files![0] }));
        } else {
            setFormData(prev => ({ ...prev, attachment: null }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.serviceRequestTypeId || !formData.title || !formData.description) {
            setError("Please fill in all required fields.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let res: Response;

            if (formData.attachment) {
                // If attachment exists, send as FormData
                const data = new FormData();
                data.append("serviceRequestTypeId", formData.serviceRequestTypeId);
                data.append("title", formData.title);
                data.append("description", formData.description);
                data.append("attachment", formData.attachment);

                res = await fetch("/api/requestor/service-requests", {
                    method: "POST",
                    body: data,
                });
            } else {
                // Otherwise, send as JSON
                res = await fetch("/api/requestor/service-requests", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        serviceRequestTypeId: Number(formData.serviceRequestTypeId),
                        title: formData.title,
                        description: formData.description,
                    }),
                });
            }

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || data.error || "Failed to submit request");
            }

            router.push("/requestor/requests");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Create New Request</h1>
                <p className="text-gray-500 mt-1">Please fill in the details below to submit your service request.</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
                {/* Request Type Selection (was Department Selection) */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Service Request Type</label>
                    <select
                        name="serviceRequestTypeId" // Changed name
                        value={formData.serviceRequestTypeId}
                        onChange={handleChange} // Use general handleChange
                        className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                        required
                    >
                        <option value="">Select a request type...</option>
                        {requestTypes.map((t) => (
                            <option key={t.servicerequesttypeid} value={t.servicerequesttypeid}>{t.servicerequesttypename}</option>
                        ))}
                    </select>
                </div>

                {/* Title */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Request Title</label>
                    <input
                        type="text"
                        name="title" // Added name
                        placeholder="Enter a brief title for your request"
                        value={formData.title}
                        onChange={handleChange} // Use general handleChange
                        className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                        required
                    />
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Request Description</label>
                    <textarea
                        rows={5}
                        name="description" // Added name
                        placeholder="Describe your request in detail..."
                        value={formData.description}
                        onChange={handleChange} // Use general handleChange
                        className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                        required
                    />
                </div>

                {/* Attachment Section */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h3 className="text-blue-800 font-semibold mb-2 text-sm">Attachment (Optional)</h3>
                    <div className="flex items-center justify-center border-2 border-dashed border-blue-200 rounded-lg p-6 hover:bg-blue-100 transition-colors cursor-pointer bg-white">
                        <label htmlFor="attachment" className="cursor-pointer text-center">
                            <Icons.Plus className="mx-auto h-6 w-6 text-blue-400 mb-1" />
                            <p className="text-sm text-blue-600">Click to upload files</p>
                            <p className="text-[10px] text-blue-400 mt-1">
                                {formData.attachment ? formData.attachment.name : "(No file chosen)"}
                            </p>
                            <input
                                id="attachment"
                                type="file"
                                name="attachment"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Supported formats: Images, PDF, Docs (Max 5MB)</p>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold shadow-md hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading && <Icons.Spinner className="h-4 w-4 animate-spin" />}
                        {loading ? "Submitting Request..." : "SUBMIT REQUEST"}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="w-full mt-3 py-2 text-gray-500 text-sm font-medium hover:text-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
