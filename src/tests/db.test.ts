import mongoose from "mongoose";
import connectDB from "../config/db";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

jest.mock("mongoose");
const mockedMongoose = mongoose as jest.Mocked<typeof mongoose>;

test("database connection successful", async () => {
  mockedMongoose.connect.mockResolvedValueOnce({
    connection: { host: "localhost" },
  } as any);

  await connectDB({
    mongoURI: process.env.MONGO_URI,
    maxRetries: 3,
    retryDelay: 10,
  });

  expect(mockedMongoose.connect).toHaveBeenCalledTimes(1);
  expect(mockedMongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URI);
});

describe("connectDB retry system", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("database connection failed with retries", async () => {
    mockedMongoose.connect.mockRejectedValue(new Error("DB Error"));

    await connectDB({
      mongoURI: "mongodb://fail",
      maxRetries: 3,
      retryDelay: 10,
    });

    expect(mockedMongoose.connect).toHaveBeenCalledTimes(3);
  });
});
