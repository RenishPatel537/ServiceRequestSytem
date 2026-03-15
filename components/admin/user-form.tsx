"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { User, role, staff } from "@/generated/prisma/client";

interface UserFormProps {
    initialData?: Partial<User> & { roleIds?: number[]; staffId?: number | null };
    roles: role[];
    staffList: staff[];
    isEdit?: boolean;
}

export function UserForm({ initialData, roles, staffList, isEdit = false }: UserFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        username: initialData?.username || "",
        email: initialData?.email || "",
        password: "", // Always empty initially
        roleIds: initialData?.roleIds || [],
        staffid: initialData?.staffId ? String(initialData.staffId) : "",
        isactive: initialData?.isactive ?? true,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
            return;
        }
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleToggleRole = (roleId: number) => {
        setFormData((prev) => {
            const roleIds = prev.roleIds.includes(roleId)
                ? prev.roleIds.filter((id) => id !== roleId)
                : [...prev.roleIds, roleId];
            return { ...prev, roleIds };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!isEdit && !formData.password) {
            setError("Password is required for new users");
            setLoading(false);
            return;
        }

        if (formData.roleIds.length === 0) {
            setError("Please select at least one role");
            setLoading(false);
            return;
        }

        try {
            const url = "/api/admin/users";
            const method = isEdit ? "PUT" : "POST";
            const payload = {
                ...formData,
                ...(isEdit && { userid: initialData?.userid }),
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

            router.push("/admin/users");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
            {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {error}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {/* Basic Information Section */}
                <div className="md:col-span-1">
                    <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Essential login and contact details for the new user account.
                    </p>
                </div>

                <div className="md:col-span-2 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl border border-gray-100 p-8 space-y-6">
                    <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                            <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
                                Username <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="johndoe"
                                className="mt-2 block w-full rounded-lg border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                            />
                        </div>

                        <div className="sm:col-span-1">
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="john@example.com"
                                className="mt-2 block w-full rounded-lg border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                                {isEdit ? "New Password (Optional)" : "Password *"}
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder={isEdit ? "Leave blank to keep current password" : "••••••••"}
                                className="mt-2 block w-full rounded-lg border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                            />
                        </div>

                        {isEdit && (
                            <div className="sm:col-span-2 flex items-center gap-x-3 pt-2">
                                <div className="flex h-6 items-center">
                                    <input
                                        id="isactive"
                                        name="isactive"
                                        type="checkbox"
                                        checked={formData.isactive}
                                        onChange={handleChange}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                                    />
                                </div>
                                <div className="text-sm leading-6">
                                    <label htmlFor="isactive" className="font-medium text-gray-900">
                                        Active Account
                                    </label>
                                    <p className="text-gray-500">Uncheck to disable user login.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Roles & Permissions Section */}
                <div className="md:col-span-1">
                    <h3 className="text-lg font-semibold text-gray-900">Roles & Permissions</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Assign one or more roles to define what this user can access in the system.
                    </p>
                </div>

                <div className="md:col-span-2 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl border border-gray-100 p-8">
                    <fieldset>
                        <legend className="text-sm font-semibold leading-6 text-gray-900">User Roles <span className="text-red-500">*</span></legend>
                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {roles.map((r) => (
                                <div
                                    key={r.roleid}
                                    onClick={() => handleToggleRole(r.roleid)}
                                    className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none transition-all ${formData.roleIds.includes(r.roleid)
                                        ? "border-blue-600 ring-2 ring-blue-600"
                                        : "border-gray-300 hover:border-gray-400"
                                        }`}
                                >
                                    <div className="flex flex-1">
                                        <div className="flex flex-col">
                                            <span className="block text-sm font-medium text-gray-900">{r.rolename}</span>
                                            <span className="mt-1 flex items-center text-xs text-gray-500">
                                                {r.description || `Grants ${r.rolename.toLowerCase()} permissions`}
                                            </span>
                                        </div>
                                    </div>
                                    {formData.roleIds.includes(r.roleid) && (
                                        <svg className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                            ))}
                        </div>
                    </fieldset>
                </div>

                {/* Staff Link Section */}
                <div className="md:col-span-1">
                    <h3 className="text-lg font-semibold text-gray-900">Staff Linkage</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Link this account to a staff member. Required for Technicians and Requestors.
                    </p>
                </div>

                <div className="md:col-span-2 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl border border-gray-100 p-8 space-y-4">
                    <label htmlFor="staffid" className="block text-sm font-medium leading-6 text-gray-900">
                        Associated Staff Member
                    </label>
                    <select
                        id="staffid"
                        name="staffid"
                        value={formData.staffid}
                        onChange={handleChange}
                        className="mt-2 block w-full rounded-lg border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 bg-white"
                    >
                        <option value="">-- No Staff Linked --</option>
                        {staffList.map((s) => (
                            <option key={s.staffid} value={s.staffid}>
                                {s.fullname} {s.staffcode ? `(${s.staffcode})` : ""}
                            </option>
                        ))}
                    </select>
                    <div className="flex items-start gap-2 mt-2">
                        <svg className="h-5 w-5 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-xs text-gray-500 italic">
                            Linking a staff member allows the user to manage their department's requests or perform technical tasks.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end gap-x-4 border-t border-gray-200 pt-8 mt-8">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                        </span>
                    ) : isEdit ? (
                        "Update User Account"
                    ) : (
                        "Create User Account"
                    )}
                </button>
            </div>
        </form>
    );
}
