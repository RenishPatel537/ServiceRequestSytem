import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { Icons } from "@/components/ui/icons";
import { DetailButton } from "@/components/admin/detail-button";
import { DeleteButton } from "@/components/admin/delete-button";

async function getDepartments() {
    return await prisma.servicedept.findMany({
        include: {
            servicedeptperson: {
                where: {
                    todate: null,
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
                include: { staff: true }
            },
            servicerequesttype: {
                include: {
                    servicerequesttypewiseperson: {
                        where: {
                            todate: null,
                            staff: {
                                userstaff: {
                                    some: {
                                        User: {
                                            userrole: {
                                                some: {
                                                    role: {
                                                        rolename: "TECHNICIAN"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        include: { staff: true }
                    }
                }
            }
        },
        orderBy: { servicedeptid: "asc" },
    });
}

export default async function DepartmentsPage() {
    const session = await getAuthSession();

    const departments = await getDepartments();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                    Service Departments
                </h1>
                <Link
                    href="/admin/departments/create"
                    className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    <Icons.Plus className="h-4 w-4" />
                    Add Department
                </Link>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                            >
                                Name
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                            >
                                Description
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                            >
                                HODs
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                            >
                                Technicians
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                            >
                                Created At
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                            >
                                Modified At
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {departments.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No departments found.
                                </td>
                            </tr>
                        ) : (
                            departments.map((dept) => (
                                <tr key={dept.servicedeptid} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                        {dept.servicedeptname}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {dept.description || "-"}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                            {dept.servicedeptperson.length}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                            {dept.servicerequesttype.reduce((acc, type) => acc + type.servicerequesttypewiseperson.length, 0)}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {dept.createdat ? new Date(dept.createdat).toLocaleDateString() : "-"}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {dept.modifiedat ? new Date(dept.modifiedat).toLocaleDateString() : "-"}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <DetailButton title="Department" data={dept} />
                                            <Link
                                                href={`/admin/departments/${dept.servicedeptid}`}
                                                className="text-blue-600 hover:text-blue-900 icon-btn"
                                                title="Edit"
                                            >
                                                <Icons.Edit className="h-4 w-4" />
                                            </Link>
                                            <DeleteButton
                                                id={dept.servicedeptid}
                                                apiPath="/api/admin/departments"
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
