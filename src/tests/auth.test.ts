import request from "supertest";
import express from "express";
import authRoutes from "../routes/auth.route";
import * as authService from "../services/auth.service";
import { Gender } from "../enums/gender.enum";
import { createMockUser, getCookies } from "../helpers/helpers";
import { IUser } from "../models/user.model";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config({ path: ".env.test" });

const secret = process.env.JWT_SECRET || "test-secret";

// Mock the service
jest.mock("../services/auth.service", () => ({
  createUser: jest.fn(),
  authenticate: jest.fn(),
  getUserById: jest.fn(),
}));

const mockedAuthService = authService as jest.Mocked<typeof authService>;

const app = express();

app.use(require("cookie-parser")());
app.use(express.json());
app.use("/api/auth", authRoutes);

describe("Auth testing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const token = "test-token";

  const userData = {
    firstname: "John",
    lastname: "Doe",
    email: "john@example.com",
    password: "Password123",
    gender: Gender.MEN,
  };

  const mockUser = createMockUser();

  test("should signup a new user", async () => {
    mockedAuthService.createUser.mockResolvedValue(
      (mockUser as unknown) as IUser
    );

    const res = await request(app)
      .post("/api/auth/signup")
      .send(userData)
      .expect(201);

    expect(res.body.user).toMatchObject({
      _id: mockUser._id,
      ...userData,
    });
    expect(mockedAuthService.createUser).toHaveBeenCalledTimes(1);
  });

  test("should return 400 if no data is sent", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({})
      .expect(400);

    expect(res.body).toHaveProperty("errors");
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: ["firstname"] }),
        expect.objectContaining({ path: ["lastname"] }),
        expect.objectContaining({ path: ["email"] }),
        expect.objectContaining({ path: ["password"] }),
        expect.objectContaining({ path: ["gender"] }),
      ])
    );

    expect(mockedAuthService.createUser).not.toHaveBeenCalled();
  });

  test("should return 400 if email is invalid", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({
        ...userData,
        email: "not-an-email",
      })
      .expect(400);

    expect(res.body).toHaveProperty("errors");
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: ["email"] })])
    );

    expect(mockedAuthService.createUser).not.toHaveBeenCalled();
  });

  test("should return 400 if gender is invalid", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({
        ...userData,
        gender: "UNKNOWN",
      })
      .expect(400);

    expect(res.body).toHaveProperty("errors");
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: ["gender"] })])
    );

    expect(mockedAuthService.createUser).not.toHaveBeenCalled();
  });

  test("should fail to signup with existing email", async () => {
    mockedAuthService.createUser.mockRejectedValue(
      new Error("Email already in use")
    );

    const res = await request(app)
      .post("/api/auth/signup")
      .send(userData)
      .expect(409);

    expect(res.body).toHaveProperty("message", "Email already in use");
    expect(mockedAuthService.createUser).toHaveBeenCalledTimes(1);
  });

  test("should login successfully with valid credentials", async () => {
    mockedAuthService.authenticate.mockResolvedValue({
      user: (mockUser as unknown) as IUser,
      token,
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: userData.email,
        password: userData.password,
      })
      .expect(200);

    const cookies = getCookies(res);

    expect(cookies.length).toBeGreaterThan(0);
    expect(cookies.some((c) => c.startsWith("token="))).toBe(true);

    expect(res.body.user).toMatchObject({
      _id: mockUser._id,
      firstname: mockUser.firstname,
      lastname: mockUser.lastname,
      email: mockUser.email,
      gender: mockUser.gender,
    });
    expect(mockedAuthService.authenticate).toHaveBeenCalledTimes(1);
    expect(mockedAuthService.authenticate).toHaveBeenCalledWith({
      email: userData.email,
      password: userData.password,
    });
  });

  test("should return 401 if no token is provided", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .expect(401);

    expect(res.body).toHaveProperty("message", "No token provided");
  });

  test("should return 401 if token is invalid", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Cookie", ["token=invalid-token"])
      .expect(401);
    expect(res.body).toHaveProperty("message", "Invalid token");
  });

  test("should return user info if token is valid", async () => {
    const validToken = jwt.sign({ sub: mockUser._id }, secret, {
      expiresIn: "1h",
    });

    mockedAuthService.getUserById.mockResolvedValue(
      (mockUser as unknown) as IUser
    );

    const res = await request(app)
      .get("/api/auth/me")
      .set("Cookie", [`token=${validToken}`])
      .expect(200);

    expect(mockedAuthService.getUserById).toHaveBeenCalledWith(mockUser._id);

    expect(res.body).toEqual({
      id: mockUser._id,
      firstname: mockUser.firstname,
      lastname: mockUser.lastname,
      email: mockUser.email,
      gender: mockUser.gender,
    });
  });

  test("should logout successfully and clear the token cookie", async () => {
    const res = await request(app)
      .post("/api/auth/logout")
      .expect(200);

    expect(res.body).toHaveProperty("message", "Logged out successfully");

    const setCookieHeader = res.headers["set-cookie"];

    expect(setCookieHeader).toBeDefined();

    const cookies = Array.isArray(setCookieHeader)
      ? setCookieHeader
      : [setCookieHeader];

    expect(cookies.some((c: string) => c.startsWith("token=;"))).toBe(true);
  });
});
