import { getAuthSession } from "@/lib/auth";
import { UserForm } from "@/components/admin/user-form";
import { prisma } from "@/lib/prisma";

export default async function CreateUserPage() {
    const session = await getAuthSession();

    const [roles, staffList] = await Promise.all([
        prisma.role.findMany({ orderBy: { rolename: 'asc' } }),
        prisma.staff.findMany({
            where: { isactive: true },
            orderBy: { fullname: 'asc' }
        }),
    ]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Create User
            </h1>
            <UserForm roles={roles} staffList={staffList} />
        </div>
    );
}
