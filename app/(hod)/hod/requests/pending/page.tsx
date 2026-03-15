"use client";

import { useEffect, useState } from "react";
import RequestTable, { RequestItem } from "@/components/hod/RequestTable";

export default function PendingRequestsPage() {
    const [data, setData] = useState<RequestItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/hod/pending")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    const formattedData: RequestItem[] = data.map((item: any) => ({
                        id: item.servicerequestid,
                        requestNo: item.servicerequestno,
                        title: item.servicerequesttitle,
                        priority: item.prioritylevel || "MEDIUM", // Default as fallback
                        status: "PENDING", // sourced from endpoint context
                        createdAt: item.createdat,
                        assignedTo: null, // API doesn't return this, assuming unassigned for pending
                    }));
                    setData(formattedData);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch pending requests", err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Pending Requests</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Requests waiting for your approval or assignment.
                </p>
            </div>

            <RequestTable
                title="Pending Requests"
                data={data}
                loading={loading}
            />
        </div>
    );
}
