import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const session = await getAuthSession();
        if (!session || !session.roles.includes("ADMIN")) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const mapping = await prisma.userstaff.delete({
            where: {
                userstaffid: Number(id),
            },
        });

        return NextResponse.json(mapping);
    } catch (error) {
        console.error("[USER_STAFF_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
