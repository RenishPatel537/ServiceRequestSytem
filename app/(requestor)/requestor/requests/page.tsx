import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

async function getMyRequests(userId: number) {
    return await prisma.servicerequest.findMany({
        where: { createdbyuserid: userId },
        include: {
            servicerequeststatus: true,
            servicerequesttype: {
                include: {
                    servicedept: true
                }
            },
            assignedStaff: true,
            User: { select: { username: true } },
        },
        orderBy: { createdat: 'desc' },
    });
}

export default async function MyRequestsPage() {
    const session = await getAuthSession();
    const userId = session?.userId || 0;
    const requests = await getMyRequests(userId);

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case "OPEN": return "bg-blue-100 text-blue-800";
            case "IN PROGRESS": return "bg-yellow-100 text-yellow-800";
            case "RESOLVED": return "bg-green-100 text-green-800";
            case "CLOSED": return "bg-gray-100 text-gray-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
                    <p className="text-gray-500">View and track all your service requests.</p>
                </div>
                <Link
                    href="/requestor/requests/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                    Create Request
                </Link>
            </div>

            <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Req No</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Technician</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                                <th className="relative px-6 py-3">
                                    <span className="sr-only">View</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                                        No requests found.
                                    </td>
                                </tr>
                            ) : (
                                requests.map((req) => (
                                    <tr key={req.servicerequestid} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                            #{req.servicerequestno}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {req.servicerequesttype?.servicedept?.servicedeptname}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {req.servicerequesttype?.servicerequesttypename}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(req.servicerequeststatus?.servicerequeststatusname || '')}`}>
                                                {req.servicerequeststatus?.servicerequeststatusname}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {req.assignedStaff?.fullname || <span className="text-gray-400 italic">Not Assigned</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {req.createdat ? new Date(req.createdat).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link href={`/requestor/requests/${req.servicerequestid}`} className="text-blue-600 hover:text-blue-900 font-semibold">
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
