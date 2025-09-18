import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { SignupInput, LoginInput } from "../validators/auth.validator";

interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export const signup = async (
  req: Request<{}, {}, SignupInput>,
  res: Response
) => {
  try {
    const { firstname, lastname, email, password, gender } = req.body;

    const user = await authService.createUser({
      firstname,
      lastname,
      email,
      password,
      gender,
    });

    return res.status(201).json({ user: user.toJSON() });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.includes("Email already in use")) {
        return res.status(409).json({ message: err.message });
      }

      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }
};

export const login = async (
  req: Request<{}, {}, LoginInput>,
  res: Response
) => {
  try {
    const { email, password } = req.body;

    const { user, token } = await authService.authenticate({ email, password });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60, // 1h
    });

    return res.json({ user: user.toJSON() });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "Invalid credentials") {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await authService.getUserById(req.userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ user });
};
