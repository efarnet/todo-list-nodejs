import { ZodError, ZodObject } from "zod";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export const validate = (schema: ZodObject) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body = schema.parse(req.body);

    next();
  } catch (err) {
    if (err instanceof ZodError) {
      console.error(err);
      return res.status(400).json({ errors: err.issues });
    }
  }
};

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("JWT_SECRET is not defined");

      return res.status(500).json({ message: "Server configuration error" });
    }

    const payload = jwt.verify(token, secret) as { sub: string; email: string };

    req.userId = payload.sub;
    req.userEmail = payload.email;

    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.status(401).json({ message: "Token verification failed" });
  }
};
