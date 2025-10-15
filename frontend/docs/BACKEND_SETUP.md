# Backend Setup & Integration Guide

## CityCare - Server Implementation Guide

**Version:** 1.0  
**Date:** October 14, 2025

---

## Table of Contents

1. [Technology Stack Options](#1-technology-stack-options)
2. [Project Structure](#2-project-structure)
3. [Environment Setup](#3-environment-setup)
4. [Database Setup](#4-database-setup)
5. [Authentication Integration](#5-authentication-integration)
6. [API Implementation](#6-api-implementation)
7. [File Storage Setup](#7-file-storage-setup)
8. [Deployment Guide](#8-deployment-guide)
9. [Testing Strategy](#9-testing-strategy)

---

## 1. Technology Stack Options

### Option A: Node.js + Express + MongoDB (Recommended)

**Why:** JavaScript full-stack, great for rapid development

```
Backend Framework: Express.js v4.18+
Database: MongoDB v6.0+
ODM: Mongoose v7.0+
Authentication: Clerk Node SDK
File Storage: AWS S3 / Cloudinary
Runtime: Node.js v18+ LTS
```

### Option B: Node.js + NestJS + PostgreSQL

**Why:** Enterprise-grade, TypeScript, structured architecture

```
Backend Framework: NestJS v10+
Database: PostgreSQL v15+
ORM: TypeORM / Prisma
Authentication: Clerk Node SDK
File Storage: AWS S3
Runtime: Node.js v18+ LTS
```

### Option C: Python + FastAPI + PostgreSQL

**Why:** High performance, great for ML integration

```
Backend Framework: FastAPI v0.104+
Database: PostgreSQL v15+
ORM: SQLAlchemy
Authentication: Clerk Python SDK
File Storage: AWS S3
Runtime: Python 3.11+
```

**This guide will focus on Option A (Node.js + Express + MongoDB)**

---

## 2. Project Structure

### Recommended Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   ├── clerk.js             # Clerk configuration
│   │   ├── cloudinary.js        # File upload config
│   │   └── constants.js         # App constants
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Issue.js             # Issue schema
│   │   ├── Attachment.js        # Attachment schema
│   │   ├── Timeline.js          # Timeline schema
│   │   └── UserProfile.js       # UserProfile schema
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── userController.js    # User CRUD
│   │   ├── issueController.js   # Issue CRUD
│   │   ├── searchController.js  # Search & filter
│   │   ├── fileController.js    # File uploads
│   │   └── statsController.js   # Statistics
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   ├── validation.js        # Request validation
│   │   ├── errorHandler.js      # Error handling
│   │   ├── rateLimit.js         # Rate limiting
│   │   └── upload.js            # File upload handling
│   ├── routes/
│   │   ├── auth.routes.js       # Auth endpoints
│   │   ├── user.routes.js       # User endpoints
│   │   ├── issue.routes.js      # Issue endpoints
│   │   ├── search.routes.js     # Search endpoints
│   │   ├── file.routes.js       # File endpoints
│   │   └── stats.routes.js      # Stats endpoints
│   ├── services/
│   │   ├── clerkService.js      # Clerk API interactions
│   │   ├── issueService.js      # Business logic
│   │   ├── fileService.js       # File operations
│   │   ├── emailService.js      # Email notifications
│   │   └── notificationService.js # Push notifications
│   ├── utils/
│   │   ├── logger.js            # Winston logger
│   │   ├── validators.js        # Custom validators
│   │   ├── helpers.js           # Helper functions
│   │   └── responseFormatter.js # API response formatter
│   ├── app.js                   # Express app setup
│   └── server.js                # Server entry point
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example
├── .env
├── .gitignore
├── package.json
├── nodemon.json
└── README.md
```

---

## 3. Environment Setup

### 3.1 Initialize Project

```bash
mkdir backend
cd backend
npm init -y
```

### 3.2 Install Dependencies

```bash
# Core dependencies
npm install express mongoose dotenv cors helmet

# Authentication
npm install @clerk/clerk-sdk-node

# File Upload
npm install multer cloudinary

# Validation
npm install joi express-validator

# Utilities
npm install winston morgan bcrypt jsonwebtoken

# Development
npm install --save-dev nodemon
```

### 3.3 Environment Variables

Create `.env` file:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database
MONGODB_URI=mongodb://localhost:27017/citycare
# OR for MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/citycare

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx

# JWT (for internal tokens)
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRATION=7d

# File Storage - Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# File Upload Limits
MAX_FILE_SIZE=10485760    # 10MB in bytes
MAX_FILES_PER_ISSUE=5

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000      # 1 minute
RATE_LIMIT_MAX_REQUESTS=100

# CORS
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173

# Email (Optional - SendGrid/Mailgun)
EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=your_sendgrid_api_key
EMAIL_FROM=noreply@citycare.com

# SMS (Optional - Twilio)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Logging
LOG_LEVEL=info
```

### 3.4 Package.json Scripts

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest --coverage",
    "lint": "eslint src/",
    "format": "prettier --write \"src/**/*.js\""
  }
}
```

---

## 4. Database Setup

### 4.1 MongoDB Connection

**File:** `src/config/database.js`

```javascript
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Create indexes
    await createIndexes();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const createIndexes = async () => {
  const { Issue } = require("../models");

  // Geospatial index for location-based queries
  await Issue.collection.createIndex({ "location.coordinates": "2dsphere" });

  // Text index for search
  await Issue.collection.createIndex({ title: "text", description: "text" });
};

module.exports = connectDB;
```

### 4.2 Mongoose Models

**File:** `src/models/User.js`

```javascript
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    clerkUserId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    phoneNumber: String,
    profileImageUrl: String,
    isOAuthUser: {
      type: Boolean,
      default: false,
    },
    oauthProvider: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: Date,
  },
  {
    timestamps: true,
  }
);

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model("User", userSchema);
```

**File:** `src/models/Issue.js`

```javascript
const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      minlength: 20,
      maxlength: 500,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "potholes",
        "rubbish-bins",
        "streetlights",
        "public-spaces",
        "water-supply",
        "drainage",
        "road-maintenance",
        "illegal-construction",
        "noise-pollution",
        "other",
      ],
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent", "critical"],
      default: "normal",
    },
    status: {
      type: String,
      enum: [
        "pending",
        "in-progress",
        "resolved",
        "closed",
        "rejected",
        "duplicate",
      ],
      default: "pending",
      index: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function (coords) {
            return (
              coords.length === 2 &&
              coords[0] >= -180 &&
              coords[0] <= 180 && // longitude
              coords[1] >= -90 &&
              coords[1] <= 90
            ); // latitude
          },
          message: "Invalid coordinates",
        },
      },
    },
    locationDetails: {
      address: { type: String, required: true },
      city: { type: String, index: true },
      state: String,
      country: String,
      pincode: String,
      landmark: String,
    },
    contactPhone: String,
    attachments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attachment",
      },
    ],
    viewCount: {
      type: Number,
      default: 0,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resolvedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
issueSchema.index({ status: 1, createdAt: -1 });
issueSchema.index({ category: 1, status: 1 });
issueSchema.index({ location: "2dsphere" });

// Pre-save hook to generate registration number
issueSchema.pre("save", async function (next) {
  if (!this.registrationNumber) {
    this.registrationNumber = `#367374${Date.now()}${Math.floor(
      Math.random() * 1000
    )}`;
  }
  next();
});

module.exports = mongoose.model("Issue", issueSchema);
```

**File:** `src/models/Attachment.js`

```javascript
const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema(
  {
    issueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      required: true,
      index: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    thumbnailUrl: String,
    publicId: String, // Cloudinary public ID for deletion
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Attachment", attachmentSchema);
```

**File:** `src/models/Timeline.js`

```javascript
const mongoose = require("mongoose");

const timelineSchema = new mongoose.Schema(
  {
    issueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      required: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    metadata: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

timelineSchema.index({ issueId: 1, createdAt: 1 });

module.exports = mongoose.model("Timeline", timelineSchema);
```

---

## 5. Authentication Integration

### 5.1 Clerk Middleware

**File:** `src/middleware/auth.js`

```javascript
const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");
const User = require("../models/User");

// Clerk authentication middleware
const requireAuth = ClerkExpressRequireAuth({
  secretKey: process.env.CLERK_SECRET_KEY,
});

// Sync/create user in database
const syncUser = async (req, res, next) => {
  try {
    const { userId: clerkUserId } = req.auth;

    // Find or create user
    let user = await User.findOne({ clerkUserId });

    if (!user) {
      // Fetch user data from Clerk
      const clerkUser = await req.auth.getUser();

      user = await User.create({
        clerkUserId,
        email: clerkUser.emailAddresses[0].emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        profileImageUrl: clerkUser.imageUrl,
        isOAuthUser: clerkUser.externalAccounts.length > 0,
        oauthProvider: clerkUser.externalAccounts[0]?.provider,
        lastLoginAt: new Date(),
      });
    } else {
      // Update last login
      user.lastLoginAt = new Date();
      await user.save();
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { requireAuth, syncUser };
```

### 5.2 Webhook Handler

**File:** `src/controllers/authController.js`

```javascript
const { Webhook } = require("svix");
const User = require("../models/User");

const handleClerkWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    const payload = JSON.stringify(req.body);
    const headers = req.headers;

    const wh = new Webhook(webhookSecret);
    const evt = wh.verify(payload, headers);

    const { type, data } = evt;

    switch (type) {
      case "user.created":
      case "user.updated":
        await User.findOneAndUpdate(
          { clerkUserId: data.id },
          {
            email: data.email_addresses[0].email_address,
            firstName: data.first_name,
            lastName: data.last_name,
            profileImageUrl: data.image_url,
            isOAuthUser: data.external_accounts.length > 0,
            oauthProvider: data.external_accounts[0]?.provider,
          },
          { upsert: true, new: true }
        );
        break;

      case "user.deleted":
        await User.findOneAndUpdate(
          { clerkUserId: data.id },
          { isActive: false }
        );
        break;
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = { handleClerkWebhook };
```

---

## 6. API Implementation

### 6.1 Issue Controller Example

**File:** `src/controllers/issueController.js`

```javascript
const Issue = require("../models/Issue");
const Timeline = require("../models/Timeline");
const Attachment = require("../models/Attachment");

// Create new issue
const createIssue = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      location,
      contactPhone,
      attachmentIds,
    } = req.body;

    // Create issue
    const issue = await Issue.create({
      userId: req.user._id,
      title,
      description,
      category,
      priority: priority || "normal",
      location: {
        type: "Point",
        coordinates: [location.longitude, location.latitude],
      },
      locationDetails: {
        address: location.address,
        city: location.city,
        state: location.state,
        country: location.country,
        pincode: location.pincode,
        landmark: location.landmark,
      },
      contactPhone,
      attachments: attachmentIds || [],
    });

    // Create initial timeline event
    await Timeline.create({
      issueId: issue._id,
      status: "pending",
      message: "Issue registered successfully",
    });

    // Populate attachments
    await issue.populate("attachments");

    res.status(201).json({
      success: true,
      data: issue,
      message: "Issue created successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get issue by ID
const getIssueById = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate("attachments")
      .populate("userId", "firstName lastName");

    if (!issue) {
      return res.status(404).json({
        success: false,
        error: { code: "ISSUE_NOT_FOUND", message: "Issue not found" },
      });
    }

    // Increment view count
    issue.viewCount += 1;
    await issue.save();

    // Get timeline
    const timeline = await Timeline.find({ issueId: issue._id })
      .populate("changedBy", "firstName lastName")
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: {
        ...issue.toObject(),
        timeline,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createIssue,
  getIssueById,
  // ... other methods
};
```

### 6.2 Routes Setup

**File:** `src/routes/issue.routes.js`

```javascript
const express = require("express");
const router = express.Router();
const { requireAuth, syncUser } = require("../middleware/auth");
const issueController = require("../controllers/issueController");
const { validateIssueCreation } = require("../middleware/validation");

// All routes require authentication
router.use(requireAuth);
router.use(syncUser);

router.post("/", validateIssueCreation, issueController.createIssue);
router.get("/my-issues", issueController.getUserIssues);
router.get("/:id", issueController.getIssueById);
router.patch("/:id", issueController.updateIssue);
router.delete("/:id", issueController.deleteIssue);

module.exports = router;
```

---

## 7. File Storage Setup

### 7.1 Cloudinary Configuration

**File:** `src/config/cloudinary.js`

```javascript
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
```

### 7.2 File Upload Middleware

**File:** `src/middleware/upload.js`

```javascript
const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images and videos are allowed."));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE),
  },
  fileFilter,
});

module.exports = upload;
```

### 7.3 File Controller

**File:** `src/controllers/fileController.js`

```javascript
const cloudinary = require("../config/cloudinary");
const Attachment = require("../models/Attachment");
const streamifier = require("streamifier");

const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: "FILE_REQUIRED", message: "No file provided" },
      });
    }

    // Upload to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "citycare/issues",
        resource_type: "auto",
      },
      async (error, result) => {
        if (error) {
          return next(error);
        }

        // Create attachment record
        const attachment = await Attachment.create({
          issueId: null, // Will be linked when issue is created
          fileUrl: result.secure_url,
          fileName: req.file.originalname,
          fileType: req.file.mimetype,
          fileSize: req.file.size,
          thumbnailUrl: result.thumbnail_url,
          publicId: result.public_id,
        });

        res.status(201).json({
          success: true,
          data: {
            fileId: attachment._id,
            fileUrl: attachment.fileUrl,
            thumbnailUrl: attachment.thumbnailUrl,
            fileName: attachment.fileName,
            fileSize: attachment.fileSize,
            mimeType: attachment.fileType,
            uploadedAt: attachment.createdAt,
          },
        });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadFile };
```

---

## 8. Deployment Guide

### 8.1 Production Environment Variables

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
CLERK_SECRET_KEY=sk_live_xxxxx
FRONTEND_URL=https://citycare.com
```

### 8.2 Deploy to Railway/Render/Heroku

**Railway:**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

### 8.3 Docker Setup

**Dockerfile:**

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "src/server.js"]
```

**docker-compose.yml:**

```yaml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    depends_on:
      - mongodb

  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

---

## 9. Testing Strategy

### 9.1 Unit Tests (Jest)

```javascript
// tests/unit/services/issueService.test.js
const issueService = require("../../src/services/issueService");

describe("Issue Service", () => {
  test("should generate unique registration number", async () => {
    const regNum = await issueService.generateRegistrationNumber();
    expect(regNum).toMatch(/^#367374\d+$/);
  });
});
```

### 9.2 Integration Tests

```javascript
// tests/integration/issues.test.js
const request = require("supertest");
const app = require("../../src/app");

describe("Issues API", () => {
  test("POST /issues should create issue", async () => {
    const response = await request(app)
      .post("/api/v1/issues")
      .set("Authorization", `Bearer ${testToken}`)
      .send({
        title: "Test Issue",
        description: "Test description...",
        category: "potholes",
        location: { latitude: 28.6139, longitude: 77.209 },
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

---

**Document Control**

| Version | Date         | Author           | Changes         |
| ------- | ------------ | ---------------- | --------------- |
| 1.0     | Oct 14, 2025 | Development Team | Initial version |
