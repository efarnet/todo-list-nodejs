import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import User, { IUser } from "../models/user.model";
import { SignupInput, LoginInput } from "../validators/auth.validator";

const SALT_ROUNDS = 12;

interface AuthPayload {
  sub: string;
  email: string;
}

export const createUser = async (data: SignupInput): Promise<IUser> => {
  const existing = await User.findOne({ email: data.email });

  if (existing) throw new Error("Email already in use");

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = new User({
    firstname: data.firstname,
    lastname: data.lastname,
    email: data.email,
    password: passwordHash,
    gender: data.gender,
  });

  await user.save();

  return user;
};

export const authenticate = async (
  data: LoginInput
): Promise<{ user: IUser; token: string }> => {
  const user = await User.findOne({ email: data.email });

  if (!user) throw new Error("Invalid credentials");

  const passwordMatch = await bcrypt.compare(data.password, user.password);
  
  if (!passwordMatch) throw new Error("Invalid credentials");

  const payload: AuthPayload = { sub: user._id.toString(), email: user.email };

  const secret = process.env.JWT_SECRET;

  if  (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  const options: SignOptions = { expiresIn: secret as `${number}h` || "1h" };

  const token = jwt.sign(payload, process.env.JWT_SECRET as jwt.Secret, options);

  return { user, token };
};

export const verifyToken = (token: string): AuthPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
};
