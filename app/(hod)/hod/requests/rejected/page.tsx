"use client";

import { useEffect, useState } from "react";
import RequestTable, { RequestItem } from "@/components/hod/RequestTable";

export default function RejectedRequestsPage() {
    const [data, setData] = useState<RequestItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/hod/rejected")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    const formattedData: RequestItem[] = data.map((item: any) => ({
                        id: item.servicerequestid,
                        requestNo: item.servicerequestno,
                        title: item.servicerequesttitle,
                        priority: item.prioritylevel || "MEDIUM",
                        status: "REJECTED",
                        createdAt: item.createdat,
                        assignedTo: item.assignedStaff?.fullname || "Unassigned",
                    }));
                    setData(formattedData);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch rejected requests", err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Rejected Requests</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Requests that have been rejected.
                </p>
            </div>

            <RequestTable
                title="Rejected Requests"
                data={data}
                loading={loading}
            />
        </div>
    );
}
