import { getAuthSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserForm } from "@/components/admin/user-form";

export default async function EditUserPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await getAuthSession();

    const { id } = await params;
    if (!id) notFound();

    const [user, roles, staffList] = await Promise.all([
        prisma.user.findUnique({
            where: { userid: Number(id) },
            include: {
                userrole: true,
                userstaff: true
            }
        }),
        prisma.role.findMany({ orderBy: { rolename: 'asc' } }),
        prisma.staff.findMany({
            where: { isactive: true },
            orderBy: { fullname: 'asc' }
        }),
    ]);

    if (!user) {
        notFound();
    }

    const initialData = {
        ...user,
        roleIds: user.userrole.map(ur => ur.roleid),
        staffId: user.userstaff[0]?.staffid
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Edit User
            </h1>
            <UserForm initialData={initialData} roles={roles} staffList={staffList} isEdit />
        </div>
    );
}
