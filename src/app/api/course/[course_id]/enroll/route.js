
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getClientPromise } from "@/lib/mongodb";
import { verifyJWT } from "@/lib/auth";

export async function POST(request, { params }) {
  const user = verifyJWT(request);

  if (!user) {
    return NextResponse.json(
      { message: "Authentication required" },
      { status: 401 }
    );
  }

  if (user.role !== "Student") {
    return NextResponse.json(
      { message: "Only students can enroll" },
      { status: 403 }
    );
  }

  try {
    const { course_id } = await params;

    if (!ObjectId.isValid(course_id)) {
      return NextResponse.json(
        { message: "Invalid course ID" },
        { status: 400 }
      );
    }

    const client = await getClientPromise();
    const db = client.db("course_service");
    const courseObjectId = new ObjectId(course_id);

    const course = await db.collection("courses").findOne({
      _id: courseObjectId,
    });

    if (!course || course.status === "Cancel") {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    if (course.status !== "Open") {
      return NextResponse.json(
        { message: "This course is not open for enrollment" },
        { status: 409 }
      );
    }

    const enrollments = db.collection("enrollments");
    const studentObjectId = new ObjectId(user.userId);
    const studentId = user.userId;
    const courseId = course._id.toString();

    const existing = await enrollments.findOne({ studentId, courseId });

    if (existing) {
      return NextResponse.json(
        { message: "You are already enrolled in this course" },
        { status: 409 }
      );
    }

    const enrolledCount = await enrollments.countDocuments({ courseId });

    if (enrolledCount >= course.maxStudent) {
      return NextResponse.json(
        { message: "This course has reached its maximum capacity" },
        { status: 409 }
      );
    }

    await enrollments.insertOne({
      studentId,
      courseId,
      enrolledAt: new Date(),
    });

    return NextResponse.json(
      { message: "Enrollment successful" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Enrollment error:", error.message);

    return NextResponse.json(
      { message: "Unable to enroll in this course" },
      { status: 500 }
    );
  }
}
