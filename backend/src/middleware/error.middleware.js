import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Wrap non-ApiError instances
  if (!(error instanceof ApiError)) {
    let statusCode = 500;
    let message = error.message || "Internal Server Error";

    // Mongoose validation error
    if (error instanceof mongoose.Error.ValidationError) {
      statusCode = 422;
      message = Object.values(error.errors)
        .map((e) => e.message)
        .join(", ");
    }

    // Mongoose duplicate key
    if (error.code === 11000) {
      statusCode = 409;
      const field = Object.keys(error.keyValue || {})[0] || "field";
      message = `${field} already exists`;
    }

    // Mongoose cast error (bad ObjectId)
    if (error instanceof mongoose.Error.CastError) {
      statusCode = 400;
      message = `Invalid ${error.path}: ${error.value}`;
    }

    error = new ApiError(statusCode, message, [], err.stack);
  }

  return res.status(error.statusCode).json({
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

export { errorHandler };
