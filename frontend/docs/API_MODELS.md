# API Data Models & Schemas

## CityCare - Backend Data Structures

**Version:** 1.0  
**Date:** October 14, 2025

---

## Table of Contents

1. [User Models](#1-user-models)
2. [Issue Models](#2-issue-models)
3. [Location Models](#3-location-models)
4. [File Models](#4-file-models)
5. [Enumerations](#5-enumerations)
6. [Validation Rules](#6-validation-rules)
7. [Database Schema](#7-database-schema)

---

## 1. User Models

### 1.1 User

**Description:** Core user entity managed by Clerk authentication

```typescript
interface User {
  id: string; // UUID - Primary key
  clerkUserId: string; // Clerk user ID (unique)
  email: string; // User email (unique)
  firstName: string; // User's first name
  lastName: string; // User's last name
  phoneNumber?: string; // Optional phone number
  profileImageUrl?: string; // Profile picture URL
  isOAuthUser: boolean; // True if signed in via OAuth
  oauthProvider?: string; // 'google' | 'microsoft' | 'apple'
  createdAt: Date; // Account creation timestamp
  updatedAt: Date; // Last update timestamp
  lastLoginAt: Date; // Last login timestamp
  isActive: boolean; // Account status (default: true)
}
```

### 1.2 UserProfile

**Description:** Extended user profile information

```typescript
interface UserProfile {
  userId: string; // Foreign key -> User.id
  address?: string; // User's address
  city?: string; // City name
  state?: string; // State/province
  pincode?: string; // Postal code
  preferredLanguage: string; // 'en' | 'hi' | etc.
  notificationPreferences: {
    email: boolean; // Email notifications enabled
    sms: boolean; // SMS notifications enabled
    push: boolean; // Push notifications enabled
  };
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 2. Issue Models

### 2.1 Issue (Main Entity)

**Description:** Civic issue/complaint reported by users

```typescript
interface Issue {
  id: string; // UUID - Primary key
  registrationNumber: string; // Unique ID (format: #367374XXXXXXXXXXXX)
  userId: string; // Foreign key -> User.id (issue creator)

  // Issue Details
  title: string; // Issue title (max 200 chars)
  description: string; // Detailed description (20-500 chars)
  category: IssueCategory; // Type of issue (enum)
  priority: IssuePriority; // Priority level (enum)
  status: IssueStatus; // Current status (enum)

  // Location Information
  location: Location; // Embedded location object

  // Contact Information
  contactPhone?: string; // Contact number (optional)

  // Media Attachments
  attachments: IssueAttachment[]; // Array of file attachments

  // Timestamps
  createdAt: Date; // Issue creation time
  updatedAt: Date; // Last modification time
  resolvedAt?: Date; // Resolution time (if resolved)

  // Metadata
  viewCount: number; // Number of views
  upvotes: number; // Community upvotes
  assignedTo?: string; // Assigned authority ID
}
```

### 2.2 IssueAttachment

**Description:** File attachments for issues

```typescript
interface IssueAttachment {
  id: string; // UUID - Primary key
  issueId: string; // Foreign key -> Issue.id
  fileUrl: string; // Cloud storage URL
  fileName: string; // Original file name
  fileType: string; // MIME type
  fileSize: number; // Size in bytes
  thumbnailUrl?: string; // Thumbnail for images/videos
  uploadedAt: Date; // Upload timestamp
}
```

### 2.3 IssueTimeline

**Description:** Status change history for issues

```typescript
interface IssueTimeline {
  id: string; // UUID - Primary key
  issueId: string; // Foreign key -> Issue.id
  status: IssueStatus; // Status at this point
  message: string; // Status change message
  changedBy?: string; // User/Authority who made change
  createdAt: Date; // Event timestamp
  metadata?: Record<string, any>; // Additional information
}
```

### 2.4 IssueComment

**Description:** Comments on issues (future feature)

```typescript
interface IssueComment {
  id: string; // UUID - Primary key
  issueId: string; // Foreign key -> Issue.id
  userId: string; // Foreign key -> User.id
  comment: string; // Comment text
  isOfficial: boolean; // True if from authority
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 3. Location Models

### 3.1 Location

**Description:** Geographic location information

```typescript
interface Location {
  latitude: number; // Latitude (-90 to 90)
  longitude: number; // Longitude (-180 to 180)
  address: string; // Full formatted address
  city: string; // City name
  state: string; // State/province
  country: string; // Country name
  pincode?: string; // Postal code
  landmark?: string; // Nearby landmark
}
```

### 3.2 GeoLocation (Database Storage)

**Description:** Optimized location storage for spatial queries

```typescript
interface GeoLocation {
  type: "Point"; // GeoJSON type
  coordinates: [number, number]; // [longitude, latitude]
}
```

---

## 4. File Models

### 4.1 FileUploadRequest

**Description:** File upload request from frontend

```typescript
interface FileUploadRequest {
  file: File; // File object
  issueId?: string; // Associated issue (if exists)
  uploadType: "issue" | "profile"; // Upload category
}
```

### 4.2 FileUploadResponse

**Description:** Response after successful file upload

```typescript
interface FileUploadResponse {
  fileId: string; // Generated file ID
  fileUrl: string; // Publicly accessible URL
  thumbnailUrl?: string; // Thumbnail URL (if applicable)
  fileName: string; // Original file name
  fileSize: number; // File size in bytes
  mimeType: string; // MIME type
  uploadedAt: Date; // Upload timestamp
}
```

---

## 5. Enumerations

### 5.1 IssueCategory

**Description:** Types of civic issues

```typescript
enum IssueCategory {
  POTHOLES = "potholes",
  RUBBISH_BINS = "rubbish-bins",
  STREETLIGHTS = "streetlights",
  PUBLIC_SPACES = "public-spaces",
  WATER_SUPPLY = "water-supply",
  DRAINAGE = "drainage",
  ROAD_MAINTENANCE = "road-maintenance",
  ILLEGAL_CONSTRUCTION = "illegal-construction",
  NOISE_POLLUTION = "noise-pollution",
  OTHER = "other",
}
```

### 5.2 IssueStatus

**Description:** Issue lifecycle statuses

```typescript
enum IssueStatus {
  PENDING = "pending", // Awaiting assignment
  IN_PROGRESS = "in-progress", // Being worked on
  RESOLVED = "resolved", // Fixed/completed
  CLOSED = "closed", // Archived/closed
  REJECTED = "rejected", // Not actionable
  DUPLICATE = "duplicate", // Duplicate of another issue
}
```

### 5.3 IssuePriority

**Description:** Priority levels

```typescript
enum IssuePriority {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  URGENT = "urgent",
  CRITICAL = "critical",
}
```

### 5.4 UserRole

**Description:** User access roles (future implementation)

```typescript
enum UserRole {
  CITIZEN = "citizen", // Regular user
  AUTHORITY = "authority", // Municipal authority
  ADMIN = "admin", // System administrator
  MODERATOR = "moderator", // Content moderator
}
```

---

## 6. Validation Rules

### 6.1 User Validation

| Field       | Rules                                     |
| ----------- | ----------------------------------------- |
| email       | Required, valid email format, unique      |
| firstName   | Required, 2-50 characters, alphabets only |
| lastName    | Required, 2-50 characters, alphabets only |
| phoneNumber | Optional, 10 digits, numeric              |

### 6.2 Issue Validation

| Field              | Rules                                 |
| ------------------ | ------------------------------------- |
| title              | Required, 10-200 characters           |
| description        | Required, 20-500 characters           |
| category           | Required, must be valid IssueCategory |
| priority           | Optional, defaults to 'normal'        |
| location.latitude  | Required, -90 to 90                   |
| location.longitude | Required, -180 to 180                 |
| location.address   | Required, max 500 characters          |
| contactPhone       | Optional, 10 digits if provided       |
| attachments        | Max 5 files, each ≤ 10MB              |

### 6.3 File Validation

| Rule                | Value                                                                    |
| ------------------- | ------------------------------------------------------------------------ |
| Max file size       | 10 MB (10,485,760 bytes)                                                 |
| Max files per issue | 5                                                                        |
| Allowed MIME types  | image/jpeg, image/png, image/gif, image/webp, video/mp4, video/quicktime |
| Allowed extensions  | .jpg, .jpeg, .png, .gif, .webp, .mp4, .mov                               |

---

## 7. Database Schema

### 7.1 MongoDB Collections

#### Collection: `users`

```json
{
  "_id": "ObjectId",
  "clerkUserId": "string (unique, indexed)",
  "email": "string (unique, indexed)",
  "firstName": "string",
  "lastName": "string",
  "phoneNumber": "string?",
  "profileImageUrl": "string?",
  "isOAuthUser": "boolean",
  "oauthProvider": "string?",
  "createdAt": "Date (indexed)",
  "updatedAt": "Date",
  "lastLoginAt": "Date",
  "isActive": "boolean"
}
```

**Indexes:**

- `clerkUserId` (unique)
- `email` (unique)
- `createdAt` (descending)

#### Collection: `issues`

```json
{
  "_id": "ObjectId",
  "registrationNumber": "string (unique, indexed)",
  "userId": "ObjectId (indexed, ref: users)",
  "title": "string",
  "description": "string",
  "category": "string (indexed)",
  "priority": "string",
  "status": "string (indexed)",
  "location": {
    "type": "Point",
    "coordinates": "[longitude, latitude]"
  },
  "locationDetails": {
    "address": "string",
    "city": "string (indexed)",
    "state": "string",
    "country": "string",
    "pincode": "string",
    "landmark": "string?"
  },
  "contactPhone": "string?",
  "attachments": "Array<ObjectId> (ref: attachments)",
  "createdAt": "Date (indexed)",
  "updatedAt": "Date",
  "resolvedAt": "Date?",
  "viewCount": "number",
  "upvotes": "number",
  "assignedTo": "ObjectId? (ref: users)"
}
```

**Indexes:**

- `registrationNumber` (unique)
- `userId`
- `category`
- `status`
- `createdAt` (descending)
- `location` (2dsphere for geo queries)
- Compound: `{status: 1, createdAt: -1}`
- Compound: `{category: 1, status: 1}`

#### Collection: `attachments`

```json
{
  "_id": "ObjectId",
  "issueId": "ObjectId (indexed, ref: issues)",
  "fileUrl": "string",
  "fileName": "string",
  "fileType": "string",
  "fileSize": "number",
  "thumbnailUrl": "string?",
  "uploadedAt": "Date"
}
```

**Indexes:**

- `issueId`

#### Collection: `timeline`

```json
{
  "_id": "ObjectId",
  "issueId": "ObjectId (indexed, ref: issues)",
  "status": "string",
  "message": "string",
  "changedBy": "ObjectId? (ref: users)",
  "createdAt": "Date (indexed)",
  "metadata": "object?"
}
```

**Indexes:**

- `issueId`
- `createdAt` (ascending)
- Compound: `{issueId: 1, createdAt: 1}`

#### Collection: `userProfiles`

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (unique, indexed, ref: users)",
  "address": "string?",
  "city": "string?",
  "state": "string?",
  "pincode": "string?",
  "preferredLanguage": "string",
  "notificationPreferences": {
    "email": "boolean",
    "sms": "boolean",
    "push": "boolean"
  },
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Indexes:**

- `userId` (unique)

### 7.2 PostgreSQL Alternative (Relational)

If using PostgreSQL instead of MongoDB:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(15),
  profile_image_url TEXT,
  is_oauth_user BOOLEAN DEFAULT FALSE,
  oauth_provider VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- Issues table
CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal',
  status VARCHAR(20) DEFAULT 'pending',
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  pincode VARCHAR(10),
  landmark VARCHAR(200),
  contact_phone VARCHAR(15),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,
  view_count INTEGER DEFAULT 0,
  upvotes INTEGER DEFAULT 0,
  assigned_to UUID REFERENCES users(id)
);

-- Attachments table
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size BIGINT NOT NULL,
  thumbnail_url TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Timeline table
CREATE TABLE timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  changed_by UUID REFERENCES users(id),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  preferred_language VARCHAR(10) DEFAULT 'en',
  notification_email BOOLEAN DEFAULT TRUE,
  notification_sms BOOLEAN DEFAULT FALSE,
  notification_push BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_issues_user_id ON issues(user_id);
CREATE INDEX idx_issues_category ON issues(category);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_created_at ON issues(created_at DESC);
CREATE INDEX idx_issues_status_created ON issues(status, created_at DESC);
CREATE INDEX idx_attachments_issue_id ON attachments(issue_id);
CREATE INDEX idx_timeline_issue_id ON timeline(issue_id);
CREATE INDEX idx_timeline_created_at ON timeline(created_at);
```

---

## 8. Response Wrapper Models

### 8.1 Success Response

```typescript
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: Date;
}
```

### 8.2 Error Response

```typescript
interface ApiErrorResponse {
  success: false;
  error: {
    code: string; // Error code (e.g., 'VALIDATION_ERROR')
    message: string; // Human-readable message
    details?: any; // Additional error details
  };
  timestamp: Date;
}
```

### 8.3 Paginated Response

```typescript
interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number; // Current page (1-indexed)
    limit: number; // Items per page
    totalItems: number; // Total count
    totalPages: number; // Total pages
    hasNext: boolean; // Has next page
    hasPrev: boolean; // Has previous page
  };
  timestamp: Date;
}
```

---

**Document Control**

| Version | Date         | Author           | Changes         |
| ------- | ------------ | ---------------- | --------------- |
| 1.0     | Oct 14, 2025 | Development Team | Initial version |
