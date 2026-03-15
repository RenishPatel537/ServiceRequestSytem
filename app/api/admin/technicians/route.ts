import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET all request type technicians
export async function GET(req: NextRequest) {
    try {
        const auth = await requireAuth(req, ["ADMIN"]);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const technicians = await prisma.servicerequesttypewiseperson.findMany({
            include: {
                servicerequesttype: true,
                staff: true,
                User: {
                    select: { username: true }
                }
            },
            orderBy: { createdat: "desc" },
        });
        return NextResponse.json(technicians);
    } catch (error) {
        console.error("Error fetching technicians:", error);
        return NextResponse.json({ error: "Failed to fetch technicians" }, { status: 500 });
    }
}

// POST create technician mapping
export async function POST(req: NextRequest) {
    try {
        const auth = await requireAuth(req, ["ADMIN"]);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const body = await req.json();
        const { servicerequesttypeid, staffid, fromdate, todate, description } = body;

        if (!servicerequesttypeid || !staffid || !fromdate) {
            return NextResponse.json(
                { error: "Request Type, Staff, and From Date are required" },
                { status: 400 }
            );
        }

        // Prevent duplicate ACTIVE mapping for same RequestType + Staff
        const existingActive = await prisma.servicerequesttypewiseperson.findFirst({
            where: {
                servicerequesttypeid: Number(servicerequesttypeid),
                staffid: Number(staffid),
                OR: [
                    { todate: null },
                    { todate: { gt: new Date() } }
                ]
            }
        });

        if (existingActive) {
            return NextResponse.json(
                { error: "An active mapping already exists for this staff in this request type" },
                { status: 400 }
            );
        }

        const newMapping = await prisma.servicerequesttypewiseperson.create({
            data: {
                servicerequesttypeid: Number(servicerequesttypeid),
                staffid: Number(staffid),
                fromdate: new Date(fromdate),
                todate: todate ? new Date(todate) : null,
                description,
                createdbyuserid: auth.userId,
                createdat: new Date(),
                modifiedat: new Date(),
            },
        });

        return NextResponse.json(newMapping, { status: 201 });
    } catch (error) {
        console.error("Error creating technician mapping:", error);
        return NextResponse.json({ error: "Failed to create technician mapping" }, { status: 500 });
    }
}

// PUT update technician mapping (ToDate / Description only)
export async function PUT(req: NextRequest) {
    try {
        const auth = await requireAuth(req, ["ADMIN"]);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const body = await req.json();
        const { servicerequesttypewisepersonid, todate, description } = body;

        if (!servicerequesttypewisepersonid) {
            return NextResponse.json({ error: "Mapping ID is required" }, { status: 400 });
        }

        const updatedMapping = await prisma.servicerequesttypewiseperson.update({
            where: { servicerequesttypewisepersonid: Number(servicerequesttypewisepersonid) },
            data: {
                todate: todate ? new Date(todate) : null,
                description,
                modifiedat: new Date(),
            },
        });

        return NextResponse.json(updatedMapping);
    } catch (error) {
        console.error("Error updating technician mapping:", error);
        return NextResponse.json({ error: "Failed to update technician mapping" }, { status: 500 });
    }
}
