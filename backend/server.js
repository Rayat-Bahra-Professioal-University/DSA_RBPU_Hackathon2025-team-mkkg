import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./src/routes/index.js";
import { connectDB } from "./src/config/db.js";
import { clerkAuth } from "./src/middleware/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_BASE_URL || "http://localhost:5173",
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add Clerk authentication middleware
app.use(clerkAuth);

// Connect to MongoDB
if (process.env.MONGO_URI) {
  console.log("🔗 Connecting to MongoDB...", process.env.MONGO_URI);

  connectDB(process.env.MONGO_URI);
} else {
  console.warn("⚠ MONGO_URI not set - database features will not work");
  console.warn("  Please add MONGO_URI to your .env file");
}

// API routes
app.use("/api/v1", routes);

// Root endpoint
app.get("/", (req, res) =>
  res.json({
    status: "ok",
    message: "CityCare Backend API",
    version: "1.0.0",
    endpoints: {
      health: "/api/v1/health",
      complaints: "/api/v1/complaints",
      stats: "/api/v1/complaints/stats",
      uploads: "/api/v1/uploads",
    },
  })
);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);

  // Clerk authentication errors
  if (err.message && err.message.includes("Unauthorized")) {
    return res.status(401).json({
      error: "Authentication required",
      message: "Please sign in to access this resource",
    });
  }

  // Multer file upload errors
  if (err.message && err.message.includes("File too large")) {
    return res.status(413).json({
      error: "File too large",
      message: "Maximum file size is 10MB",
    });
  }

  // Generic error response
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    path: req.path,
  });
});

app.listen(PORT, () => {
  console.log("=================================");
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api/v1`);
  console.log(
    `🌐 CORS: ${process.env.FRONTEND_BASE_URL || "http://localhost:5173"}`
  );
  console.log("=================================");
});
