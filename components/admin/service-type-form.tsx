"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { servicetype } from "@/generated/prisma/client";

interface ServiceTypeFormProps {
    initialData?: Partial<servicetype>;
    isEdit?: boolean;
}

export function ServiceTypeForm({ initialData, isEdit = false }: ServiceTypeFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        servicetypename: initialData?.servicetypename || "",
        isforstaff: initialData?.isforstaff !== undefined ? initialData.isforstaff : true,
        isforstudent: initialData?.isforstudent || false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
            const url = "/api/admin/service-types";
            const method = isEdit ? "PUT" : "POST";
            const payload = {
                ...formData,
                ...(isEdit && { servicetypeid: initialData?.servicetypeid }),
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

            router.push("/admin/service-type");
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
                <label htmlFor="servicetypename" className="block text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
                <input type="text" id="servicetypename" name="servicetypename" required maxLength={250} value={formData.servicetypename} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none sm:text-sm" />
            </div>

            <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                    <input type="checkbox" id="isforstaff" name="isforstaff" checked={Boolean(formData.isforstaff)} onChange={(e) => handleToggle('isforstaff', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="isforstaff" className="text-sm text-gray-700">Available for Staff?</label>
                </div>
                <div className="flex items-center gap-2">
                    <input type="checkbox" id="isforstudent" name="isforstudent" checked={formData.isforstudent || false} onChange={(e) => handleToggle('isforstudent', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="isforstudent" className="text-sm text-gray-700">Available for Student?</label>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => router.back()} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50">{loading ? "Saving..." : isEdit ? "Update Service Type" : "Create Service Type"}</button>
            </div>
        </form>
    );
}
