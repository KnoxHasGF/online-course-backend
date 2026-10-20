
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getClientPromise } from "@/lib/mongodb";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not configured");
    }

    const client = await getClientPromise();
    const db = client.db("course_service");

    const user = await db.collection("users").findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user || typeof user.password !== "string") {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!["Student", "Teacher"].includes(user.role)) {
      return NextResponse.json(
        { message: "Invalid user role" },
        { status: 403 }
      );
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: "2h" }
    );

    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 2 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error.message);

    return NextResponse.json(
      { message: "Unable to log in" },
      { status: 500 }
    );
  }
}
