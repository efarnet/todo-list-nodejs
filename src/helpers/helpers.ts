import { Gender } from "../enums/gender.enum";
import { Response } from "supertest";

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const createMockUser = () => ({
  _id: "1",
  firstname: "John",
  lastname: "Doe",
  email: "john@example.com",
  password: "Password123",
  gender: Gender.MEN,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  toJSON: jest.fn(function() {
    const { toJSON, ...rest } = this;

    return rest;
  }),
});

export function getCookies(res: Response): string[] {
  const rawCookies = res.headers["set-cookie"];
  return Array.isArray(rawCookies)
    ? rawCookies
    : rawCookies
    ? [rawCookies]
    : [];
}
