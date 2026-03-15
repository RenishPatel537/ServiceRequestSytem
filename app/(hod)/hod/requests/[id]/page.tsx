"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Staff {
  value: number;
  label: string;
}

interface RequestDetail {
  servicerequestid: number;
  servicerequestno: string;
  servicerequesttitle: string;
  servicerequestdescription: string;
  prioritylevel: string;
  servicerequeststatus: {
    servicerequeststatusname: string;
  };
  assignedStaff?: {
    fullname: string;
  };
  requesterStaff?: {
    fullname: string;
  };
  User?: {
    username: string;
  };
  createdat: string;
}

export default function RequestDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = () => {
    setLoading(true);
    fetch(`/api/hod/request/${id}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error("Request not found");
          if (res.status === 403) throw new Error("Permission denied");
          throw new Error("Failed to fetch request");
        }
        return res.json();
      })
      .then((data) => {
        setRequest(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const fetchStaff = () => {
    fetch("/api/hod/dropdown/staff")
      .then((res) => res.json())
      .then((data) => setStaffList(data))
      .catch((err) => console.error("Failed to fetch staff", err));
  };

  const handleOpenAssignModal = () => {
    if (staffList.length === 0) fetchStaff();
    setIsAssignModalOpen(true);
  };

  const handleAction = async (
    action: "assign" | "resolve" | "reject" | "close",
    body?: any,
  ) => {
    setActionLoading(true);
    setSuccessMessage(null);
    setError(null);

    try {
        console.log(body)
      const res = await fetch(`/api/hod/request/${id}/${action}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to ${action} request`);
      }

      setSuccessMessage(`Request successfully ${action}ed!`);
      if (action === "assign") setIsAssignModalOpen(false);

      // Refresh data
      fetchRequest();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">
        Loading request details...
      </div>
    );
  if (error && !request)
    return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  if (!request) return null;

  const status =
    request.servicerequeststatus?.servicerequeststatusname || "UNKNOWN";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Request Details</h2>
        <Link
          href="/hod/requests/pending"
          className="text-sm text-blue-600 hover:underline"
        >
          &larr; Back to List
        </Link>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="p-4 rounded-md bg-green-50 text-green-700 border border-green-200">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="p-4 rounded-md bg-red-50 text-red-700 border border-red-200">
          Error: {error}
        </div>
      )}

      {/* Request Info Card */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {request.servicerequesttitle}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                #{request.servicerequestno}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold
              ${
                status === "PENDING"
                  ? "bg-yellow-100 text-yellow-800"
                  : status === "IN_PROGRESS"
                    ? "bg-blue-100 text-blue-800"
                    : status === "RESOLVED"
                      ? "bg-green-100 text-green-800"
                      : status === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
              }`}
            >
              {status}
            </span>
          </div>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Description
            </h4>
            <p className="mt-2 text-gray-900 text-sm whitespace-pre-wrap">
              {request.servicerequestdescription}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </h4>
              <p className="mt-1 text-gray-900 text-sm font-medium">
                {request.prioritylevel || "MEDIUM"}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Created Date
              </h4>
              <p className="mt-1 text-gray-900 text-sm">
                {new Date(request.createdat).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Assigned To
              </h4>
              <p className="mt-1 text-gray-900 text-sm">
                {request.assignedStaff?.fullname || "Unassigned"}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Requester
              </h4>
              <p className="mt-1 text-gray-900 text-sm">
                {request.requesterStaff?.fullname ||
                  request.User?.username ||
                  "Unknown"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Panel */}
      <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>

        <div className="flex flex-wrap gap-4">
          {status === "PENDING" && (
            <>
              <button
                onClick={handleOpenAssignModal}
                disabled={actionLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
              >
                Assign
              </button>
              <button
                onClick={() => handleAction("resolve")}
                disabled={actionLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
              >
                Resolve
              </button>
              <button
                onClick={() => handleAction("reject")}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
              >
                Reject
              </button>
            </>
          )}

          {status === "IN_PROGRESS" && (
            <>
              <button
                onClick={() => handleAction("resolve")}
                disabled={actionLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
              >
                Resolve
              </button>
              <button
                onClick={() => handleAction("reject")}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
              >
                Reject
              </button>
            </>
          )}

          {status === "RESOLVED" && (
            <button
              onClick={() => handleAction("close")}
              disabled={actionLoading}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 text-sm font-medium"
            >
              Close
            </button>
          )}

          {(status === "REJECTED" || status === "CLOSED") && (
            <p className="text-gray-500 italic">
              No actions available for this request.
            </p>
          )}
        </div>
      </div>

      {/* Assign Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Assign Technician
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Staff
              </label>
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full bg-white text-gray-900 border border-gray-300 
rounded-md shadow-sm focus:border-blue-500 focus:ring-2 
focus:ring-blue-500 sm:text-sm p-2"
              >
                <option value="" className="text-gray-900">
                  -- Select Staff --
                </option>
                {staffList.map((staff) => (
                  <option
                    key={staff.value}
                    value={staff.value}
                    className="text-gray-900 bg-white"
                  >
                    {staff.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleAction("assign", {
                    technicianId: parseInt(selectedStaffId),
                  })
                }
                disabled={actionLoading || !selectedStaffId}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
              >
                Confirm Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
