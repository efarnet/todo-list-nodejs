import { Router } from "express";
import * as todoController from "../controllers/todo.controller";
import { validateRequest } from "../middlewares/todo.middleware";
import {
  createTodoSchema,
  updateTodoSchema,
} from "../validators/todo.validator";

const router = Router();

router.get("/", todoController.findAll);
router.get("/:id", todoController.findTodoById);
router.post("/", validateRequest(createTodoSchema), todoController.createTodo);
router.patch(
  "/:id",
  validateRequest(updateTodoSchema),
  todoController.updateTodo
);
router.delete("/:id", todoController.deleteTodo);

export default router;
