export type TypeOfError = {
  status?: 400 | 500;
  message: string;
};

export type TypeOfResponse<T> = {
  success: boolean;
  data: T;
  message: string;
};

export class CustomError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
