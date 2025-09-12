import Todo, { ITodo } from "../models/todo.model";

export const findAll = async (): Promise<ITodo[]> => {
  return Todo.find();
};

export const findTodoById = async (id: string): Promise<ITodo | null> => {
  return Todo.findById(id);
};

export const createTodo = async (data: ITodo): Promise<ITodo> => {
  const todo = new Todo(data);
  return todo.save();
};

export const updateTodo = async (
  id: string,
  data: ITodo
): Promise<ITodo | null> => {
  return Todo.findByIdAndUpdate(id, data, { new: true });
};

export const deleteTodo = async (id: string): Promise<ITodo | null> => {
  return Todo.findByIdAndDelete(id);
};
