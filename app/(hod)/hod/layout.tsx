"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import React from "react";

export default function HodLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  const menuItems = [
    { name: "Dashboard", path: "/hod/dashboard" },
    { name: "Pending", path: "/hod/requests/pending" },
    { name: "In Progress", path: "/hod/requests/in-progress" },
    { name: "Resolved", path: "/hod/requests/resolved" },
    { name: "Rejected", path: "/hod/requests/rejected" },
    { name: "Closed", path: "/hod/requests/closed" },
    { name: "Team", path: "/hod/team" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Left Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 w-64 border-r border-gray-200 bg-gray-100 dark:bg-gray-100 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0">
        <div className="flex h-16 shrink-0 items-center justify-center border-b border-gray-200 px-6">
          <span className="text-xl font-bold tracking-tight text-gray-900">
            HOD Panel
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.path || pathname?.startsWith(`${item.path}/`);

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white text-blue-700 shadow-sm ring-1 ring-gray-200"
                    : "text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex flex-1 flex-col md:pl-64 transition-all duration-300">
        {/* Top Navbar */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
          <h1 className="text-lg font-semibold text-gray-800">HOD Panel</h1>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600">HOD User</span>
            <button
              className="rounded px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors border border-transparent hover:border-red-100"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-8">
          <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
