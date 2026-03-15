import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { Icons } from "@/components/ui/icons";
import { DetailButton } from "@/components/admin/detail-button";

async function getServiceTypes() {
    return await prisma.servicetype.findMany({
        orderBy: { servicetypename: "asc" },
    });
}

export default async function ServiceTypesPage() {
    const session = await getAuthSession();

    const types = await getServiceTypes();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                    Service Types
                </h1>
                <Link
                    href="/admin/service-type/create"
                    className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    <Icons.Plus className="h-4 w-4" />
                    Add Service Type
                </Link>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                For Staff
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                For Student
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Created At
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Modified At
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {types.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No service types found.
                                </td>
                            </tr>
                        ) : (
                            types.map((type) => (
                                <tr key={type.servicetypeid} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                        {type.servicetypename}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {type.isforstaff ? (
                                            <Icons.CheckCircle className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Icons.XCircle className="h-4 w-4 text-gray-400" />
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {type.isforstudent ? (
                                            <Icons.CheckCircle className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Icons.XCircle className="h-4 w-4 text-gray-400" />
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {type.createdat ? new Date(type.createdat).toLocaleDateString() : "-"}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {type.modifiedat ? new Date(type.modifiedat).toLocaleDateString() : "-"}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <DetailButton title="Service Type" data={type} />
                                            <Link
                                                href={`/admin/service-type/${type.servicetypeid}`}
                                                className="text-blue-600 hover:text-blue-900 icon-btn"
                                                title="Edit"
                                            >
                                                <Icons.Edit className="h-4 w-4" />
                                            </Link>
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
