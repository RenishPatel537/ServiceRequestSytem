import { getAuthSession } from "@/lib/auth";

export default async function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">
        Admin Dashboard
      </h1>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-gray-500">
          Welcome back,{" "}
          <span className="font-medium text-gray-900">{"user"}</span>.
        </p>
        <p className="mt-2 text-sm text-gray-400">
          Select a module from the sidebar to manage system data.
        </p>
      </div>
    </div>
  );
}
