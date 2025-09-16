import request from "supertest";
import express from "express";
import todoRoutes from "../routes/todo.route";
import * as todoService from "../services/todo.service";
import { ITodo } from "../models/todo.model";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config({ path: ".env.test" });

// Mock the service
jest.mock("../services/todo.service", () => ({
  findAll: jest.fn(),
  findTodoById: jest.fn(),
  createTodo: jest.fn(),
  updateTodo: jest.fn(),
  deleteTodo: jest.fn(),
}));

const mockedTodoService = todoService as jest.Mocked<typeof todoService>;

const app = express();

app.use(express.json());
app.use("/api/todos", todoRoutes);

const secret = process.env.JWT_SECRET || "";

const testUserId = "test-user-id";
const testToken = jwt.sign(
  { sub: testUserId, email: "test@example.com" },
  secret
);

describe("Todo Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /api/todos should return all todos", async () => {
    const mockTodos = [
      { _id: "1", title: "Test Todo 1", isCompleted: false },
      { _id: "2", title: "Test Todo 2", isCompleted: true },
    ];

    mockedTodoService.findAll.mockResolvedValue(mockTodos as any);

    const res = await request(app)
      .get("/api/todos")
      .set("Authorization", `Bearer ${testToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockTodos);
    expect(mockedTodoService.findAll).toHaveBeenCalledTimes(1);
  });

  test("GET /api/todos/:id should return a single todo if found", async () => {
    const mockTodo = { _id: "1", title: "Test Todo", isCompleted: false };
    mockedTodoService.findTodoById.mockResolvedValue(mockTodo as ITodo);

    const res = await request(app)
      .get("/api/todos/1")
      .set("Authorization", `Bearer ${testToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockTodo);
    expect(mockedTodoService.findTodoById).toHaveBeenCalledWith("1");
  });

  test("GET /api/todos/:id should return 404 if todo not found", async () => {
    mockedTodoService.findTodoById.mockResolvedValue(null);

    const res = await request(app)
      .get("/api/todos/999")
      .set("Authorization", `Bearer ${testToken}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
    expect(mockedTodoService.findTodoById).toHaveBeenCalledWith("999");
  });

  test("POST /api/todos should create a new todo", async () => {
    const newTodo = { title: "New Todo", isCompleted: false };
    const createdTodo = { _id: "123", ...newTodo };

    mockedTodoService.createTodo.mockResolvedValue(createdTodo as ITodo);

    const res = await request(app)
      .post("/api/todos")
      .send(newTodo)
      .set("Authorization", `Bearer ${testToken}`);

    expect(res.status).toBe(201);
    expect(res.body).toEqual(createdTodo);
    expect(mockedTodoService.createTodo).toHaveBeenCalledWith(newTodo);
  });

  test("POST /api/todos should return 400 if title is missing", async () => {
    const res = await request(app)
      .post("/api/todos")
      .send({ isCompleted: false })
      .set("Authorization", `Bearer ${testToken}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });

  test("POST /api/todos should return 400 if nothing sent in body", async () => {
    const res = await request(app)
      .post("/api/todos")
      .send({})
      .set("Authorization", `Bearer ${testToken}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });

  test("PATCH /api/todos/:id should update a todo successfully", async () => {
    const todo = { _id: "1", title: "Test Todo", isCompleted: false };

    const updatedTodo = { ...todo, isCompleted: true };

    mockedTodoService.updateTodo.mockResolvedValue(updatedTodo as ITodo);

    const res = await request(app)
      .patch(`/api/todos/${todo._id}`)
      .send({ isCompleted: updatedTodo.isCompleted })
      .set("Authorization", `Bearer ${testToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(updatedTodo);
    expect(mockedTodoService.updateTodo).toHaveBeenCalledWith(todo._id, {
      isCompleted: updatedTodo.isCompleted,
    });
  });

  test("PATCH /api/todos/:id should return 404 if todo not found", async () => {
    mockedTodoService.updateTodo.mockResolvedValue(null);

    const res = await request(app)
      .patch("/api/todos/999")
      .send({ isCompleted: true })
      .set("Authorization", `Bearer ${testToken}`);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Todo not found" });
    expect(mockedTodoService.updateTodo).toHaveBeenCalledWith("999", {
      isCompleted: true,
    });
  });

  test("PATCH /api/todos/ without id should return 404", async () => {
    const res = await request(app)
      .patch("/api/todos/")
      .set("Authorization", `Bearer ${testToken}`);

    expect(res.status).toBe(404);
  });

  test("DELETE /api/todos/:id should delete a todo successfully", async () => {
    const deletedTodo = { _id: "1", title: "Test Todo", isCompleted: false };

    mockedTodoService.deleteTodo.mockResolvedValue(deletedTodo as ITodo);

    const res = await request(app)
      .delete(`/api/todos/${deletedTodo._id}`)
      .set("Authorization", `Bearer ${testToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message");
    expect(mockedTodoService.deleteTodo).toHaveBeenCalledWith("1");
  });

  test("DELETE /api/todos/:id should return 404 if todo not found", async () => {
    mockedTodoService.deleteTodo.mockResolvedValue(null);

    const res = await request(app)
      .delete("/api/todos/999")
      .set("Authorization", `Bearer ${testToken}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
    expect(mockedTodoService.deleteTodo).toHaveBeenCalledWith("999");
  });

  test("DELETE /api/todos/ without id should return 404", async () => {
    const res = await request(app)
      .delete("/api/todos/")
      .set("Authorization", `Bearer ${testToken}`);

    expect(res.status).toBe(404);
  });
});
