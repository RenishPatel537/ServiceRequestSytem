import { DepartmentForm } from "@/components/admin/department-form";

export default async function CreateDepartmentPage() {

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Create Service Department
            </h1>
            <DepartmentForm />
        </div>
    );
}
