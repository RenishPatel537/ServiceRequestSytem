import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { Icons } from "@/components/ui/icons";

interface StatusCount {
    _count: number;
    servicerequeststatus: {
        servicerequeststatusname: string;
    };
}

async function getDashboardData(userId: number) {
    const [counts, recentRequests, statusList] = await Promise.all([
        prisma.servicerequest.groupBy({
            by: ['servicerequeststatusid'],
            where: { createdbyuserid: userId },
            _count: true,
        }),
        prisma.servicerequest.findMany({
            where: { createdbyuserid: userId },
            include: {
                servicerequeststatus: true,
            },
            orderBy: { createdat: 'desc' },
            take: 5,
        }),
        prisma.servicerequeststatus.findMany()
    ]);

    const summary = {
        total: await prisma.servicerequest.count({ where: { createdbyuserid: userId } }),
        open: 0,
        inProgress: 0,
        closed: 0,
    };

    counts.forEach((c) => {
        const status = statusList.find(s => s.servicerequeststatusid === c.servicerequeststatusid);
        if (status) {
            const name = status.servicerequeststatusname.toUpperCase();
            if (name === 'OPEN') summary.open = c._count;
            else if (name === 'IN PROGRESS') summary.inProgress = c._count;
            else if (name === 'CLOSED' || name === 'RESOLVED' || name === 'COMPLETED') summary.closed += c._count;
        }
    });

    return { summary, recentRequests };
}

export default async function RequestorDashboard() {
    const session = await getAuthSession();
    const userId = session?.userId || 0;
    const { summary, recentRequests } = await getDashboardData(userId);

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case "OPEN": return "bg-blue-100 text-blue-800";
            case "IN PROGRESS": return "bg-yellow-100 text-yellow-800";
            case "RESOLVED": return "bg-green-100 text-green-800";
            case "CLOSED": return "bg-gray-100 text-gray-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const cards = [
        { label: "Total Requests", value: summary.total, icon: Icons.FileText, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Open", value: summary.open, icon: Icons.AlertCircle, color: "text-indigo-600", bg: "bg-indigo-50" },
        { label: "In Progress", value: summary.inProgress, icon: Icons.Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
        { label: "Closed", value: summary.closed, icon: Icons.CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Requestor Dashboard</h1>
                <p className="text-gray-500">Overview of your service requests activities.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card) => (
                    <div key={card.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${card.bg}`}>
                            <card.icon className={`h-6 w-6 ${card.color}`} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">{card.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Requests */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Requests</h2>
                    <Link href="/requestor/requests" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                        View all
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Req No</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="relative px-6 py-3">
                                    <span className="sr-only">View</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {recentRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                                        No requests found.
                                    </td>
                                </tr>
                            ) : (
                                recentRequests.map((req) => (
                                    <tr key={req.servicerequestid} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                            #{req.servicerequestno}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {req.servicerequesttitle}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(req.servicerequeststatus?.servicerequeststatusname || '')}`}>
                                                {req.servicerequeststatus?.servicerequeststatusname}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {req.createdat ? new Date(req.createdat).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link href={`/requestor/requests/${req.servicerequestid}`} className="text-blue-600 hover:text-blue-900">
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
