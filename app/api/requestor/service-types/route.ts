import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const auth = await requireAuth(req, ["REQUESTOR", "ADMIN"]);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const serviceTypes = await prisma.servicetype.findMany({
            orderBy: { servicetypename: "asc" },
        });

        return NextResponse.json(serviceTypes);
    } catch (error) {
        console.error("Error fetching service types:", error);
        return NextResponse.json({ error: "Failed to fetch service types" }, { status: 500 });
    }
}
