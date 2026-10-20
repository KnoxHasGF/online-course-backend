# Online Course Service — Backend

## Project Overview
Backend REST API for an Online Course Service, built with Next.js and MongoDB.

## Technologies
- Next.js
- MongoDB Atlas
- Node.js
- JWT authentication
- bcrypt password hashing

## Requirements
- Node.js and npm
- MongoDB Atlas database

## Environment Variables
Create `next-backend/.env.local` with the following variables:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Never commit actual credentials or secret values to GitHub.

## Run Locally
1. Clone this repository.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure `.env.local` with valid environment variables.
4. Start the development server:

   ```bash
   npm run dev
   ```

5. The backend runs at `http://localhost:3000`.

## Main Features
- Login and logout
- JWT-based authentication
- Student and Teacher role authorization
- Course creation, viewing, updating, and deletion
- Enrollment validation and capacity checking
- View enrolled students and enrolled courses

## Test Accounts
See the project README or the test credentials section in the frontend repository for the configured test accounts.

## Deployment
Backend deployment: https://online-course-backend-chi.vercel.app

## Test User Accounts

Use the following accounts to test the deployed Online Course Service.

### Student Accounts

| User | Email | Password | Role |
|---|---|---|---|
| Student 1 | `student1@example.com` | `Student123!` | Student |
| Student 2 | `student2@example.com` | `Student123!` | Student |
| Student 3 | `student3@example.com` | `Student123!` | Student |

### Teacher Accounts

| User | Email | Password | Role |
|---|---|---|---|
| Teacher 1 | `teacher1@example.com` | `Teacher123!` | Teacher |
| Teacher 2 | `teacher2@example.com` | `Teacher123!` | Teacher |
| Teacher 3 | `teacher3@example.com` | `Teacher123!` | Teacher |

### How to Test

1. Open the application: https://online-course-frontend-three.vercel.app/#/login
2. Sign in using one of the accounts above.
3. Test the features available to that role.

**Student testing**
- View available courses.
- Filter courses by course or teacher name, if implemented.
- View course details.
- Enroll in an open course with available seats.
- View enrolled courses.

**Teacher testing**
- Create a course.
- View and update courses created by that teacher.
- View enrolled students.
- Test course deletion according to the enrollment rules.

**Note:** These are the intended test credentials configured for this project. Verify that each account can successfully log in to the deployed application before submission.
