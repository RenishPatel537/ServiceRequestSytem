"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface DashboardSummary {
  PENDING: number;
  IN_PROGRESS: number;
  RESOLVED: number;
  REJECTED: number;
  CLOSED: number;
}

export default function TechnicianDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/technician/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        return res.json();
      })
      .then((data) => {
        setSummary(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 font-medium flex items-center gap-3">
          <svg
            className="animate-spin h-5 w-5 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading dashboard summary...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
        <h3 className="text-lg font-semibold mb-2">Error</h3>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-sm font-semibold underline hover:no-underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  const total = summary
    ? (Number(summary.PENDING) || 0) +
      (Number(summary.IN_PROGRESS) || 0) +
      (Number(summary.RESOLVED) || 0) +
      (Number(summary.REJECTED) || 0) +
      (Number(summary.CLOSED) || 0)
    : 0;

  const cards = [
    {
      name: "Pending",
      count: summary?.PENDING || 0,
      color: "bg-amber-50 text-amber-700 border-amber-200",
      href: "/technician/requests/pending",
    },
    {
      name: "In Progress",
      count: summary?.IN_PROGRESS || 0,
      color: "bg-blue-50 text-blue-700 border-blue-200",
      href: "/technician/requests/in-progress",
    },
    {
      name: "Resolved",
      count: summary?.RESOLVED || 0,
      color: "bg-green-50 text-green-700 border-green-200",
      href: "/technician/requests/resolved",
    },
    {
      name: "Rejected",
      count: summary?.REJECTED || 0,
      color: "bg-red-50 text-red-700 border-red-200",
      href: "/technician/requests/rejected",
    },
    {
      name: "Closed",
      count: summary?.CLOSED || 0,
      color: "bg-gray-50 text-gray-700 border-gray-200",
      href: "/technician/requests/closed",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 mt-1">
          Overview of your assigned service requests.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {cards.map((card) => (
          <Link
            key={card.name}
            href={card.href}
            className={`group block p-6 rounded-2xl border transition-all hover:shadow-md active:scale-95 ${card.color}`}
          >
            <p className="text-sm font-semibold uppercase tracking-wider opacity-80">
              {card.name}
            </p>
            <p className="text-4xl font-bold mt-2">{card.count}</p>
            <div className="mt-4 flex items-center text-xs font-bold gap-1 group-hover:gap-2 transition-all">
              VIEW LIST
              <span>&rarr;</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Workload Summary</h3>
          <p className="text-sm text-gray-500 mt-1">
            Total requests currently in the system assigned to you.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Total Assigned
          </p>
          <p className="text-5xl font-black text-blue-600 mt-1">{total}</p>
        </div>
      </div>
    </div>
  );
}
