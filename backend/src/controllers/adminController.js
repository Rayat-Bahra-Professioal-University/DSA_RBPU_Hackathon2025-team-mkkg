import Complaint from "../models/Complaint.js";

/**
 * Get all complaints (admin view with more details)
 */
export async function getAllComplaints(req, res) {
  try {
    const {
      page = 1,
      limit = 50,
      status,
      type,
      urgent,
      assignedTo,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (urgent !== undefined) filter.urgent = urgent === "true";
    if (assignedTo) filter.assignedTo = assignedTo;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Complaint.countDocuments(filter),
    ]);

    return res.json({
      data: complaints,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Error fetching complaints:", err);
    return res.status(500).json({
      error: "Failed to fetch complaints",
      message: err.message,
    });
  }
}

/**
 * Update complaint status (admin only)
 */
export async function updateComplaintStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, adminNote, resolutionPhotos } = req.body;

    // Validate status
    const validStatuses = ["pending", "in-progress", "closed", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status",
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Require photos when closing an issue
    if (status === "closed") {
      if (
        !resolutionPhotos ||
        !Array.isArray(resolutionPhotos) ||
        resolutionPhotos.length === 0
      ) {
        return res.status(400).json({
          error: "Resolution photos required",
          message:
            "You must provide at least one photo when closing an issue to show the resolved state",
        });
      }

      // Validate photo format
      const isValidPhotos = resolutionPhotos.every(
        (photo) => photo.url && typeof photo.url === "string"
      );
      if (!isValidPhotos) {
        return res.status(400).json({
          error: "Invalid photo format",
          message: "Each photo must have a valid URL",
        });
      }
    }

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({
        error: "Complaint not found",
        message: `No complaint found with ID: ${id}`,
      });
    }

    // Update status
    complaint.status = status;

    // Add resolution photos if closing
    if (status === "closed" && resolutionPhotos) {
      complaint.resolutionPhotos = resolutionPhotos;
      complaint.resolvedAt = new Date();
    }

    // Add admin note if provided
    if (adminNote) {
      if (!complaint.adminNotes) {
        complaint.adminNotes = [];
      }
      complaint.adminNotes.push({
        note: adminNote,
        addedBy: req.auth.userId,
        addedAt: new Date(),
      });
    }

    await complaint.save();

    return res.json({
      message: "Complaint status updated successfully",
      data: complaint,
    });
  } catch (err) {
    console.error("Error updating complaint status:", err);
    return res.status(500).json({
      error: "Failed to update complaint status",
      message: err.message,
    });
  }
}

/**
 * Assign complaint to admin (for tracking)
 */
export async function assignComplaint(req, res) {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body; // Clerk user ID

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({
        error: "Complaint not found",
        message: `No complaint found with ID: ${id}`,
      });
    }

    complaint.assignedTo = assignedTo || req.auth.userId;
    await complaint.save();

    return res.json({
      message: "Complaint assigned successfully",
      data: complaint,
    });
  } catch (err) {
    console.error("Error assigning complaint:", err);
    return res.status(500).json({
      error: "Failed to assign complaint",
      message: err.message,
    });
  }
}

/**
 * Get admin dashboard statistics
 */
export async function getAdminStats(req, res) {
  try {
    const [
      totalComplaints,
      pendingCount,
      inProgressCount,
      closedCount,
      rejectedCount,
      urgentCount,
      todayCount,
    ] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: "pending" }),
      Complaint.countDocuments({ status: "in-progress" }),
      Complaint.countDocuments({ status: "closed" }),
      Complaint.countDocuments({ status: "rejected" }),
      Complaint.countDocuments({ urgent: true }),
      Complaint.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      }),
    ]);

    // Get complaints by type
    const complaintsByType = await Complaint.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    return res.json({
      overview: {
        total: totalComplaints,
        pending: pendingCount,
        inProgress: inProgressCount,
        closed: closedCount,
        rejected: rejectedCount,
        urgent: urgentCount,
        today: todayCount,
      },
      byType: complaintsByType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recentActivity: recentActivity.map((item) => ({
        date: item._id,
        count: item.count,
      })),
    });
  } catch (err) {
    console.error("Error fetching admin stats:", err);
    return res.status(500).json({
      error: "Failed to fetch admin statistics",
      message: err.message,
    });
  }
}

/**
 * Bulk update complaints
 */
export async function bulkUpdateComplaints(req, res) {
  try {
    const { ids, status, adminNote } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        error: "Invalid input",
        message: "Please provide an array of complaint IDs",
      });
    }

    const validStatuses = ["pending", "in-progress", "closed", "rejected"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status",
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const updateData = {};
    if (status) updateData.status = status;

    const result = await Complaint.updateMany(
      { _id: { $in: ids } },
      { $set: updateData }
    );

    return res.json({
      message: `${result.modifiedCount} complaints updated successfully`,
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount,
      },
    });
  } catch (err) {
    console.error("Error bulk updating complaints:", err);
    return res.status(500).json({
      error: "Failed to bulk update complaints",
      message: err.message,
    });
  }
}

/**
 * Delete complaint (admin only - soft delete)
 */
export async function deleteComplaintAdmin(req, res) {
  try {
    const { id } = req.params;
    const { permanent } = req.query;

    if (permanent === "true") {
      // Permanent delete
      await Complaint.findByIdAndDelete(id);
      return res.json({
        message: "Complaint permanently deleted",
      });
    } else {
      // Soft delete - just mark as deleted
      const complaint = await Complaint.findById(id);
      if (!complaint) {
        return res.status(404).json({
          error: "Complaint not found",
        });
      }

      complaint.status = "rejected";
      complaint.deleted = true;
      complaint.deletedAt = new Date();
      complaint.deletedBy = req.auth.userId;
      await complaint.save();

      return res.json({
        message: "Complaint marked as deleted",
        data: complaint,
      });
    }
  } catch (err) {
    console.error("Error deleting complaint:", err);
    return res.status(500).json({
      error: "Failed to delete complaint",
      message: err.message,
    });
  }
}
