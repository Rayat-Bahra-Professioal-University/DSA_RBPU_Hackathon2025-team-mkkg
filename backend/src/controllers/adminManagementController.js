import { clerkClient } from "@clerk/clerk-sdk-node";

/**
 * Get all admins
 */
export async function getAllAdmins(req, res) {
  try {
    // Get all users with admin role
    const users = await clerkClient.users.getUserList({
      limit: 100, // Adjust as needed
    });

    // Filter for admins
    const admins = users.filter(
      (user) =>
        user.publicMetadata?.role === "admin" ||
        user.privateMetadata?.role === "admin"
    );

    const formattedAdmins = admins.map((admin) => ({
      id: admin.id,
      email: admin.emailAddresses?.[0]?.emailAddress,
      name: `${admin.firstName || ""} ${admin.lastName || ""}`.trim(),
      imageUrl: admin.imageUrl,
      createdAt: admin.createdAt,
    }));

    return res.json({
      admins: formattedAdmins,
      total: formattedAdmins.length,
    });
  } catch (err) {
    console.error("Error fetching admins:", err);
    return res.status(500).json({
      error: "Failed to fetch admins",
      message: err.message,
    });
  }
}

/**
 * Create a new admin (grant admin role to existing user)
 */
export async function createAdmin(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    // Find user by email
    const users = await clerkClient.users.getUserList({
      emailAddress: [email],
    });

    if (users.length === 0) {
      return res.status(404).json({
        error: "User not found",
        message: `No user found with email: ${email}`,
      });
    }

    const user = users[0];

    // Check if already admin
    if (
      user.publicMetadata?.role === "admin" ||
      user.privateMetadata?.role === "admin"
    ) {
      return res.status(400).json({
        error: "User is already an admin",
      });
    }

    // Grant admin role
    await clerkClient.users.updateUser(user.id, {
      publicMetadata: {
        ...user.publicMetadata,
        role: "admin",
      },
    });

    return res.json({
      message: "Admin created successfully",
      admin: {
        id: user.id,
        email: user.emailAddresses?.[0]?.emailAddress,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      },
    });
  } catch (err) {
    console.error("Error creating admin:", err);
    return res.status(500).json({
      error: "Failed to create admin",
      message: err.message,
    });
  }
}

/**
 * Remove admin privileges
 */
export async function removeAdmin(req, res) {
  try {
    const { userId } = req.params;

    // Prevent removing yourself as admin
    if (userId === req.auth.userId) {
      return res.status(400).json({
        error: "Cannot remove yourself as admin",
        message: "You cannot remove your own admin privileges",
      });
    }

    const user = await clerkClient.users.getUser(userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Remove admin role
    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        ...user.publicMetadata,
        role: "user",
      },
    });

    return res.json({
      message: "Admin privileges removed successfully",
    });
  } catch (err) {
    console.error("Error removing admin:", err);
    return res.status(500).json({
      error: "Failed to remove admin",
      message: err.message,
    });
  }
}
