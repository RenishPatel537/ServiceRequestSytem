import { getAuthSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StaffForm } from "@/components/admin/staff-form";

export default async function EditStaffPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await getAuthSession();

    const { id } = await params;
    if (!id) notFound();

    const [staff, departments] = await Promise.all([
        prisma.staff.findUnique({
            where: { staffid: Number(id) },
            include: {
                servicedeptperson: {
                    where: { todate: null } // Get active
                }
            }
        }),
        prisma.servicedept.findMany({ orderBy: { servicedeptname: 'asc' } })
    ]);

    if (!staff) {
        notFound();
    }

    // Flatten data for form
    const initialData = {
        ...staff,
        currentDeptId: staff.servicedeptperson[0]?.servicedeptid,
        currentDescription: staff.servicedeptperson[0]?.description
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Edit Staff
            </h1>
            <StaffForm initialData={initialData} departments={departments} isEdit />
        </div>
    );
}
