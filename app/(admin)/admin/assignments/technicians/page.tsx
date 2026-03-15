import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { Icons } from "@/components/ui/icons";
import { DetailButton } from "@/components/admin/detail-button";

async function getTechnicians() {
    return await prisma.servicerequesttypewiseperson.findMany({
        where: {
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
        include: {
            servicerequesttype: true,
            staff: true,
        },
        orderBy: { fromdate: "desc" },
    });
}

export default async function TechniciansPage() {
    const session = await getAuthSession();

    const technicians = await getTechnicians();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        Request Type Technicians
                    </h1>
                    <p className="text-sm text-gray-500">Manage technicians assigned to solve specific request types.</p>
                </div>
                <Link
                    href="/admin/assignments/technicians/create"
                    className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    <Icons.Plus className="h-4 w-4" />
                    Add Technician
                </Link>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Request Type
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
                        {technicians.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No technicians found.
                                </td>
                            </tr>
                        ) : (
                            technicians.map((tech) => {
                                const isActive = !tech.todate || new Date(tech.todate) > new Date();
                                return (
                                    <tr key={tech.servicerequesttypewisepersonid} className="hover:bg-gray-50">
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                            {tech.servicerequesttype?.servicerequesttypename}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {tech.staff?.fullname}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {new Date(tech.fromdate).toLocaleDateString()} - {tech.todate ? new Date(tech.todate).toLocaleDateString() : "Present"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {tech.description || "-"}
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
                                                <DetailButton title="Technician Assignment" data={tech} />
                                                <Link
                                                    href={`/admin/assignments/technicians/${tech.servicerequesttypewisepersonid}`}
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
