import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(req, ["TECHNICIAN"]);
  if (!auth.success)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await context.params;

  const requestId = Number(id);

  try {
    const request = await prisma.servicerequest.findUnique({
      where: { servicerequestid: requestId },
      include: {
        servicerequeststatus: true,
        requesterStaff: true,
        User: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Must be assigned to this technician
    if (request.assignedtostaffid !== auth.staffId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(request);
  } catch (error) {
    console.error("Error fetching technician request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
