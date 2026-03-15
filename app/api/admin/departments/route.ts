import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET all departments
export async function GET(req: NextRequest) {
    try {
        const auth = await requireAuth(req, ["ADMIN"]);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const departments = await prisma.servicedept.findMany({
            orderBy: { servicedeptname: "asc" }, // Ordered by name for better UX
            include: {
                User: {
                    select: {
                        username: true
                    }
                }
            }
        });
        return NextResponse.json(departments);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 });
    }
}

// POST create department
export async function POST(req: NextRequest) {
    try {
        const auth = await requireAuth(req, ["ADMIN"]);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const body = await req.json();
        const { servicedeptname, description } = body;

        if (!servicedeptname) {
            return NextResponse.json(
                { error: "Department Name is required" },
                { status: 400 }
            );
        }

        if (servicedeptname.length > 250) {
            return NextResponse.json(
                { error: "Department Name is too long (max 250 chars)" },
                { status: 400 }
            );
        }

        // Check for duplicate name
        const existing = await prisma.servicedept.findFirst({
            where: { servicedeptname: { equals: servicedeptname, mode: "insensitive" } }
        });

        if (existing) {
            return NextResponse.json(
                { error: "Department with this name already exists" },
                { status: 409 }
            );
        }

        const newDept = await prisma.servicedept.create({
            data: {
                servicedeptname,
                description,
                createdbyuserid: auth.userId,
                createdat: new Date(),
                modifiedat: new Date(),
            },
        });

        return NextResponse.json(newDept, { status: 201 });
    } catch (error) {
        console.error("Error creating department:", error);
        return NextResponse.json({ error: "Failed to create department" }, { status: 500 });
    }
}

// PUT update department
export async function PUT(req: NextRequest) {
    try {
        const auth = await requireAuth(req, ["ADMIN"]);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const body = await req.json();
        const { servicedeptid, servicedeptname, description } = body;

        if (!servicedeptid || !servicedeptname) {
            return NextResponse.json(
                { error: "ID and Name are required" },
                { status: 400 }
            );
        }

        if (servicedeptname.length > 250) {
            return NextResponse.json(
                { error: "Department Name is too long (max 250 chars)" },
                { status: 400 }
            );
        }

        // Check for duplicate name (excluding self)
        const existing = await prisma.servicedept.findFirst({
            where: {
                servicedeptname: { equals: servicedeptname, mode: "insensitive" },
                servicedeptid: { not: Number(servicedeptid) }
            }
        });

        if (existing) {
            return NextResponse.json(
                { error: "Department with this name already exists" },
                { status: 409 }
            );
        }

        const updatedDept = await prisma.servicedept.update({
            where: { servicedeptid: Number(servicedeptid) },
            data: {
                servicedeptname,
                description,
                modifiedat: new Date(),
            },
        });

        return NextResponse.json(updatedDept);
    } catch (error) {
        console.error("Error updating department:", error);
        return NextResponse.json({ error: "Failed to update department" }, { status: 500 });
    }
}

// DELETE department (Hard Delete)
export async function DELETE(req: NextRequest) {
    try {
        const auth = await requireAuth(req, ["ADMIN"]);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        try {
            await prisma.servicedept.delete({
                where: { servicedeptid: Number(id) }
            });
        } catch (e: any) {
            // Check if foreign key constraint code (P2003)
            if (e.code === 'P2003') {
                return NextResponse.json({ error: "Cannot delete: This department is used in other records." }, { status: 400 });
            }
            throw e;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting department:", error);
        return NextResponse.json({ error: "Failed to delete department" }, { status: 500 });
    }
}
