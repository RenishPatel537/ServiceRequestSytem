import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { Icons } from "@/components/ui/icons";
import { DetailButton } from "@/components/admin/detail-button";

async function getRequestTypes() {
    return await prisma.servicerequesttype.findMany({
        include: {
            servicedept: true,
            servicetype: true,
        },
        orderBy: { servicerequesttypename: "asc" },
    });
}

export default async function RequestTypesPage() {
    const session = await getAuthSession();

    const types = await getRequestTypes();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                    Service Request Types
                </h1>
                <Link
                    href="/admin/service-request-type/create"
                    className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    <Icons.Plus className="h-4 w-4" />
                    Add Request Type
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
                                Department
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Service Type
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Flags
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
                                    No request types found.
                                </td>
                            </tr>
                        ) : (
                            types.map((type) => (
                                <tr key={type.servicerequesttypeid} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                        {type.servicerequesttypename}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {type.servicedept?.servicedeptname}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {type.servicetype?.servicetypename}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="flex flex-wrap gap-1">
                                            {type.ismandatoryresource && <span className="text-xs bg-red-100 text-red-800 rounded px-1">Mandatory</span>}
                                            {type.isvisibleresource && <span className="text-xs bg-green-100 text-green-800 rounded px-1">Visible</span>}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {type.modifiedat ? new Date(type.modifiedat).toLocaleDateString() : "-"}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <DetailButton title="Request Type" data={type} />
                                            <Link
                                                href={`/admin/service-request-type/${type.servicerequesttypeid}`}
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
