import express from "express";
import * as controller from "../controllers/complaintController.js";
import { requireAuthentication, getUserId } from "../middleware/auth.js";

const router = express.Router();

// Public route to get stats
router.get("/stats", controller.getComplaintStats);

// Protected routes - require authentication
router.use(requireAuthentication);
router.use(getUserId);

// Get user's own complaints
router.get("/my", controller.getMyComplaints);

// CRUD operations
router.get("/", controller.listComplaints);
router.post("/", controller.createComplaint);
router.get("/:id", controller.getComplaint);
router.put("/:id", controller.updateComplaint);
router.delete("/:id", controller.deleteComplaint);

export default router;
