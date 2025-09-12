import { z } from "zod";

export const createTodoSchema = z.object({
  title: z.string().min(1, "Title needs to be at least 1 character long"),
  isCompleted: z.boolean().default(false),
});

export const updateTodoSchema = z.object({
  title: z
    .string()
    .min(1, "Title needs to be at least 1 character long")
    .optional(),
  isCompleted: z.boolean().optional(),
});
