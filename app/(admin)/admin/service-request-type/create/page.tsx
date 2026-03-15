import { getAuthSession } from "@/lib/auth";
import { RequestTypeForm } from "@/components/admin/request-type-form";
import { prisma } from "@/lib/prisma";

export default async function CreateRequestTypePage() {

    const [departments, serviceTypes] = await Promise.all([
        prisma.servicedept.findMany({ orderBy: { servicedeptname: 'asc' } }),
        prisma.servicetype.findMany({ orderBy: { servicetypename: 'asc' } })
    ]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Create Request Type
            </h1>
            <RequestTypeForm departments={departments} serviceTypes={serviceTypes} />
        </div>
    );
}
