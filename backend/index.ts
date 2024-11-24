import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";

import authRouter from "./Routes/auth.route";
import { CustomError, TypeOfResponse } from "./lib/types";
import { SERVER_ERROR_RESPONSE } from "./lib/constants";
import { parsedEnv } from "./env";

const DATABASE = parsedEnv.DATABASE_URI as string;
mongoose
  .connect(DATABASE)
  .then((x) => {
    console.log(`Connected to Mongo! Database name :  "${x.connections[0].name}"`);
  })
  .catch((e) => {
    console.error("Error connecting to Mongo", e.reason);
  });

const app = express();
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
  })
);
app.use(cors());

// Defining Routes

// app.use("/users", userRoute);
app.get("/", (req, res) => {
  res.status(200).json("hello lets begin");
});

app.use("/auth", authRouter);

app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
  let response: TypeOfResponse<null> = {
    success: false,
    data: null,
    message: err.message,
  };
  if (err.status === 400) {
    res.status(400).json(response);
    return;
  }
  console.log("err.status", err);
  response = SERVER_ERROR_RESPONSE;
  res.status(500).json(response);
});

const server = app.listen(parsedEnv.PORT, () => {
  console.log("Connected to Port " + parsedEnv.PORT);
});
