import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { Icons } from "@/components/ui/icons";
import { notFound } from "next/navigation";

async function getRequestDetail(requestId: number, userId: number) {
    return await prisma.servicerequest.findFirst({
        where: {
            servicerequestid: requestId,
            createdbyuserid: userId,
        },
        include: {
            servicerequeststatus: true,
            servicerequesttype: {
                include: {
                    servicedept: true,
                    servicetype: true,
                }
            },
            assignedStaff: true,
            User: { select: { username: true } },
            servicerequestattachment: true,
            servicerequestreply: {
                include: {
                    User: true,
                    servicerequeststatus: true
                },
                orderBy: { createdat: 'asc' }
            }
        }
    });
}

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getAuthSession();
    const userId = session?.userId || 0;
    const request = await getRequestDetail(Number(id), userId);

    if (!request) {
        notFound();
    }

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
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/requestor/requests" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <Icons.ArrowLeft className="h-5 w-5 text-gray-500" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Request #{request.servicerequestno}</h1>
                    <p className="text-sm text-gray-500">View your request details and tracking history.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                        <h2 className="text-lg font-bold text-gray-900 border-b pb-2">{request.servicerequesttitle}</h2>
                        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                            {request.servicerequestdescription}
                        </div>
                    </div>

                    {/* Timeline / Status History */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Activity Log</h3>
                        <div className="flow-root">
                            <ul className="-mb-8">
                                <li className="relative pb-8">
                                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                    <div className="relative flex space-x-3">
                                        <div>
                                            <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                                                <Icons.Plus className="h-4 w-4 text-white" />
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                                            <div>
                                                <p className="text-sm text-gray-500 font-medium">Request Created</p>
                                            </div>
                                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                <time>{request.createdat?.toLocaleString()}</time>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                {request.servicerequestreply.map((reply, idx) => (
                                    <li key={reply.servicerequestreplyid} className="relative pb-8">
                                        {idx !== request.servicerequestreply.length - 1 && (
                                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                        )}
                                        <div className="relative flex space-x-3">
                                            <div>
                                                <span className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white">
                                                    <Icons.FileText className="h-4 w-4 text-white" />
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                                                <div>
                                                    <p className="text-sm text-gray-900 font-semibold">{reply.User.username}</p>
                                                    <p className="text-sm text-gray-500 mt-1 italic">{reply.replydescription}</p>
                                                    <div className="mt-2">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(reply.servicerequeststatus.servicerequeststatusname)}`}>
                                                            Status updated to {reply.servicerequeststatus.servicerequeststatusname}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                    <time>{reply.createdat?.toLocaleString()}</time>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Current Status</label>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(request.servicerequeststatus.servicerequeststatusname)}`}>
                                {request.servicerequeststatus.servicerequeststatusname}
                            </span>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Service Area</label>
                            <p className="text-sm font-medium text-gray-900">{request.servicerequesttype.servicetype.servicetypename}</p>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Department</label>
                            <p className="text-sm font-medium text-gray-900">{request.servicerequesttype.servicedept.servicedeptname}</p>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Request Type</label>
                            <p className="text-sm font-medium text-gray-900">{request.servicerequesttype.servicerequesttypename}</p>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Assigned Technician</label>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                    <Icons.Users className="h-4 w-4 text-gray-400" />
                                </div>
                                <p className="text-sm font-medium text-gray-900">
                                    {request.assignedStaff?.fullname || "Unassigned"}
                                </p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Created At</label>
                            <p className="text-sm text-gray-700">{request.createdat?.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
