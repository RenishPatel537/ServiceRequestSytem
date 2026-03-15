"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { User, staff } from "@/generated/prisma/client";

interface UserStaffFormProps {
    users: Partial<User>[];
    staffList: Partial<staff>[];
}

export function UserStaffForm({ users, staffList }: UserStaffFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        userid: "",
        staffid: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/admin/user-staff", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || "Failed to create mapping");
            }

            router.push("/admin/user-staff");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl bg-white p-6 rounded-lg border shadow-sm">
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                <div>
                    <label htmlFor="userid" className="block text-sm font-medium text-gray-700">User <span className="text-red-500">*</span></label>
                    <select
                        id="userid"
                        name="userid"
                        required
                        value={formData.userid}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none sm:text-sm"
                    >
                        <option value="">Select User</option>
                        {users.map((u) => (
                            <option key={u.userid} value={u.userid}>
                                {u.username}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="staffid" className="block text-sm font-medium text-gray-700">Staff Member <span className="text-red-500">*</span></label>
                    <select
                        id="staffid"
                        name="staffid"
                        required
                        value={formData.staffid}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none sm:text-sm"
                    >
                        <option value="">Select Staff</option>
                        {staffList.map((s) => (
                            <option key={s.staffid} value={s.staffid}>
                                {s.staffcode} - {s.fullname}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 font-normal">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    {loading ? "Saving..." : "Create Mapping"}
                </button>
            </div>
        </form>
    );
}
