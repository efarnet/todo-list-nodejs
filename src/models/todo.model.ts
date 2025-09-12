import { Schema, model, Document } from "mongoose";

export interface ITodo extends Document {
  title: string;
  isCompleted?: boolean;
}

const TodoSchema = new Schema<ITodo>({
  title: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
});

export default model<ITodo>("Todos", TodoSchema);
