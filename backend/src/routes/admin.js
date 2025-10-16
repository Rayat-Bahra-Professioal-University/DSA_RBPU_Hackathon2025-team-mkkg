import express from "express";
import * as adminController from "../controllers/adminController.js";
import * as adminManagementController from "../controllers/adminManagementController.js";
import { requireAdmin } from "../middleware/adminAuth.js";
import { requireAuthentication, getUserId } from "../middleware/auth.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(requireAuthentication);
router.use(getUserId);
router.use(requireAdmin);

// Admin statistics
router.get("/stats", adminController.getAdminStats);

// Get all complaints (admin view)
router.get("/complaints", adminController.getAllComplaints);

// Update complaint status
router.patch("/complaints/:id/status", adminController.updateComplaintStatus);

// Assign complaint
router.patch("/complaints/:id/assign", adminController.assignComplaint);

// Bulk update complaints
router.post("/complaints/bulk-update", adminController.bulkUpdateComplaints);

// Delete complaint (admin only)
router.delete("/complaints/:id", adminController.deleteComplaintAdmin);

// ===== ADMIN MANAGEMENT ROUTES =====

// Get all admins
router.get("/admins", adminManagementController.getAllAdmins);

// Create a new admin
router.post("/admins", adminManagementController.createAdmin);

// Remove admin privileges
router.delete("/admins/:userId", adminManagementController.removeAdmin);

export default router;
