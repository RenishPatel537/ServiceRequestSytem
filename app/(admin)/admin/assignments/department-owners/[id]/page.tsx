import { getAuthSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import { DeptOwnerForm } from "@/components/admin/dept-owner-form";
import { prisma } from "@/lib/prisma";

export default async function EditDepartmentOwnerPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getAuthSession();

    const { id } = await params;

    const [mapping, departments, staffList] = await Promise.all([
        prisma.servicedeptperson.findUnique({
            where: { servicedeptpersonid: Number(id) }
        }),
        prisma.servicedept.findMany({ orderBy: { servicedeptname: 'asc' } }),
        prisma.staff.findMany({ where: { isactive: true }, orderBy: { fullname: 'asc' } })
    ]);

    if (!mapping) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Edit Department Owner Mapping
            </h1>
            <DeptOwnerForm
                departments={departments}
                staffList={staffList}
                initialData={mapping}
                isEdit={true}
            />
        </div>
    );
}
