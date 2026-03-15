import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import bcrypt from "bcryptjs";

// GET all users
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req, ["ADMIN"]);
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const users = await prisma.user.findMany({
      where: {
        isactive: true,
      },
      include: {
        userrole: {
          include: { role: true },
        },
        userstaff: {
          include: { staff: true },
        },
      },
      orderBy: { userid: "asc" },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

// POST create user
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req, ["ADMIN"]);
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { username, email, password, roleIds, staffid } = body;

    if (!username || !email || !password || !roleIds || roleIds.length === 0) {
      return NextResponse.json(
        {
          error:
            "Username, Email, Password, and at least one Role are required",
        },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username,
          email,
          passwordhash: hashedPassword,
          isactive: true,
          createdat: new Date(),
        },
      });

      // Add roles
      for (const roleId of roleIds) {
        await tx.userrole.create({
          data: {
            userid: user.userid,
            roleid: Number(roleId),
            fromdate: new Date(),
          },
        });
      }

      // Add staff link if provided
      if (staffid) {
        await tx.userstaff.create({
          data: {
            userid: user.userid,
            staffid: Number(staffid),
          },
        });
      }

      return user;
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error("Error creating user:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}

// PUT update user
export async function PUT(req: NextRequest) {
  try {
    const auth = await requireAuth(req, ["ADMIN"]);
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { userid, username, email, password, roleIds, staffid, isactive } =
      body;

    if (!userid || !username || !email || !roleIds || roleIds.length === 0) {
      return NextResponse.json(
        {
          error: "User ID, Username, Email, and at least one Role are required",
        },
        { status: 400 },
      );
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      // Update basic info
      const updateData: any = {
        username,
        email,
        isactive: isactive !== undefined ? isactive : true, // Handle active toggle if passed
      };

      if (password) {
        updateData.passwordhash = await bcrypt.hash(password, 10);
      }

      const user = await tx.user.update({
        where: { userid: Number(userid) },
        data: updateData,
      });

      const currentRoles = await tx.userrole.findMany({
        where: { userid: Number(userid) },
      });
      await tx.userrole.deleteMany({ where: { userid: Number(userid) } }); // Replacing logic

      for (const roleId of roleIds) {
        await tx.userrole.create({
          data: {
            userid: user.userid,
            roleid: Number(roleId),
            fromdate: new Date(),
          },
        });
      }

      // Update Staff Link
      await tx.userstaff.deleteMany({ where: { userid: Number(userid) } });
      if (staffid) {
        await tx.userstaff.create({
          data: {
            userid: user.userid,
            staffid: Number(staffid),
          },
        });
      }

      return user;
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("Error updating user:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}

// DELETE user (Soft Delete)
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

    await prisma.user.update({
      where: { userid: Number(id) },
      data: { isactive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
}
