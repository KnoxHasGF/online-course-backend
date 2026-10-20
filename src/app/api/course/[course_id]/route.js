
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getClientPromise } from "@/lib/mongodb";
import { verifyJWT } from "@/lib/auth";

async function getCourseContext(request, params) {
  const user = verifyJWT(request);

  if (!user) {
    return {
      error: NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  const { course_id } = await params;

  if (!ObjectId.isValid(course_id)) {
    return {
      error: NextResponse.json(
        { message: "Invalid course ID" },
        { status: 400 }
      ),
    };
  }

  const client = await getClientPromise();
  const db = client.db("course_service");

  const course = await db.collection("courses").findOne({
    _id: new ObjectId(course_id),
  });

  if (!course) {
    return {
      error: NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      ),
    };
  }

  if (
    user.role === "Teacher" &&
    course.teacherId !== user.userId
  ) {
    return {
      error: NextResponse.json(
        { message: "You can access only your own courses" },
        { status: 403 }
      ),
    };
  }

  return { user, db, course };
}

export async function GET(request, { params }) {
  try {
    const context = await getCourseContext(request, params);

    if (context.error) return context.error;

    const { user, db, course } = context;

    if (user.role === "Student" && course.status === "Cancel") {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    const enrollments = await db
      .collection("enrollments")
      .find({ courseId: course._id.toString() })
      .toArray();

    const studentIds = enrollments.map((item) => item.studentId);

    const students = studentIds.length
      ? await db
          .collection("users")
          .find(
            { _id: { $in: studentIds.filter(ObjectId.isValid).map((id) => new ObjectId(id)) } },
            { projection: { password: 0 } }
          )
          .toArray()
      : [];

    return NextResponse.json({
      course,
      ...(user.role === "Teacher" ? { students } : {}),
    });
  } catch (error) {
    console.error("Get course error:", error.message);
    return NextResponse.json(
      { message: "Unable to retrieve course" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const context = await getCourseContext(request, params);

    if (context.error) return context.error;

    const { user, db, course } = context;

    if (user.role !== "Teacher") {
      return NextResponse.json(
        { message: "Only teachers can update courses" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { courseName, duration, topics, price, maxStudent, status } = body;

    if (
      typeof courseName !== "string" ||
      !courseName.trim() ||
      !Number.isInteger(duration) ||
      duration <= 0 ||
      !Array.isArray(topics) ||
      topics.length === 0 ||
      topics.some((topic) => typeof topic !== "string" || !topic.trim()) ||
      typeof price !== "number" ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(maxStudent) ||
      maxStudent <= 0 ||
      !["Open", "Close", "Cancel"].includes(status)
    ) {
      return NextResponse.json(
        { message: "Invalid course data" },
        { status: 400 }
      );
    }

    const enrolledCount = await db
      .collection("enrollments")
      .countDocuments({ courseId: course._id.toString() });

    if (maxStudent < enrolledCount) {
      return NextResponse.json(
        { message: "Max Student cannot be less than current enrollment" },
        { status: 400 }
      );
    }

    const updates = {
      courseName: courseName.trim(),
      duration,
      topics: topics.map((topic) => topic.trim()),
      price,
      maxStudent,
      status,
      updatedAt: new Date(),
    };

    await db.collection("courses").updateOne(
      { _id: course._id, teacherId: user.userId },
      { $set: updates }
    );

    return NextResponse.json({
      message: "Course updated successfully",
      course: { ...course, ...updates },
    });
  } catch (error) {
    console.error("Update course error:", error.message);
    return NextResponse.json(
      { message: "Unable to update course" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const context = await getCourseContext(request, params);

    if (context.error) return context.error;

    const { user, db, course } = context;

    if (user.role !== "Teacher") {
      return NextResponse.json(
        { message: "Only teachers can delete courses" },
        { status: 403 }
      );
    }

    const enrolledCount = await db
      .collection("enrollments")
      .countDocuments({ courseId: course._id.toString() });

    if (enrolledCount > 0) {
      return NextResponse.json(
        { message: "Cannot delete a course with enrolled students" },
        { status: 409 }
      );
    }

    await db.collection("courses").deleteOne({
      _id: course._id,
      teacherId: user.userId,
    });

    return NextResponse.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Delete course error:", error.message);
    return NextResponse.json(
      { message: "Unable to delete course" },
      { status: 500 }
    );
  }
}
