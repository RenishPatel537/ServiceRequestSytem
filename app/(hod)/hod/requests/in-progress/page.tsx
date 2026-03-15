"use client";

import { useEffect, useState } from "react";
import RequestTable, { RequestItem } from "@/components/hod/RequestTable";

export default function InProgressRequestsPage() {
    const [data, setData] = useState<RequestItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/hod/in-progress")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    const formattedData: RequestItem[] = data.map((item: any) => ({
                        id: item.servicerequestid,
                        requestNo: item.servicerequestno,
                        title: item.servicerequesttitle,
                        priority: item.prioritylevel || "MEDIUM",
                        status: "IN_PROGRESS",
                        createdAt: item.createdat,
                        assignedTo: item.assignedStaff?.fullname || "Unassigned",
                    }));
                    setData(formattedData);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch in-progress requests", err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">In Progress Requests</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Requests currently being worked on by technicians.
                </p>
            </div>

            <RequestTable
                title="In Progress Requests"
                data={data}
                loading={loading}
            />
        </div>
    );
}
