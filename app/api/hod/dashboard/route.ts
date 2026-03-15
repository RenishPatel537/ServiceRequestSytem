import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const auth = await requireAuth(req, ["HOD"]);
    if (!auth.success) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    if (!auth.staffId) {
        return NextResponse.json({ error: "Not in Staff Member" }, { status: 403 });
    }

    const deptPerson = await prisma.servicedeptperson.findFirst({
        where: {
            staffid: auth.staffId,
            todate: null,
        },
    });

    if (!deptPerson) {
        return NextResponse.json(
            { error: "Department not found" },
            { status: 404 }
        );
    }

    const statuses = await prisma.servicerequeststatus.findMany();

    const statusMap = statuses.reduce((acc, status) => {
        acc[status.servicerequeststatusname] = status.servicerequeststatusid;
        return acc;
    }, {} as Record<string, number>);

    const countsRaw = await prisma.servicerequest.groupBy({
        by: ["servicerequeststatusid"],
        where: {
            servicerequesttype: {
                servicedeptid: deptPerson.servicedeptid,
            },
        },
        _count: {
            servicerequestid: true,
        },
    });

    const getCount = (statusName: string) => {
        const id = statusMap[statusName];
        const item = countsRaw.find((c) => c.servicerequeststatusid === id);
        return item ? item._count.servicerequestid : 0;
    };

    const pending = getCount("PENDING");
    const inProgress = getCount("IN_PROGRESS");
    const resolved = getCount("RESOLVED");
    const rejected = getCount("REJECTED");
    const closed = getCount("CLOSED");
    const total = pending + inProgress + resolved + rejected + closed;

    return NextResponse.json({
        pending,
        inProgress,
        resolved,
        rejected,
        closed,
        total,
    });
}
