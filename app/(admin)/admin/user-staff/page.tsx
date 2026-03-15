import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { Icons } from "@/components/ui/icons";
import { DeleteButton } from "@/components/admin/delete-button";
import { DetailButton } from "@/components/admin/detail-button";

async function getMappings() {
    return await prisma.userstaff.findMany({
        include: {
            User: true,
            staff: true,
        },
        orderBy: { userstaffid: "desc" },
    });
}

export default async function UserStaffPage() {
    const session = await getAuthSession();
    const mappings = await getMappings();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        User-Staff Mapping
                    </h1>
                    <p className="text-sm text-gray-500">Link system users to their corresponding staff records.</p>
                </div>
                <Link
                    href="/admin/user-staff/create"
                    className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                >
                    <Icons.Plus className="h-4 w-4" />
                    New Mapping
                </Link>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                User (Username)
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Staff (Code - Name)
                            </th>
                            <th scope="col" className="relative px-6 py-3 text-right">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {mappings.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No mappings found.
                                </td>
                            </tr>
                        ) : (
                            mappings.map((m) => (
                                <tr key={m.userstaffid} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                        {m.User.username}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {m.staff.staffcode} - {m.staff.fullname}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <DetailButton title="User-Staff Mapping" data={m} />
                                            <DeleteButton
                                                id={m.userstaffid}
                                                apiPath="/api/admin/user-staff"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
