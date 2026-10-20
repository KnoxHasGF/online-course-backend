
import { NextResponse } from "next/server";
import { getClientPromise } from "@/lib/mongodb";
import { verifyJWT } from "@/lib/auth";

export async function GET(request) {
  const user = verifyJWT(request);

  if (!user) {
    return NextResponse.json(
      { message: "Authentication required" },
      { status: 401 }
    );
  }

  if (user.role !== "Student") {
    return NextResponse.json(
      { message: "Only students can view their enrollments" },
      { status: 403 }
    );
  }

  try {
    const client = await getClientPromise();
    const db = client.db("course_service");

    const enrollments = await db
      .collection("enrollments")
      .find({ studentId: user.userId })
      .toArray();

    const courseIds = enrollments.map((item) => item.courseId);

    const { ObjectId } = await import("mongodb");

    const validIds = courseIds
      .filter((id) => ObjectId.isValid(id))
      .map((id) => new ObjectId(id));

    const courses = validIds.length
      ? await db
          .collection("courses")
          .find({ _id: { $in: validIds } })
          .toArray()
      : [];

    return NextResponse.json({ courses });
  } catch (error) {
    console.error("List enrollments error:", error.message);

    return NextResponse.json(
      { message: "Unable to retrieve enrollments" },
      { status: 500 }
    );
  }
}
