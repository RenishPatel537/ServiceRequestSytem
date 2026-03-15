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

        const types = await prisma.servicerequesttype.findMany({
            include: {
                servicedept: true,
                servicetype: true,
            },
            orderBy: { servicerequesttypename: "asc" },
        });
        return NextResponse.json(types);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch request types" }, { status: 500 });
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
        const {
            servicerequesttypename,
            servicetypeid,
            servicedeptid,
            description,
            defaultprioritylevel,
            reminderdaysafterassignment,
            ismandatoryresource,
            isvisibleresource,
        } = body;

        if (!servicerequesttypename || !servicetypeid || !servicedeptid) {
            return NextResponse.json(
                { error: "Name, Department, and Service Type are required" },
                { status: 400 }
            );
        }

        const newType = await prisma.servicerequesttype.create({
            data: {
                servicerequesttypename,
                servicetypeid: Number(servicetypeid),
                servicedeptid: Number(servicedeptid),
                description,
                defaultprioritylevel,
                reminderdaysafterassignment: reminderdaysafterassignment ? Number(reminderdaysafterassignment) : null,
                ismandatoryresource: ismandatoryresource || false,
                isvisibleresource: isvisibleresource !== undefined ? isvisibleresource : true,
                createdbyuserid: auth.userId,
                createdat: new Date(),
                modifiedat: new Date(),
            },
        });

        return NextResponse.json(newType, { status: 201 });
    } catch (error) {
        console.error("Error creating request type:", error);
        return NextResponse.json({ error: "Failed to create request type" }, { status: 500 });
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
        const {
            servicerequesttypeid,
            servicerequesttypename,
            servicetypeid,
            servicedeptid,
            description,
            defaultprioritylevel,
            reminderdaysafterassignment,
            ismandatoryresource,
            isvisibleresource,
        } = body;

        if (!servicerequesttypeid || !servicerequesttypename) {
            return NextResponse.json({ error: "ID and Name are required" }, { status: 400 });
        }

        const updatedType = await prisma.servicerequesttype.update({
            where: { servicerequesttypeid: Number(servicerequesttypeid) },
            data: {
                servicerequesttypename,
                servicetypeid: Number(servicetypeid),
                servicedeptid: Number(servicedeptid),
                description,
                defaultprioritylevel,
                reminderdaysafterassignment: reminderdaysafterassignment ? Number(reminderdaysafterassignment) : null,
                ismandatoryresource: ismandatoryresource || false,
                isvisibleresource: isvisibleresource !== undefined ? isvisibleresource : true,
                modifiedat: new Date(),
            },
        });

        return NextResponse.json(updatedType);
    } catch (error) {
        console.error("Error updating request type:", error);
        return NextResponse.json({ error: "Failed to update request type" }, { status: 500 });
    }
}

// DELETE
export async function DELETE(req: NextRequest) {
    return NextResponse.json(
        { error: "Deletion is not allowed." },
        { status: 400 }
    );
}
