export default class ApiError<E = any> extends Error {
  statusCode?: number;
  details?: E;

  get type() {
    return this.statusCode ? "api" : "network";
  }

  constructor(message: string, statusCode?: number | undefined, details?: any) {
    super(message);

    this.statusCode = statusCode;
    this.details = details;
  }
}
