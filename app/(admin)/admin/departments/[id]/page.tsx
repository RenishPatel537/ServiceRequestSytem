import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DepartmentForm } from "@/components/admin/department-form";

export default async function EditDepartmentPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {

    const { id } = await params;
    if (!id) notFound();

    const dept = await prisma.servicedept.findUnique({
        where: { servicedeptid: Number(id) },
    });

    if (!dept) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Edit Service Department
            </h1>
            <DepartmentForm initialData={dept} isEdit />
        </div>
    );
}
