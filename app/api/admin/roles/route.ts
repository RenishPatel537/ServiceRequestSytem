import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// System roles that cannot be renamed
const SYSTEM_ROLES = ["ADMIN", "REQUESTOR", "TECHNICIAN", "HOD"];

export async function GET(req: NextRequest) {
    try {
        const auth = await requireAuth(req, ["ADMIN"]);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const roles = await prisma.role.findMany({
            orderBy: { roleid: "asc" },
        });

        return NextResponse.json(roles);
    } catch (error) {
        console.error("Error fetching roles:", error);
        return NextResponse.json(
            { error: "Failed to fetch roles" },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const auth = await requireAuth(req, ["ADMIN"]);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const body = await req.json();
        const { roleid, rolename, description } = body;

        if (!roleid || !rolename) {
            return NextResponse.json({ error: "Role ID and Name are required" }, { status: 400 });
        }

        // Check if it's a system role
        const existingRole = await prisma.role.findUnique({
            where: { roleid: Number(roleid) },
        });

        if (!existingRole) {
            return NextResponse.json({ error: "Role not found" }, { status: 404 });
        }

        // Prevent renaming system roles
        // We compare case-insensitively just to be safe, though strict match is better
        const isSystemRole = SYSTEM_ROLES.includes(existingRole.rolename);

        if (isSystemRole && existingRole.rolename !== rolename) {
            return NextResponse.json(
                { error: `Cannot rename system role: ${existingRole.rolename}` },
                { status: 403 }
            );
        }

        const updatedRole = await prisma.role.update({
            where: { roleid: Number(roleid) },
            data: {
                rolename,
                description,
            },
        });

        return NextResponse.json(updatedRole);
    } catch (error) {
        console.error("Error updating role:", error);
        return NextResponse.json(
            { error: "Failed to update role" },
            { status: 500 }
        );
    }
}
