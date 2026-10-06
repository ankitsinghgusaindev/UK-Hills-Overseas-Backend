export class ClientApiError extends Error {
  status: number;
  errors?: unknown;

  constructor(
    message: string,
    status: number,
    errors?: unknown,
  ) {
    super(message);

    this.name = "ClientApiError";
    this.status = status;
    this.errors = errors;
  }
}