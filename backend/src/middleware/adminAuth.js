import { clerkClient } from "@clerk/express";

/**
 * Middleware to check if user is an admin
 * Checks Clerk metadata for admin role
 */
export async function requireAdmin(req, res, next) {
  try {
    // Get user ID from Clerk auth
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    // Get user from Clerk
    const user = await clerkClient.users.getUser(userId);

    // Check if user has admin role in public metadata
    const isAdmin =
      user.publicMetadata?.role === "admin" ||
      user.privateMetadata?.role === "admin";

    if (!isAdmin) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Admin access required",
      });
    }

    // Add admin flag to request
    req.isAdmin = true;
    next();
  } catch (error) {
    console.error("Admin check error:", error);
    return res.status(500).json({
      error: "Server error",
      message: "Failed to verify admin status",
    });
  }
}

/**
 * Middleware to optionally check admin status
 * Adds isAdmin flag to request but doesn't block non-admins
 */
export async function checkAdmin(req, res, next) {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      req.isAdmin = false;
      return next();
    }

    const user = await clerkClient.users.getUser(userId);

    req.isAdmin =
      user.publicMetadata?.role === "admin" ||
      user.privateMetadata?.role === "admin";

    next();
  } catch (error) {
    console.error("Admin check error:", error);
    req.isAdmin = false;
    next();
  }
}
