import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getAuthSession();
        if (!session || !session.roles.includes("ADMIN")) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const mappings = await prisma.userstaff.findMany({
            include: {
                User: {
                    select: {
                        userid: true,
                        username: true,
                    }
                },
                staff: {
                    select: {
                        staffid: true,
                        staffcode: true,
                        fullname: true,
                    }
                }
            },
            orderBy: { userstaffid: "desc" }
        });

        return NextResponse.json(mappings);
    } catch (error) {
        console.error("[USER_STAFF_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getAuthSession();
        if (!session || !session.roles.includes("ADMIN")) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { userid, staffid } = body;

        if (!userid || !staffid) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Check if mapping already exists
        const existing = await prisma.userstaff.findFirst({
            where: {
                OR: [
                    { userid: Number(userid) },
                    { staffid: Number(staffid) }
                ]
            }
        });

        if (existing) {
            return new NextResponse("User or Staff already mapped", { status: 400 });
        }

        const mapping = await prisma.userstaff.create({
            data: {
                userid: Number(userid),
                staffid: Number(staffid),
            },
        });

        return NextResponse.json(mapping);
    } catch (error) {
        console.error("[USER_STAFF_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
