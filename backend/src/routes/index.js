import express from "express";
import complaintsRouter from "./complaints.js";
import uploadsRouter from "./uploads.js";
import adminRouter from "./admin.js";

const router = express.Router();

router.get("/health", (req, res) => res.json({ status: "ok" }));
router.use("/complaints", complaintsRouter);
router.use("/uploads", uploadsRouter);
router.use("/admin", adminRouter);

export default router;
