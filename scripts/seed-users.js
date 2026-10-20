
import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing from .env.local");
}

const testUsers = [
  {
    username: "student1",
    email: "student1@example.com",
    password: "Student123!",
    role: "Student",
  },
  {
    username: "student2",
    email: "student2@example.com",
    password: "Student123!",
    role: "Student",
  },
  {
    username: "student3",
    email: "student3@example.com",
    password: "Student123!",
    role: "Student",
  },
  {
    username: "teacher1",
    email: "teacher1@example.com",
    password: "Teacher123!",
    role: "Teacher",
  },
  {
    username: "teacher2",
    email: "teacher2@example.com",
    password: "Teacher123!",
    role: "Teacher",
  },
  {
    username: "teacher3",
    email: "teacher3@example.com",
    password: "Teacher123!",
    role: "Teacher",
  },
];

async function main() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const users = client.db("course_service").collection("users");

    for (const user of testUsers) {
      const passwordHash = await bcrypt.hash(user.password, 12);

      await users.updateOne(
        { email: user.email },
        {
          $set: {
            username: user.username,
            email: user.email,
            password: passwordHash,
            role: user.role,
          },
        },
        { upsert: true }
      );

      console.log(`Seeded ${user.role}: ${user.email}`);
    }

    console.log("All six test users are ready.");
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error("Seeding failed:", error.message);
  process.exitCode = 1;
});
