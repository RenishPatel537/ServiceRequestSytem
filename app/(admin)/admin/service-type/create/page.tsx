import { getAuthSession } from "@/lib/auth";
import { ServiceTypeForm } from "@/components/admin/service-type-form";

export default async function CreateServiceTypePage() {
    const session = await getAuthSession();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Create Service Type
            </h1>
            <ServiceTypeForm />
        </div>
    );
}
