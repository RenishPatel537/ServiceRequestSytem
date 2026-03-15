import { getAuthSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import { TechnicianForm } from "@/components/admin/technician-form";
import { prisma } from "@/lib/prisma";

export default async function EditTechnicianPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getAuthSession();

    const { id } = await params;

    const [mapping, requestTypes, staffList] = await Promise.all([
        prisma.servicerequesttypewiseperson.findUnique({
            where: { servicerequesttypewisepersonid: Number(id) }
        }),
        prisma.servicerequesttype.findMany({ orderBy: { servicerequesttypename: 'asc' } }),
        prisma.staff.findMany({ where: { isactive: true }, orderBy: { fullname: 'asc' } })
    ]);

    if (!mapping) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Edit Technician Mapping
            </h1>
            <TechnicianForm
                requestTypes={requestTypes}
                staffList={staffList}
                initialData={mapping}
                isEdit={true}
            />
        </div>
    );
}
