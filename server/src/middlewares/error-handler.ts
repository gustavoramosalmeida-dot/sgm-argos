import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { ZodError } from "zod";
import { ApiError } from "../utils/api-error";
import { logger } from "../utils/logger";
import { env } from "../config/env";

export function errorHandlerMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ApiError) {
    const payload: { message: string; details?: unknown } = { message: err.message };
    if (err.details) payload.details = err.details;
    res.status(err.statusCode).json(payload);
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Validation error",
      details: err.flatten(),
    });
    return;
  }

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({ message: "Arquivo muito grande (máx. 8 MB)" });
      return;
    }
    res.status(400).json({ message: err.message });
    return;
  }

  if (err instanceof Error) {
    if (err.message === "Only image files are allowed" || err.message === "machineId is required") {
      res.status(400).json({ message: err.message });
      return;
    }
    if (err.message.startsWith("Origin not allowed by CORS")) {
      res.status(403).json({ message: err.message });
      return;
    }
  }

  logger.error("Unhandled error", err);

  const payload: { message: string; details?: unknown } = {
    message: "Internal server error",
  };
  if (!env.isProduction && err instanceof Error) {
    payload.details = err.message;
  }
  res.status(500).json(payload);
}
