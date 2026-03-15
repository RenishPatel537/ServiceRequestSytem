import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { Icons } from "@/components/ui/icons";
import { DeleteButton } from "@/components/admin/delete-button";
import { DetailButton } from "@/components/admin/detail-button";

async function getUsers() {
    return await prisma.user.findMany({
        where: { isactive: true },
        include: {
            userrole: {
                include: { role: true },
            },
            userstaff: {
                include: { staff: true },
            },
        },
        orderBy: { userid: "asc" },
    });
}

export default async function UsersPage() {
    const session = await getAuthSession();

    const users = await getUsers();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                    User Management
                </h1>
                <Link
                    href="/admin/users/create"
                    className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    <Icons.Plus className="h-4 w-4" />
                    Add User
                </Link>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Username
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Roles
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Linked Staff
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No users found.
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => {
                                const roles = user.userrole.map(ur => ur.role.rolename).join(", ");
                                const staffName = user.userstaff[0]?.staff?.fullname || "-";
                                return (
                                    <tr key={user.userid} className="hover:bg-gray-50">
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                            {user.username}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div className="flex flex-wrap gap-1">
                                                {user.userrole.map(ur => (
                                                    <span key={ur.roleid} className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                                        {ur.role.rolename}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {staffName}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <DetailButton title="User" data={user} />
                                                <Link
                                                    href={`/admin/users/${user.userid}`}
                                                    className="text-blue-600 hover:text-blue-900 icon-btn"
                                                    title="Edit"
                                                >
                                                    <Icons.Edit className="h-4 w-4" />
                                                </Link>
                                                <DeleteButton
                                                    id={user.userid}
                                                    apiPath="/api/admin/users"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
