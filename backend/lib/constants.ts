import { TypeOfResponse } from "./types";

export const SERVER_ERROR_RESPONSE: TypeOfResponse<null> = {
  message: "Internal Server Error",
  data: null,
  success: false,
};
