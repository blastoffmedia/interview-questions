import { NextFunction, Request, Response } from "express";

/**
 * TODO: Implement this Express middleware function
 *
 * This middleware should validate the postId parameter from req.params:
 * - Check if postId exists and is not empty
 * - Check if postId is a valid number (use Number() or parseInt())
 * - Check if postId is positive (greater than 0)
 * - If invalid, send a 400 response with error message
 * - If valid, call next() to continue to the next handler
 */
export const validatePostId = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Your implementation here

  // Remove this line and implement validation:
  next();
};
