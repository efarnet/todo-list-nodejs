import { Schema, model, Document } from "mongoose";
import { Gender } from "../enums/gender.enum";

export interface IUser extends Document {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  gender: Gender;
}

const UserSchema = new Schema<IUser>(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true },
    gender: { type: String, required: true, enum: Object.values(Gender) },
  },
  { timestamps: true }
);

export default model<IUser>("Users", UserSchema);
