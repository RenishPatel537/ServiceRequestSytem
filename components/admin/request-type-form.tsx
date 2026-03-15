"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { servicerequesttype, servicedept, servicetype } from "@/generated/prisma/client";

interface RequestTypeFormProps {
    initialData?: Partial<servicerequesttype>;
    departments: servicedept[];
    serviceTypes: servicetype[];
    isEdit?: boolean;
}

export function RequestTypeForm({ initialData, departments, serviceTypes, isEdit = false }: RequestTypeFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        servicerequesttypename: initialData?.servicerequesttypename || "",
        servicetypeid: initialData?.servicetypeid || "",
        servicedeptid: initialData?.servicedeptid || "",
        description: initialData?.description || "",
        defaultprioritylevel: initialData?.defaultprioritylevel || "",
        reminderdaysafterassignment: initialData?.reminderdaysafterassignment || "",
        ismandatoryresource: initialData?.ismandatoryresource || false,
        isvisibleresource: initialData?.isvisibleresource !== undefined ? initialData.isvisibleresource : true,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
            return;
        }
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleToggle = (name: string, checked: boolean) => {
        setFormData((prev) => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const url = "/api/admin/request-types";
            const method = isEdit ? "PUT" : "POST";
            const payload = {
                ...formData,
                ...(isEdit && { servicerequesttypeid: initialData?.servicerequesttypeid }),
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

            router.push("/admin/service-request-type");
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

            <div>
                <label htmlFor="servicerequesttypename" className="block text-sm font-medium text-gray-700">Request Type Name <span className="text-red-500">*</span></label>
                <input type="text" id="servicerequesttypename" name="servicerequesttypename" required maxLength={250} value={formData.servicerequesttypename} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none sm:text-sm" />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="col-span-1">
                    <label htmlFor="servicedeptid" className="block text-sm font-medium text-gray-700">Department <span className="text-red-500">*</span></label>
                    <select id="servicedeptid" name="servicedeptid" required value={formData.servicedeptid} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none sm:text-sm">
                        <option value="">Select Department</option>
                        {departments.map(d => (
                            <option key={d.servicedeptid} value={d.servicedeptid}>{d.servicedeptname}</option>
                        ))}
                    </select>
                </div>

                <div className="col-span-1">
                    <label htmlFor="servicetypeid" className="block text-sm font-medium text-gray-700">Service Type <span className="text-red-500">*</span></label>
                    <select id="servicetypeid" name="servicetypeid" required value={formData.servicetypeid} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none sm:text-sm">
                        <option value="">Select Service Type</option>
                        {serviceTypes.map(t => (
                            <option key={t.servicetypeid} value={t.servicetypeid}>{t.servicetypename}</option>
                        ))}
                    </select>
                </div>

                <div className="col-span-1">
                    <label htmlFor="defaultprioritylevel" className="block text-sm font-medium text-gray-700">Default Priority</label>
                    <select
                        id="defaultprioritylevel"
                        name="defaultprioritylevel"
                        value={formData.defaultprioritylevel}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none sm:text-sm"
                    >
                        <option value="">Select Priority</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                    </select>
                </div>

                <div className="col-span-1">
                    <label htmlFor="reminderdaysafterassignment" className="block text-sm font-medium text-gray-700">Reminder Days</label>
                    <input type="number" id="reminderdaysafterassignment" name="reminderdaysafterassignment" value={formData.reminderdaysafterassignment} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none sm:text-sm" />
                </div>
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea id="description" name="description" rows={3} value={formData.description} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none sm:text-sm" />
            </div>

            <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                    <input type="checkbox" id="ismandatoryresource" name="ismandatoryresource" checked={formData.ismandatoryresource || false} onChange={(e) => handleToggle('ismandatoryresource', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="ismandatoryresource" className="text-sm text-gray-700">Mandatory Resource?</label>
                </div>
                <div className="flex items-center gap-2">
                    <input type="checkbox" id="isvisibleresource" name="isvisibleresource" checked={Boolean(formData.isvisibleresource)} onChange={(e) => handleToggle('isvisibleresource', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="isvisibleresource" className="text-sm text-gray-700">Visible?</label>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => router.back()} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50">{loading ? "Saving..." : isEdit ? "Update Request Type" : "Create Request Type"}</button>
            </div>
        </form>
    );
}
