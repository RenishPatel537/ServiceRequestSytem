"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { staff, servicedept } from "@/generated/prisma/client";

interface StaffFormProps {
    initialData?: Partial<staff> & { currentDeptId?: number };
    departments: servicedept[];
    isEdit?: boolean;
}

export function StaffForm({ initialData, departments, isEdit = false }: StaffFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        staffcode: initialData?.staffcode || "",
        fullname: initialData?.fullname || "",
        email: initialData?.email || "",
        mobile: initialData?.mobile || "",
        servicedeptid: initialData?.currentDeptId ? String(initialData.currentDeptId) : "",
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
            const url = "/api/admin/staff";
            const method = isEdit ? "PUT" : "POST";
            const payload = {
                ...formData,
                ...(isEdit && { staffid: initialData?.staffid }),
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

            router.push("/admin/staff");
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
                <div className="col-span-1">
                    <label htmlFor="staffcode" className="block text-sm font-medium text-gray-700">Staff Code <span className="text-red-500">*</span></label>
                    <input type="text" id="staffcode" name="staffcode" required value={formData.staffcode} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none sm:text-sm" />
                </div>

                <div className="col-span-1">
                    <label htmlFor="fullname" className="block text-sm font-medium text-gray-700">Full Name <span className="text-red-500">*</span></label>
                    <input type="text" id="fullname" name="fullname" required value={formData.fullname} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none sm:text-sm" />
                </div>

                <div className="col-span-1">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none sm:text-sm" />
                </div>

                <div className="col-span-1">
                    <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile</label>
                    <input type="text" id="mobile" name="mobile" value={formData.mobile} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none sm:text-sm" />
                </div>

                <div className="col-span-2">
                    <label htmlFor="servicedeptid" className="block text-sm font-medium text-gray-700">Department <span className="text-red-500">*</span></label>
                    <select id="servicedeptid" name="servicedeptid" required value={formData.servicedeptid} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none sm:text-sm">
                        <option value="">Select Department</option>
                        {departments.map(d => (
                            <option key={d.servicedeptid} value={d.servicedeptid}>{d.servicedeptname}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => router.back()} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50">{loading ? "Saving..." : isEdit ? "Update Staff" : "Create Staff"}</button>
            </div>
        </form>
    );
}
