export type BackendResponseType<T> = {
    success: boolean;
    data: T;
    message: string;
}