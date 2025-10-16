import Complaint from "../models/Complaint.js";

function generateRegistrationNumber() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `REG${timestamp}${random}`;
}

export async function listComplaints(req, res) {
  try {
    const {
      q,
      status,
      type,
      userId,
      urgent,
      page = 1,
      limit = 50,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;
    const filter = {};

    if (q) {
      filter.$or = [
        { registrationNumber: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (userId) filter.userId = userId;
    if (urgent !== undefined) filter.urgent = urgent === "true";

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .sort(sortOptions)
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
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("Error listing complaints:", err);
    return res
      .status(500)
      .json({ error: "Failed to list complaints", message: err.message });
  }
}

export async function getComplaintStats(req, res) {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};

    const [total, pending, inProgress, closed, rejected, urgent] =
      await Promise.all([
        Complaint.countDocuments(filter),
        Complaint.countDocuments({ ...filter, status: "pending" }),
        Complaint.countDocuments({ ...filter, status: "in-progress" }),
        Complaint.countDocuments({ ...filter, status: "closed" }),
        Complaint.countDocuments({ ...filter, status: "rejected" }),
        Complaint.countDocuments({ ...filter, urgent: true }),
      ]);

    const byType = await Complaint.aggregate([
      { $match: filter },
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);

    return res.json({
      total,
      registered: total,
      pending,
      inProgress,
      closed,
      rejected,
      urgent,
      byType: byType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    });
  } catch (err) {
    console.error("Error getting stats:", err);
    return res
      .status(500)
      .json({ error: "Failed to get statistics", message: err.message });
  }
}

export async function getComplaint(req, res) {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id).lean();

    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    return res.json(complaint);
  } catch (err) {
    console.error("Error getting complaint:", err);
    if (err.name === "CastError") {
      return res.status(400).json({ error: "Invalid complaint ID" });
    }
    return res
      .status(500)
      .json({ error: "Failed to get complaint", message: err.message });
  }
}

export async function createComplaint(req, res) {
  try {
    const payload = req.body;
    const userId = req.userId || req.auth?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!payload.type) {
      return res.status(400).json({ error: "Complaint type is required" });
    }

    if (!payload.description) {
      return res.status(400).json({ error: "Description is required" });
    }

    if (!payload.location || !payload.location.lat || !payload.location.lng) {
      return res.status(400).json({ error: "Location is required" });
    }

    payload.registrationNumber = generateRegistrationNumber();
    payload.userId = userId;

    if (!payload.status) {
      payload.status = "pending";
    }

    const complaint = await Complaint.create(payload);
    console.log(
      `New complaint created: ${complaint.registrationNumber} by user ${userId}`
    );

    return res.status(201).json(complaint);
  } catch (err) {
    console.error("Error creating complaint:", err);

    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res
        .status(400)
        .json({ error: "Validation failed", details: errors });
    }

    if (err.code === 11000) {
      return res.status(409).json({ error: "Duplicate complaint detected" });
    }

    return res
      .status(500)
      .json({ error: "Failed to create complaint", message: err.message });
  }
}

export async function updateComplaint(req, res) {
  try {
    const { id } = req.params;
    const changes = req.body;
    const userId = req.userId || req.auth?.userId;

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    if (complaint.userId !== userId) {
      return res
        .status(403)
        .json({ error: "You don't have permission to update this complaint" });
    }

    delete changes.userId;
    delete changes.registrationNumber;
    delete changes.createdAt;
    delete changes.updatedAt;

    if (changes.status === "closed" && complaint.status !== "closed") {
      changes.resolvedAt = new Date();
    }

    const updated = await Complaint.findByIdAndUpdate(id, changes, {
      new: true,
      runValidators: true,
    }).lean();
    return res.json(updated);
  } catch (err) {
    console.error("Error updating complaint:", err);

    if (err.name === "CastError") {
      return res.status(400).json({ error: "Invalid complaint ID" });
    }

    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res
        .status(400)
        .json({ error: "Validation failed", details: errors });
    }

    return res
      .status(500)
      .json({ error: "Failed to update complaint", message: err.message });
  }
}

export async function deleteComplaint(req, res) {
  try {
    const { id } = req.params;
    const userId = req.userId || req.auth?.userId;

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    if (complaint.userId !== userId) {
      return res
        .status(403)
        .json({ error: "You don't have permission to delete this complaint" });
    }

    await Complaint.findByIdAndDelete(id);
    return res.json({
      success: true,
      message: "Complaint deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting complaint:", err);

    if (err.name === "CastError") {
      return res.status(400).json({ error: "Invalid complaint ID" });
    }

    return res
      .status(500)
      .json({ error: "Failed to delete complaint", message: err.message });
  }
}

export async function getMyComplaints(req, res) {
  try {
    const userId = req.userId || req.auth?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const {
      status,
      page = 1,
      limit = 50,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;
    const filter = { userId };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .sort(sortOptions)
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
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("Error getting user complaints:", err);
    return res
      .status(500)
      .json({ error: "Failed to get your complaints", message: err.message });
  }
}
