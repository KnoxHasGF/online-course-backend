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
