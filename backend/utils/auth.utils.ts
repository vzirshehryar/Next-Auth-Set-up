import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { parsedEnv } from "../env";

export const doesPasswordMatch = async function (password1: string, password2: string) {
  return await bcrypt.compare(password1, password2);
};

// GENERATING JWT TOKENS
export const generateTokenForUser = function (userId: string) {
  return jwt.sign({ userId }, parsedEnv.JWT_SECRET_USER as string, { expiresIn: "30d" });
};
