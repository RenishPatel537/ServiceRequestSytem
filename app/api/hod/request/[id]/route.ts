import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Authenticate
        const auth = await requireAuth(req, ["HOD"]);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        if (!auth.staffId) {
            return NextResponse.json({ error: "Not in Staff Member" }, { status: 403 });
        }

        const { id } = await params;
        const requestId = parseInt(id);
        if (isNaN(requestId)) {
            return NextResponse.json({ error: "Invalid Request ID" }, { status: 400 });
        }

        // Get HOD department
        const deptPerson = await prisma.servicedeptperson.findFirst({
            where: {
                staffid: auth.staffId,
                todate: null, // active mapping
            },
        });

        if (!deptPerson) {
            return NextResponse.json(
                { error: "Department not found for this HOD" },
                { status: 404 }
            );
        }

        // Fetch Request with check for HOD's department
        const request = await prisma.servicerequest.findFirst({
            where: {
                servicerequestid: requestId,
                servicerequesttype: {
                    servicedeptid: deptPerson.servicedeptid,
                },
            },
            include: {
                servicerequesttype: true,
                servicerequeststatus: true,
                assignedStaff: true,
                requesterStaff: true,
                User: {
                    select: {
                        username: true,
                        email: true,
                    },
                },
            },
        });

        if (!request) {
            return NextResponse.json(
                { error: "Request not found or not in your department" },
                { status: 404 }
            );
        }

        return NextResponse.json(request);
    } catch (error) {
        console.error("Error fetching request details:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
