import { getAuthSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ServiceTypeForm } from "@/components/admin/service-type-form";

export default async function EditServiceTypePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await getAuthSession();

    const { id } = await params;
    if (!id) notFound();

    const type = await prisma.servicetype.findUnique({
        where: { servicetypeid: Number(id) },
    });

    if (!type) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Edit Service Type
            </h1>
            <ServiceTypeForm initialData={type} isEdit />
        </div>
    );
}
