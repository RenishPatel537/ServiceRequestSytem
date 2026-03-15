import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { Icons } from "@/components/ui/icons";
import { DetailButton } from "@/components/admin/detail-button";

async function getOwners() {
    return await prisma.servicedeptperson.findMany({
        where: {
            staff: {
                userstaff: {
                    some: {
                        User: {
                            userrole: {
                                some: {
                                    role: {
                                        rolename: "HOD"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        include: {
            servicedept: true,
            staff: true,
        },
        orderBy: { fromdate: "desc" },
    });
}

export default async function DepartmentOwnersPage() {
    const session = await getAuthSession();

    const owners = await getOwners();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        Department Owners
                    </h1>
                    <p className="text-sm text-gray-500">Manage staff assigned to handle department-level requests.</p>
                </div>
                <Link
                    href="/admin/assignments/department-owners/create"
                    className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    <Icons.Plus className="h-4 w-4" />
                    Add Owner
                </Link>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Department
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Staff
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Validity
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Description
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Status
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {owners.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No department owners found.
                                </td>
                            </tr>
                        ) : (
                            owners.map((owner) => {
                                const isActive = !owner.todate || new Date(owner.todate) > new Date();
                                return (
                                    <tr key={owner.servicedeptpersonid} className="hover:bg-gray-50">
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                            {owner.servicedept?.servicedeptname}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {owner.staff?.fullname}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {new Date(owner.fromdate).toLocaleDateString()} - {owner.todate ? new Date(owner.todate).toLocaleDateString() : "Present"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {owner.description || "-"}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                                            {isActive ? (
                                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <DetailButton title="Dept Owner Assignment" data={owner} />
                                                <Link
                                                    href={`/admin/assignments/department-owners/${owner.servicedeptpersonid}`}
                                                    className="text-blue-600 hover:text-blue-900 icon-btn"
                                                    title="Edit"
                                                >
                                                    <Icons.Edit className="h-4 w-4" />
                                                </Link>
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
