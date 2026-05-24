import { Prisma } from "@prisma/client";
import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { isHttpError } from "../utils/http-error.js";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      message: "Request validation failed",
      issues: error.flatten()
    });
    return;
  }

  if (isHttpError(error)) {
    res.status(error.statusCode).json({
      message: error.message,
      details: error.details
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      res.status(409).json({ message: "A record with that unique value already exists" });
      return;
    }

    res.status(400).json({ message: "Database request failed", code: error.code });
    return;
  }

  console.error(error);
  res.status(500).json({ message: "Internal server error" });
};
