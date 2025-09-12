import { Request, Response, NextFunction } from "express";
import { ZodError, ZodObject } from "zod";

export const validateRequest = (schema: ZodObject) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    schema.parse(req.body);

    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ errors: err.issues });
    }

    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
