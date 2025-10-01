import { NextFunction, Request, Response } from "express";

/**
 * TODO: Implement this Express middleware function
 *
 * This middleware should validate the username parameter from req.params:
 * - Check if username exists and is not empty
 * - If invalid, send a 400 response with error message
 * - If valid, call next() to continue to the next handler
 */
export const validateUsername = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Your implementation here

  // Remove this line and implement validation:
  next();
};
