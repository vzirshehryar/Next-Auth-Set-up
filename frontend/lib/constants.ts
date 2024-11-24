import { BackendResponseType } from "./types";

export const ServerErrorResponse: BackendResponseType<any> = {
    success: false,
    data: null,
    message: "Server is Not Running",
}