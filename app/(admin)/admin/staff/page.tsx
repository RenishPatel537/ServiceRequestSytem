import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { Icons } from "@/components/ui/icons";
import { DeleteButton } from "@/components/admin/delete-button";
import { DetailButton } from "@/components/admin/detail-button";

async function getStaff() {
    return await prisma.staff.findMany({
        where: { isactive: true },
        include: {
            servicedeptperson: {
                where: { todate: null },
                include: { servicedept: true },
            },
        },
        orderBy: { staffid: "asc" },
    });
}

export default async function StaffPage() {
    const session = await getAuthSession();

    const staffList = await getStaff();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                    Staff Management
                </h1>
                <Link
                    href="/admin/staff/create"
                    className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    <Icons.Plus className="h-4 w-4" />
                    Add Staff
                </Link>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Staff Code
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Department
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Contact
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {staffList.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No staff found.
                                </td>
                            </tr>
                        ) : (
                            staffList.map((staff) => {
                                const activeDept = staff.servicedeptperson[0]?.servicedept?.servicedeptname || "-";
                                return (
                                    <tr key={staff.staffid} className="hover:bg-gray-50">
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                            {staff.staffcode}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {staff.fullname}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                                {activeDept}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div className="flex flex-col">
                                                <span>{staff.email || "-"}</span>
                                                <span className="text-xs text-gray-400">{staff.mobile}</span>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <DetailButton title="Staff" data={staff} />
                                                <Link
                                                    href={`/admin/staff/${staff.staffid}`}
                                                    className="text-blue-600 hover:text-blue-900 icon-btn"
                                                    title="Edit"
                                                >
                                                    <Icons.Edit className="h-4 w-4" />
                                                </Link>
                                                <DeleteButton
                                                    id={staff.staffid}
                                                    apiPath="/api/admin/staff"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
