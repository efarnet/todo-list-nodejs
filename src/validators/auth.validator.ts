import { z } from "zod";
import { Gender } from "../enums/gender.enum";

export const signupSchema = z.object({
  firstname: z.string().min(1, "Firstname is required"),
  lastname: z.string().min(1, "Lastname is required"),
  email: z.email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 chars"),
  gender: z.enum(Gender),
});

export const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
