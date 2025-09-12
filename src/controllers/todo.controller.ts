import { Request, Response } from "express";
import * as todoService from "../services/todo.service";

export const findAll = async (req: Request, res: Response) => {
  try {
    const todos = await todoService.findAll();

    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch todos" });
  }
};

export const findTodoById = async (req: Request, res: Response) => {
  try {
    const todo = await todoService.findTodoById(req.params.id);

    if (!todo) return res.status(404).json({ error: "Todo not found" });

    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch todo" });
  }
};

export const createTodo = async (req: Request, res: Response) => {
  try {
    const todo = await todoService.createTodo(req.body);
    res.status(201).json(todo);
  } catch (err) {
    res.status(500).json({ error: "Failed to create todo" });
  }
};

export const updateTodo = async (req: Request, res: Response) => {
  try {
    const todo = await todoService.updateTodo(req.params.id, req.body);

    if (!todo) return res.status(404).json({ error: "Todo not found" });

    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: "Failed to update todo" });
  }
};

export const deleteTodo = async (req: Request, res: Response) => {
  try {
    const todo = await todoService.deleteTodo(req.params.id);

    if (!todo) return res.status(404).json({ error: "Todo not found" });

    res.json({ message: "Todo deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete todo" });
  }
};
