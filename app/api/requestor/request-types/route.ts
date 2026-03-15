import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const auth = await requireAuth(req, ["REQUESTOR", "ADMIN"]);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const { searchParams } = new URL(req.url);
        const serviceTypeId = searchParams.get("serviceTypeId");
        const departmentId = searchParams.get("departmentId");

        // If no serviceTypeId or departmentId is provided, fetch all request types
        if (!serviceTypeId && !departmentId) {
            const requestTypes = await prisma.servicerequesttype.findMany({
                orderBy: { servicerequesttypename: "asc" },
            });
            return NextResponse.json(requestTypes);
        }

        const requestTypes = await prisma.servicerequesttype.findMany({
            where: {
                ...(serviceTypeId ? { servicetypeid: Number(serviceTypeId) } : {}),
                ...(departmentId ? { servicedeptid: Number(departmentId) } : {}),
            },
            orderBy: { servicerequesttypename: "asc" },
        });

        return NextResponse.json(requestTypes);
    } catch (error) {
        console.error("Error fetching request types:", error);
        return NextResponse.json({ error: "Failed to fetch request types" }, { status: 500 });
    }
}
