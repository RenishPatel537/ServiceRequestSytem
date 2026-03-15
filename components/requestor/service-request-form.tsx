"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ServiceType {
    servicetypeid: number;
    servicetypename: string;
}

interface RequestType {
    servicerequesttypeid: number;
    servicerequesttypename: string;
}

export function ServiceRequestForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
    const [requestTypes, setRequestTypes] = useState<RequestType[]>([]);

    const [formData, setFormData] = useState({
        serviceTypeId: "",
        serviceRequestTypeId: "",
        title: "",
        description: "",
        attachment: null as File | null,
    });

    useEffect(() => {
        const fetchServiceTypes = async () => {
            try {
                const res = await fetch("/api/requestor/service-types");
                if (res.ok) {
                    const data = await res.json();
                    setServiceTypes(data);
                }
            } catch (err) {
                console.error("Failed to fetch service types", err);
            }
        };
        fetchServiceTypes();
    }, []);

    useEffect(() => {
        if (formData.serviceTypeId) {
            const fetchRequestTypes = async () => {
                try {
                    const res = await fetch(`/api/requestor/request-types?serviceTypeId=${formData.serviceTypeId}`);
                    if (res.ok) {
                        const data = await res.json();
                        setRequestTypes(data);
                    }
                } catch (err) {
                    console.error("Failed to fetch request types", err);
                }
            };
            fetchRequestTypes();
        } else {
            setRequestTypes([]);
        }
        // Reset request type when service type changes
        setFormData(prev => ({ ...prev, serviceRequestTypeId: "" }));
    }, [formData.serviceTypeId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFormData(prev => ({ ...prev, attachment: e.target.files![0] }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = new FormData();
            data.append("serviceTypeId", formData.serviceTypeId);
            data.append("serviceRequestTypeId", formData.serviceRequestTypeId);
            data.append("title", formData.title);
            data.append("description", formData.description);
            if (formData.attachment) {
                data.append("attachment", formData.attachment);
            }

            const res = await fetch("/api/requestor/service-requests", {
                method: "POST",
                body: data,
            });

            if (!res.ok) {
                const result = await res.json();
                throw new Error(result.error || "Something went wrong");
            }

            router.push("/requestor/dashboard");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 shadow-sm rounded-lg border border-gray-200">
            {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="col-span-1">
                    <label htmlFor="serviceTypeId" className="block text-sm font-medium text-gray-700">Service Area <span className="text-red-500">*</span></label>
                    <select
                        id="serviceTypeId"
                        name="serviceTypeId"
                        required
                        value={formData.serviceTypeId}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none sm:text-sm"
                    >
                        <option value="">Select Service Area</option>
                        {serviceTypes.map(st => (
                            <option key={st.servicetypeid} value={st.servicetypeid}>{st.servicetypename}</option>
                        ))}
                    </select>
                </div>

                <div className="col-span-1">
                    <label htmlFor="serviceRequestTypeId" className="block text-sm font-medium text-gray-700">Request Type <span className="text-red-500">*</span></label>
                    <select
                        id="serviceRequestTypeId"
                        name="serviceRequestTypeId"
                        required
                        disabled={!formData.serviceTypeId}
                        value={formData.serviceRequestTypeId}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none sm:text-sm disabled:bg-gray-50"
                    >
                        <option value="">Select Request Type</option>
                        {requestTypes.map(rt => (
                            <option key={rt.servicerequesttypeid} value={rt.servicerequesttypeid}>{rt.servicerequesttypename}</option>
                        ))}
                    </select>
                </div>

                <div className="col-span-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Short Title <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Brief summary of your request"
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none sm:text-sm"
                    />
                </div>

                <div className="col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Detailed Description <span className="text-red-500">*</span></label>
                    <textarea
                        id="description"
                        name="description"
                        required
                        rows={5}
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Please provide as much detail as possible..."
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none sm:text-sm"
                    />
                </div>

                <div className="col-span-2">
                    <label htmlFor="attachment" className="block text-sm font-medium text-gray-700">Attachment (Optional)</label>
                    <input
                        type="file"
                        id="attachment"
                        name="attachment"
                        onChange={handleFileChange}
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="mt-1 text-xs text-gray-500">Supported formats: Images, PDF, Docs (Max 5MB)</p>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    {loading ? "Submitting..." : "Submit Request"}
                </button>
            </div>
        </form>
    );
}
