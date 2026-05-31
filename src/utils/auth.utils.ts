import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import config from "../config";

//const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_SECRET = config.secret as string

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};


export const comparePassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

export const generateToken = (payload: object) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};