import { getAuthSession } from "@/lib/auth";
import { StaffForm } from "@/components/admin/staff-form";
import { prisma } from "@/lib/prisma";

export default async function CreateStaffPage() {
    const session = await getAuthSession();

    const departments = await prisma.servicedept.findMany({ orderBy: { servicedeptname: 'asc' } });

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Create Staff
            </h1>
            <StaffForm departments={departments} />
        </div>
    );
}
