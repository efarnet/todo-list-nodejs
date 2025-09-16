import { Gender } from "../enums/gender.enum";

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
