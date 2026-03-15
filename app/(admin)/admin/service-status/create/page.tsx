import { getAuthSession } from "@/lib/auth";
import { StatusForm } from "@/components/admin/status-form";

export default async function CreateStatusPage() {
    const session = await getAuthSession();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Create Service Status
            </h1>
            <StatusForm />
        </div>
    );
}
