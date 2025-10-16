import { clerkMiddleware, requireAuth } from "@clerk/express";

/**
 * Clerk authentication middleware
 * This middleware automatically validates Clerk session tokens
 * and adds auth information to req.auth
 */
export const clerkAuth = clerkMiddleware();

/**
 * Middleware to require authentication
 * Use this on routes that need to be protected
 */
export const requireAuthentication = requireAuth();

/**
 * Optional middleware to get user info from Clerk token
 * Adds userId to request if authenticated
 */
export function getUserId(req, res, next) {
  try {
    if (req.auth && req.auth.userId) {
      req.userId = req.auth.userId;
    }
    next();
  } catch (error) {
    console.error("Error extracting user ID:", error);
    next();
  }
}
