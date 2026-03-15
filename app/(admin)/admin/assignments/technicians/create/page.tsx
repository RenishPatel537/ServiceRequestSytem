import { getAuthSession } from "@/lib/auth";
import { TechnicianForm } from "@/components/admin/technician-form";
import { prisma } from "@/lib/prisma";

export default async function CreateTechnicianPage() {
    const session = await getAuthSession();

    const [requestTypes, staffList] = await Promise.all([
        prisma.servicerequesttype.findMany({ orderBy: { servicerequesttypename: 'asc' } }),
        prisma.staff.findMany({ where: { isactive: true }, orderBy: { fullname: 'asc' } })
    ]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Add Technician
            </h1>
            <TechnicianForm requestTypes={requestTypes} staffList={staffList} />
        </div>
    );
}
