import { getAuthSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatusForm } from "@/components/admin/status-form";

export default async function EditStatusPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await getAuthSession();

    const { id } = await params;
    if (!id) notFound();

    const status = await prisma.servicerequeststatus.findUnique({
        where: { servicerequeststatusid: Number(id) },
    });

    if (!status) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Edit Service Status
            </h1>
            <StatusForm initialData={status} isEdit />
        </div>
    );
}
