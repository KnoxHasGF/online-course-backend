
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

    let filter = {};

    if (currentUser.role === "Teacher") {
      filter = { teacherId: currentUser.userId };
    } else if (currentUser.role === "Student") {
      filter = { status: { $ne: "Cancel" } };
    } else {
      return NextResponse.json(
        { message: "Invalid role" },
        { status: 403 }
      );
    }

    const courses = await db
      .collection("courses")
      .find(filter)
      .sort({ courseName: 1 })
      .toArray();

    return NextResponse.json({ courses });
  } catch (error) {
    console.error("List courses error:", error.message);

    return NextResponse.json(
      { message: "Unable to retrieve courses" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const currentUser = verifyJWT(request);

  if (!currentUser) {
    return NextResponse.json(
      { message: "Authentication required" },
      { status: 401 }
    );
  }

  if (currentUser.role !== "Teacher") {
    return NextResponse.json(
      { message: "Only teachers can create courses" },
      { status: 403 }
    );
  }

  try {
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

    const client = await getClientPromise();
    const db = client.db("course_service");

    const course = {
      courseName: courseName.trim(),
      duration,
      topics: topics.map((topic) => topic.trim()),
      price,
      maxStudent,
      status,
      teacherId: currentUser.userId,
      createdAt: new Date(),
    };

    const result = await db.collection("courses").insertOne(course);

    return NextResponse.json(
      {
        message: "Course created successfully",
        course: { ...course, _id: result.insertedId },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create course error:", error.message);

    return NextResponse.json(
      { message: "Unable to create course" },
      { status: 500 }
    );
  }
}
