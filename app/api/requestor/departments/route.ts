import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const auth = await requireAuth(req, ["REQUESTOR", "ADMIN"]);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const departments = await prisma.servicedept.findMany({
            orderBy: { servicedeptname: "asc" },
        });

        return NextResponse.json(departments);
    } catch (error) {
        console.error("Error fetching departments:", error);
        return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 });
    }
}
