export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static badRequest(message: string, details?: unknown): ApiError {
    return new ApiError(400, message, details);
  }

  static notFound(message: string): ApiError {
    return new ApiError(404, message);
  }

  static unauthorized(message: string, details?: unknown): ApiError {
    return new ApiError(401, message, details);
  }

  static forbidden(message: string, details?: unknown): ApiError {
    return new ApiError(403, message, details);
  }

  static internal(message = 'Internal server error', details?: unknown): ApiError {
    return new ApiError(500, message, details);
  }
}

