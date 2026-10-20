
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export function verifyJWT(req) {
  try {
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const token = req.cookies.get("token")?.value;

    if (!token) {
      return null;
    }

    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function requireRole(user, role) {
  return Boolean(user && user.role === role);
}
