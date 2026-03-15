import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET all staff
export async function GET(req: NextRequest) {
    try {
        const auth = await requireAuth(req, ["ADMIN"]);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const staff = await prisma.staff.findMany({
            where: {
                isactive: true,
            },
            include: {
                servicedeptperson: {
                    where: { todate: null }, // Get active department assignment
                    include: {
                        servicedept: true,
                    },
                },
            },
            orderBy: { staffid: "asc" },
        });
        return NextResponse.json(staff);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 });
    }
}

// POST create staff
export async function POST(req: NextRequest) {
    try {
        const auth = await requireAuth(req, ["ADMIN"]);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const body = await req.json();
        const { fullname, staffcode, email, mobile, servicedeptid, description } = body;

        if (!fullname || !staffcode || !servicedeptid) {
            return NextResponse.json(
                { error: "Full Name, Staff Code, and Department are required" },
                { status: 400 }
            );
        }

        // Transaction to create staff and assign department
        const newStaff = await prisma.$transaction(async (tx) => {
            const staff = await tx.staff.create({
                data: {
                    fullname,
                    staffcode,
                    email,
                    mobile,
                    isactive: true,
                    createdat: new Date(),
                },
            });

            // Create department assignment
            await tx.servicedeptperson.create({
                data: {
                    servicedeptid: Number(servicedeptid),
                    staffid: staff.staffid,
                    fromdate: new Date(), // Active from now
                    description,
                    createdbyuserid: auth.userId,
                    createdat: new Date(),
                    modifiedat: new Date(),
                },
            });

            return staff;
        });

        return NextResponse.json(newStaff, { status: 201 });
    } catch (error: any) {
        console.error("Error creating staff:", error);
        if (error.code === 'P2002') { // Unique constraint
            return NextResponse.json({ error: "Staff Code already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create staff" }, { status: 500 });
    }
}

// PUT update staff
export async function PUT(req: NextRequest) {
    try {
        const auth = await requireAuth(req, ["ADMIN"]);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const body = await req.json();
        const { staffid, fullname, staffcode, email, mobile, servicedeptid, description } = body;

        if (!staffid || !fullname || !staffcode) {
            return NextResponse.json(
                { error: "Staff ID, Name and Code are required" },
                { status: 400 }
            );
        }

        // Update staff and handle department change
        const updatedStaff = await prisma.$transaction(async (tx) => {
            const staff = await tx.staff.update({
                where: { staffid: Number(staffid) },
                data: {
                    fullname,
                    staffcode,
                    email,
                    mobile,
                },
            });

            // Handle Department Change
            if (servicedeptid) {
                // Find active department assignment
                const currentDeptPerson = await tx.servicedeptperson.findFirst({
                    where: {
                        staffid: Number(staffid),
                        todate: null,
                    },
                });

                if (currentDeptPerson) {
                    if (currentDeptPerson.servicedeptid !== Number(servicedeptid)) {
                        // Close old assignment
                        await tx.servicedeptperson.update({
                            where: { servicedeptpersonid: currentDeptPerson.servicedeptpersonid },
                            data: { todate: new Date(), modifiedat: new Date() },
                        });

                        // Create new assignment
                        await tx.servicedeptperson.create({
                            data: {
                                servicedeptid: Number(servicedeptid),
                                staffid: Number(staffid),
                                fromdate: new Date(),
                                description,
                                createdbyuserid: auth.userId,
                                createdat: new Date(),
                                modifiedat: new Date(),
                            },
                        });
                    } else {
                        // Check if description updated?
                        if (description !== undefined && description !== currentDeptPerson.description) {
                            await tx.servicedeptperson.update({
                                where: { servicedeptpersonid: currentDeptPerson.servicedeptpersonid },
                                data: { description, modifiedat: new Date() }
                            });
                        }
                    }
                } else {
                    // No active assignment, create one
                    await tx.servicedeptperson.create({
                        data: {
                            servicedeptid: Number(servicedeptid),
                            staffid: Number(staffid),
                            fromdate: new Date(),
                            description,
                            createdbyuserid: auth.userId,
                            createdat: new Date(),
                            modifiedat: new Date(),
                        },
                    });
                }
            }

            return staff;
        });

        return NextResponse.json(updatedStaff);
    } catch (error: any) {
        console.error("Error updating staff:", error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Staff Code already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to update staff" }, { status: 500 });
    }
}

// DELETE staff (Soft Delete)
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

        await prisma.staff.update({
            where: { staffid: Number(id) },
            data: { isactive: false },
        });

        // Also close department assignment?
        // Good practice:
        await prisma.servicedeptperson.updateMany({
            where: { staffid: Number(id), todate: null },
            data: { todate: new Date(), modifiedat: new Date() }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting staff:", error);
        return NextResponse.json({ error: "Failed to delete staff" }, { status: 500 });
    }
}
