import { getAuthSession } from "@/lib/auth";
import { DeptOwnerForm } from "@/components/admin/dept-owner-form";
import { prisma } from "@/lib/prisma";

export default async function CreateDepartmentOwnerPage() {
    const session = await getAuthSession();

    const [departments, staffList] = await Promise.all([
        prisma.servicedept.findMany({ orderBy: { servicedeptname: 'asc' } }),
        prisma.staff.findMany({
            where: {
                isactive: true,
                userstaff: {
                    some: {
                        User: {
                            userrole: {
                                some: {
                                    role: {
                                        rolename: "HOD"
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { fullname: 'asc' }
        })
    ]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Add Department Owner
            </h1>
            <DeptOwnerForm departments={departments} staffList={staffList} />
        </div>
    );
}
