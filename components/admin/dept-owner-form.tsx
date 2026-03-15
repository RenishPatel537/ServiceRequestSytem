"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { servicedept, staff, servicedeptperson } from "@/generated/prisma/client";

interface DeptOwnerFormProps {
    departments: servicedept[];
    staffList: staff[];
    initialData?: servicedeptperson;
    isEdit?: boolean;
}

export function DeptOwnerForm({ departments, staffList, initialData, isEdit = false }: DeptOwnerFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        servicedeptid: initialData?.servicedeptid ? String(initialData.servicedeptid) : "",
        staffid: initialData?.staffid ? String(initialData.staffid) : "",
        fromdate: initialData?.fromdate ? new Date(initialData.fromdate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        todate: initialData?.todate ? new Date(initialData.todate).toISOString().split('T')[0] : "",
        description: initialData?.description || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const url = "/api/admin/department-owners";
            const method = isEdit ? "PUT" : "POST";
            const payload = {
                ...formData,
                ...(isEdit && { servicedeptpersonid: initialData?.servicedeptpersonid }),
            };

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Something went wrong");
            }

            router.push("/admin/assignments/department-owners");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white p-6 shadow-sm rounded-lg border border-gray-200">
            {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="col-span-2 sm:col-span-1">
                    <label htmlFor="servicedeptid" className="block text-sm font-medium text-gray-700">Service Department <span className="text-red-500">*</span></label>
                    <select
                        id="servicedeptid"
                        name="servicedeptid"
                        required
                        disabled={isEdit}
                        value={formData.servicedeptid}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none sm:text-sm disabled:bg-gray-100"
                    >
                        <option value="">Select Department</option>
                        {departments.map(d => (
                            <option key={d.servicedeptid} value={d.servicedeptid}>{d.servicedeptname}</option>
                        ))}
                    </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                    <label htmlFor="staffid" className="block text-sm font-medium text-gray-700">Staff <span className="text-red-500">*</span></label>
                    <select
                        id="staffid"
                        name="staffid"
                        required
                        disabled={isEdit}
                        value={formData.staffid}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none sm:text-sm disabled:bg-gray-100"
                    >
                        <option value="">Select Staff</option>
                        {staffList.map(s => (
                            <option key={s.staffid} value={s.staffid}>{s.fullname} ({s.staffcode})</option>
                        ))}
                    </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                    <label htmlFor="fromdate" className="block text-sm font-medium text-gray-700">From Date <span className="text-red-500">*</span></label>
                    <input
                        type="date"
                        id="fromdate"
                        name="fromdate"
                        required
                        disabled={isEdit}
                        value={formData.fromdate}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none sm:text-sm disabled:bg-gray-100"
                    />
                </div>

                <div className="col-span-2 sm:col-span-1">
                    <label htmlFor="todate" className="block text-sm font-medium text-gray-700">To Date</label>
                    <input
                        type="date"
                        id="todate"
                        name="todate"
                        value={formData.todate}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none sm:text-sm"
                    />
                </div>

                <div className="col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        rows={3}
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="e.g. HOD, Coordinator"
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none sm:text-sm"
                    />
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
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    {loading ? "Saving..." : isEdit ? "Update Mapping" : "Create Mapping"}
                </button>
            </div>
        </form>
    );
}
