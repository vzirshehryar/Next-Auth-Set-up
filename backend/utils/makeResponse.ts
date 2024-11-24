import { TypeOfResponse } from "../lib/types";

export const getSuccessResponse = <T>(data: T, message: string) => {
  const Response: TypeOfResponse<T> = {
    success: true,
    data: data,
    message: message,
  };
  return Response;
};
