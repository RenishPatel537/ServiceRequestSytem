import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { UserStaffForm } from "@/components/admin/user-staff-form";

async function getData() {
    const [users, staffList] = await Promise.all([
        prisma.user.findMany({
            where: { isactive: true },
            orderBy: { username: "asc" },
            select: { userid: true, username: true }
        }),
        prisma.staff.findMany({
            where: { isactive: true },
            orderBy: { fullname: "asc" },
            select: { staffid: true, staffcode: true, fullname: true }
        }),
    ]);
    return { users, staffList };
}

export default async function CreateUserStaffPage() {
    const session = await getAuthSession();
    const { users, staffList } = await getData();

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                    Create User-Staff Mapping
                </h1>
                <p className="text-sm text-gray-500">Select a login user and link them to their staff profile.</p>
            </div>

            <UserStaffForm users={users} staffList={staffList} />
        </div>
    );
}
