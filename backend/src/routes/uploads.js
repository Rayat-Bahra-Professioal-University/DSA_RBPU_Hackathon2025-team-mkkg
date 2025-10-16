import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import { requireAuthentication } from "../middleware/auth.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for images
  },
  fileFilter: (req, file, cb) => {
    // Allow only images (jpg, jpeg, png, gif, webp)
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed (JPG, PNG, GIF, WEBP)"));
    }
  },
});

// Check if Cloudinary is configured
const isCloudinaryConfigured = () => {
  return (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

// Configure Cloudinary - will be called on first upload
let cloudinaryConfigured = false;
const configureCloudinary = () => {
  if (!cloudinaryConfigured && isCloudinaryConfigured()) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    cloudinaryConfigured = true;
    console.log("✓ Cloudinary configured:", {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY
        ? "***" + process.env.CLOUDINARY_API_KEY.slice(-4)
        : "missing",
    });
  }
};

// Protect upload routes - require authentication
router.use(requireAuthentication);

// Single file upload endpoint
router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file provided" });
  }

  if (!isCloudinaryConfigured()) {
    return res.status(500).json({
      error: "File upload service not configured",
      message: "Cloudinary credentials are missing",
    });
  }

  // Configure Cloudinary on first upload
  configureCloudinary();

  try {
    const streamUpload = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "citycare-complaints",
            resource_type: "image", // Only images
            transformation: [
              { width: 1200, height: 1200, crop: "limit" }, // Max dimensions
              { quality: "auto:good" }, // Auto optimize quality
              { fetch_format: "auto" }, // Auto format (WebP when supported)
            ],
          },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
      });
    };

    const result = await streamUpload(req.file.buffer);

    return res.json({
      url: result.secure_url,
      filename: req.file.originalname,
      provider: "cloudinary",
      publicId: result.public_id,
      format: result.format,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({
      error: "Upload failed",
      message: err.message || "Failed to upload image",
    });
  }
});

// Multiple files upload endpoint
router.post("/multiple", upload.array("files", 5), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files provided" });
  }

  if (!isCloudinaryConfigured()) {
    return res.status(500).json({
      error: "File upload service not configured",
      message: "Cloudinary credentials are missing",
    });
  }

  // Configure Cloudinary on first upload
  configureCloudinary();

  try {
    const uploadPromises = req.files.map((file) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "citycare-complaints",
            resource_type: "image",
            transformation: [
              { width: 1200, height: 1200, crop: "limit" },
              { quality: "auto:good" },
              { fetch_format: "auto" },
            ],
          },
          (error, result) => {
            if (result) {
              resolve({
                url: result.secure_url,
                filename: file.originalname,
                provider: "cloudinary",
                publicId: result.public_id,
                format: result.format,
              });
            } else {
              reject(error);
            }
          }
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
      });
    });

    const results = await Promise.all(uploadPromises);
    return res.json({ files: results });
  } catch (err) {
    console.error("Multiple upload error:", err);
    return res.status(500).json({
      error: "Upload failed",
      message: err.message || "Failed to upload images",
    });
  }
});

export default router;
