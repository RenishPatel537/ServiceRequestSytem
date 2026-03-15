"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function TechnicianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    { name: "Dashboard", href: "/technician/dashboard" },
    { name: "Pending", href: "/technician/requests/pending" },
    { name: "In Progress", href: "/technician/requests/in-progress" },
    { name: "Resolved", href: "/technician/requests/resolved" },
    { name: "Rejected", href: "/technician/requests/rejected" },
    { name: "Closed", href: "/technician/requests/closed" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="p-6">
          <h2 className="text-xl font-bold text-blue-600 tracking-tight">
            ServiceDesk
          </h2>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-semibold">
            Technician Panel
          </p>
        </div>
        <nav className="px-3 pb-6">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700 shadow-sm"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-gray-800">
              Technician Panel
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-gray-900">
                Technician User
              </span>
              <span className="text-xs text-gray-500">
                Service Professional
              </span>
            </div>
            <button
              className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors border-l pl-6 border-gray-200"
              onClick={() => {
                handleLogout();
              }}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="p-8 flex-1 overflow-y-auto">
          <div className="mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
