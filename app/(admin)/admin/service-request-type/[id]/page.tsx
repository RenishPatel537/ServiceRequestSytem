import { getAuthSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RequestTypeForm } from "@/components/admin/request-type-form";

export default async function EditRequestTypePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await getAuthSession();

    const { id } = await params;
    if (!id) notFound();

    const [type, departments, serviceTypes] = await Promise.all([
        prisma.servicerequesttype.findUnique({ where: { servicerequesttypeid: Number(id) } }),
        prisma.servicedept.findMany({ orderBy: { servicedeptname: 'asc' } }),
        prisma.servicetype.findMany({ orderBy: { servicetypename: 'asc' } })
    ]);

    if (!type) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Edit Request Type
            </h1>
            <RequestTypeForm initialData={type} departments={departments} serviceTypes={serviceTypes} isEdit />
        </div>
    );
}
