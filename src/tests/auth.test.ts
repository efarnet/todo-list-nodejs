import request from "supertest";
import express from "express";
import authRoutes from "../routes/auth.route";
import * as authService from "../services/auth.service";
import { Gender } from "../enums/gender.enum";
import { createMockUser } from "../helpers/helpers";

// Mock the service
jest.mock("../services/auth.service", () => ({
  createUser: jest.fn(),
  authenticate: jest.fn(),
}));

const mockedAuthService = authService as jest.Mocked<typeof authService>;

const app = express();

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
    mockedAuthService.createUser.mockResolvedValue(mockUser as any);
    mockedAuthService.authenticate.mockResolvedValue({
      user: mockUser as any,
      token,
    });

    const res = await request(app)
      .post("/api/auth/signup")
      .send(userData)
      .expect(201);

    expect(res.body.user).toMatchObject({
      _id: mockUser._id,
      ...userData,
    });
    expect(res.body.token).toBe(token);
    expect(mockedAuthService.createUser).toHaveBeenCalledTimes(1);
    expect(mockedAuthService.authenticate).toHaveBeenCalledWith({
      email: userData.email,
      password: userData.password,
    });
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
      user: mockUser as any,
      token,
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: userData.email,
        password: userData.password,
      })
      .expect(200);

    expect(res.body.user).toMatchObject({
      _id: mockUser._id,
      firstname: mockUser.firstname,
      lastname: mockUser.lastname,
      email: mockUser.email,
      gender: mockUser.gender,
    });
    expect(res.body.token).toBe(token);
    expect(mockedAuthService.authenticate).toHaveBeenCalledTimes(1);
    expect(mockedAuthService.authenticate).toHaveBeenCalledWith({
      email: userData.email,
      password: userData.password,
    });
  });
});
