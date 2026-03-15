import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { signToken } from "@/lib/jwt";
import { UserContext } from "@/types/auth";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username and password are required" },
        { status: 400 },
      );
    }

    //Fetch user with roles + staff
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        userrole: {
          include: { role: true },
        },
        userstaff: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    //Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordhash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    if (!user.isactive) {
      return NextResponse.json(
        { message: "User account is inactive" },
        { status: 403 },
      );
    }

    // Extract roles
    const roles = user.userrole.map((ur) => ur.role.rolename);

    // Extract staffId
    const staffId =
      user.userstaff.length > 0 ? user.userstaff[0].staffid : null;

    //Create JWT payload
    const tokenPayload = {
      userId: user.userid,
      username: user.username,
      roles,
      staffId,
    };

    const token = signToken(tokenPayload);

    //Update last login
    await prisma.user.update({
      where: { userid: user.userid },
      data: { lastlogin: new Date() },
    });

    // Determine redirect target based on priority
    let redirectTo = "/requestor/dashboard"; // Default
    if (roles.includes("ADMIN")) {
      redirectTo = "/admin/dashboard";
    } else if (roles.includes("REQUESTOR")) {
      redirectTo = "/requestor/dashboard";
    } else if (roles.includes("TECHNICIAN")) {
      redirectTo = "/technician/dashboard";
    } else if (roles.includes("HOD")) {
      redirectTo = "/hod/dashboard";
    }

    //Prepare response
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        userId: user.userid,
        username: user.username,
        roles,
        staffId,
      } as UserContext,
      redirectTo,
    });

    //Set HttpOnly JWT cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
