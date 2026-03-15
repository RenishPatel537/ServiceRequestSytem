import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET all department owners
export async function GET(req: NextRequest) {
    try {
        const auth = await requireAuth(req, ["ADMIN"]);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const owners = await prisma.servicedeptperson.findMany({
            include: {
                servicedept: true,
                staff: true,
                User: {
                    select: { username: true }
                }
            },
            orderBy: { createdat: "desc" },
        });
        return NextResponse.json(owners);
    } catch (error) {
        console.error("Error fetching department owners:", error);
        return NextResponse.json({ error: "Failed to fetch department owners" }, { status: 500 });
    }
}

// POST create department owner mapping
export async function POST(req: NextRequest) {
    try {
        const auth = await requireAuth(req, ["ADMIN"]);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const body = await req.json();
        const { servicedeptid, staffid, fromdate, todate, description } = body;

        if (!servicedeptid || !staffid || !fromdate) {
            return NextResponse.json(
                { error: "Department, Staff, and From Date are required" },
                { status: 400 }
            );
        }

        // Prevent duplicate ACTIVE mapping for same ServiceDept + Staff
        const existingActive = await prisma.servicedeptperson.findFirst({
            where: {
                servicedeptid: Number(servicedeptid),
                staffid: Number(staffid),
                OR: [
                    { todate: null },
                    { todate: { gt: new Date() } }
                ]
            }
        });

        if (existingActive) {
            return NextResponse.json(
                { error: "An active mapping already exists for this staff in this department" },
                { status: 400 }
            );
        }

        const newMapping = await prisma.servicedeptperson.create({
            data: {
                servicedeptid: Number(servicedeptid),
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
        console.error("Error creating department owner:", error);
        return NextResponse.json({ error: "Failed to create department owner" }, { status: 500 });
    }
}

// PUT update department owner mapping (ToDate / Description only)
export async function PUT(req: NextRequest) {
    try {
        const auth = await requireAuth(req, ["ADMIN"]);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const body = await req.json();
        const { servicedeptpersonid, todate, description } = body;

        if (!servicedeptpersonid) {
            return NextResponse.json({ error: "Mapping ID is required" }, { status: 400 });
        }

        const updatedMapping = await prisma.servicedeptperson.update({
            where: { servicedeptpersonid: Number(servicedeptpersonid) },
            data: {
                todate: todate ? new Date(todate) : null,
                description,
                modifiedat: new Date(),
            },
        });

        return NextResponse.json(updatedMapping);
    } catch (error) {
        console.error("Error updating department owner:", error);
        return NextResponse.json({ error: "Failed to update department owner" }, { status: 500 });
    }
}
