import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { SignupInput, LoginInput } from "../validators/auth.validator";

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

    const { token } = await authService.authenticate({ email, password });

    return res.status(201).json({ user: user.toJSON(), token });
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

    return res.json({ user: user.toJSON(), token });
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
