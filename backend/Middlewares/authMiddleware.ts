import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { TypeOfResponse } from "../lib/types";
import { SERVER_ERROR_RESPONSE } from "../lib/constants";
import { parsedEnv } from "../env";

// Middleware for Login

export const isUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization;
    const data = jwt.verify(token + "", parsedEnv.JWT_SECRET_USER as string);
    (req as any).userId = (data as any).userId;
    next();
  } catch (error) {
    // console.log(error);
    const response: TypeOfResponse<null> = {
      success: false,
      data: null,
      message: "the user token is invalid",
    };
    res.status(400).send(response);
  }
};
