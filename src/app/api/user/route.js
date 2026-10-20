
import { NextResponse } from "next/server";
import { getClientPromise } from "@/lib/mongodb";
import { verifyJWT } from "@/lib/auth";

export async function GET(request) {
  const currentUser = verifyJWT(request);

  if (!currentUser) {
    return NextResponse.json(
      { message: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const client = await getClientPromise();
    const db = client.db("course_service");

    // Users can view their own profile.
    // Only teachers may list all users, for course-related administration.
    if (currentUser.role === "Teacher") {
      const users = await db
        .collection("users")
        .find({}, { projection: { password: 0 } })
        .toArray();

      return NextResponse.json({ users });
    }

    const { ObjectId } = await import("mongodb");
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(currentUser.userId) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("User API error:", error.message);

    return NextResponse.json(
      { message: "Unable to retrieve users" },
      { status: 500 }
    );
  }
}
