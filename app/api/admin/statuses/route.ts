import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET all statuses
export async function GET(req: NextRequest) {
    try {
        const auth = await requireAuth(req, ["ADMIN"]);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const statuses = await prisma.servicerequeststatus.findMany({
            orderBy: { servicerequeststatusname: "asc" },
            include: {
                User: {
                    select: {
                        username: true
                    }
                }
            }
        });
        return NextResponse.json(statuses);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch statuses" }, { status: 500 });
    }
}

// POST create status
export async function POST(req: NextRequest) {
    try {
        const auth = await requireAuth(req, ["ADMIN"]);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const body = await req.json();
        const { servicerequeststatusname, isactive } = body;

        if (!servicerequeststatusname) {
            return NextResponse.json(
                { error: "Status Name is required" },
                { status: 400 }
            );
        }

        if (servicerequeststatusname.length > 250) {
            return NextResponse.json(
                { error: "Status Name is too long (max 250 chars)" },
                { status: 400 }
            );
        }

        const existing = await prisma.servicerequeststatus.findFirst({
            where: { servicerequeststatusname: { equals: servicerequeststatusname, mode: "insensitive" } }
        });

        if (existing) {
            return NextResponse.json(
                { error: "Status with this name already exists" },
                { status: 409 }
            );
        }

        const newStatus = await prisma.servicerequeststatus.create({
            data: {
                servicerequeststatusname,
                isactive: isactive !== undefined ? isactive : true,
                createdbyuserid: auth.userId,
                createdat: new Date(),
                modifiedat: new Date(),
            },
        });

        return NextResponse.json(newStatus, { status: 201 });
    } catch (error) {
        console.error("Error creating status:", error);
        return NextResponse.json({ error: "Failed to create status" }, { status: 500 });
    }
}

// PUT update status
export async function PUT(req: NextRequest) {
    try {
        const auth = await requireAuth(req, ["ADMIN"]);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const body = await req.json();
        const { servicerequeststatusid, servicerequeststatusname, isactive } = body;

        if (!servicerequeststatusid || !servicerequeststatusname) {
            return NextResponse.json(
                { error: "ID and Name are required" },
                { status: 400 }
            );
        }

        if (servicerequeststatusname.length > 250) {
            return NextResponse.json(
                { error: "Status Name is too long (max 250 chars)" },
                { status: 400 }
            );
        }

        const existing = await prisma.servicerequeststatus.findFirst({
            where: {
                servicerequeststatusname: { equals: servicerequeststatusname, mode: "insensitive" },
                servicerequeststatusid: { not: Number(servicerequeststatusid) }
            }
        });

        if (existing) {
            return NextResponse.json(
                { error: "Status with this name already exists" },
                { status: 409 }
            );
        }

        const updatedStatus = await prisma.servicerequeststatus.update({
            where: { servicerequeststatusid: Number(servicerequeststatusid) },
            data: {
                servicerequeststatusname,
                isactive: isactive !== undefined ? isactive : true,
                modifiedat: new Date(),
            },
        });

        return NextResponse.json(updatedStatus);
    } catch (error) {
        console.error("Error updating status:", error);
        return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
    }
}

// DELETE status
export async function DELETE(request: Request) {
    return NextResponse.json(
        { error: "Deletion is not allowed. Please use the 'Is Active' toggle to disable the status." },
        { status: 400 }
    );
}
