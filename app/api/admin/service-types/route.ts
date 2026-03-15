import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET all
export async function GET(req: NextRequest) {
    try {
        const auth = await requireAuth(req, ["ADMIN"]);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const types = await prisma.servicetype.findMany({
            orderBy: { servicetypename: "asc" },
            include: {
                User: {
                    select: {
                        username: true
                    }
                }
            }
        });
        return NextResponse.json(types);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch service types" }, { status: 500 });
    }
}

// POST
export async function POST(req: NextRequest) {
    try {
        const auth = await requireAuth(req, ["ADMIN"]);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const body = await req.json();
        const { servicetypename, isforstaff, isforstudent } = body;

        if (!servicetypename) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const newType = await prisma.servicetype.create({
            data: {
                servicetypename,
                isforstaff: isforstaff !== undefined ? isforstaff : true,
                isforstudent: isforstudent || false,
                createdbyuserid: auth.userId,
                createdat: new Date(),
                modifiedat: new Date(),
            },
        });

        return NextResponse.json(newType, { status: 201 });
    } catch (error) {
        console.error("Error creating service type:", error);
        return NextResponse.json({ error: "Failed to create service type" }, { status: 500 });
    }
}

// PUT
export async function PUT(req: NextRequest) {
    try {
        const auth = await requireAuth(req, ["ADMIN"]);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const body = await req.json();
        const { servicetypeid, servicetypename, isforstaff, isforstudent } = body;

        if (!servicetypeid || !servicetypename) {
            return NextResponse.json({ error: "ID and Name are required" }, { status: 400 });
        }

        const updatedType = await prisma.servicetype.update({
            where: { servicetypeid: Number(servicetypeid) },
            data: {
                servicetypename,
                isforstaff: isforstaff !== undefined ? isforstaff : true,
                isforstudent: isforstudent || false,
                modifiedat: new Date(),
            },
        });

        return NextResponse.json(updatedType);
    } catch (error) {
        console.error("Error updating service type:", error);
        return NextResponse.json({ error: "Failed to update service type" }, { status: 500 });
    }
}

// DELETE
export async function DELETE(req: NextRequest) {
    return NextResponse.json(
        { error: "Deletion is not allowed." },
        { status: 400 }
    );
}
