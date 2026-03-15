"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { role } from "@/generated/prisma/client";

interface RoleFormProps {
    initialData?: Partial<role>;
    isEdit?: boolean;
}

const SYSTEM_ROLES = ["ADMIN", "REQUESTOR", "TECHNICIAN", "HOD"];

export function RoleForm({ initialData, isEdit = false }: RoleFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        rolename: initialData?.rolename || "",
        description: initialData?.description || "",
    });

    const isSystemRole = initialData?.rolename ? SYSTEM_ROLES.includes(initialData.rolename) : false;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const url = "/api/admin/roles";
            const method = isEdit ? "PUT" : "POST";
            const payload = {
                ...formData,
                ...(isEdit && { roleid: initialData?.roleid }),
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

            router.push("/admin/roles");
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

            <div className="grid grid-cols-1 gap-6">
                <div>
                    <label htmlFor="rolename" className="block text-sm font-medium text-gray-700">Role Name <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        id="rolename"
                        name="rolename"
                        required
                        value={formData.rolename}
                        onChange={handleChange}
                        disabled={isEdit && isSystemRole}
                        className={`mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none sm:text-sm ${isEdit && isSystemRole ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
                    />
                    {isEdit && isSystemRole && <p className="mt-1 text-xs text-orange-600">System roles cannot be renamed.</p>}
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        rows={3}
                        value={formData.description}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none sm:text-sm"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => router.back()} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50">{loading ? "Saving..." : isEdit ? "Update Role" : "Create Role"}</button>
            </div>
        </form>
    );
}
