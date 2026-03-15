import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { RoleForm } from "@/components/admin/role-form";
import { Icons } from "@/components/ui/icons";
import Link from "next/link";

export default async function EditRolePage({ params }: { params: Promise<{ id: string }> }) {

    const { id } = await params;
    const roleId = Number(id);

    if (isNaN(roleId)) {
        notFound();
    }

    const role = await prisma.role.findUnique({
        where: { roleid: roleId },
    });

    if (!role) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/roles"
                    className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                >
                    <Icons.ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                    Edit Role: {role.rolename}
                </h1>
            </div>

            <RoleForm initialData={role} isEdit />
        </div>
    );
}
