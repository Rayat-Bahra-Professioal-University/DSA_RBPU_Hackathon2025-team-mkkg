# API Endpoints Documentation

## CityCare - REST API Specification

**Version:** 1.0  
**Date:** October 14, 2025  
**Base URL:** `https://api.citycare.com/v1` (to be deployed)

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Users API](#2-users-api)
3. [Issues API](#3-issues-api)
4. [Search & Filter API](#4-search--filter-api)
5. [File Upload API](#5-file-upload-api)
6. [Statistics API](#6-statistics-api)
7. [Timeline API](#7-timeline-api)
8. [Error Codes](#8-error-codes)

---

## API Conventions

### Request Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
Accept: application/json
```

### Response Format

**Success Response:**

```json
{
  "success": true,
  "data": {},
  "message": "Optional success message",
  "timestamp": "2025-10-14T10:30:00.000Z"
}
```

**Error Response:**

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  },
  "timestamp": "2025-10-14T10:30:00.000Z"
}
```

---

## 1. Authentication

### 1.1 Verify Clerk Token

**Endpoint:** `POST /auth/verify`

**Description:** Verify Clerk JWT token and sync user data

**Headers:**

```http
Authorization: Bearer <clerk_jwt_token>
```

**Request Body:** None

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "clerkUserId": "user_xxxxx",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phoneNumber": "9876543210",
      "profileImageUrl": "https://...",
      "isActive": true
    },
    "token": "internal_jwt_token"
  }
}
```

**Status Codes:**

- `200` - Success
- `401` - Invalid or expired token
- `403` - User account inactive

---

### 1.2 Sync User from Clerk

**Endpoint:** `POST /auth/sync`

**Description:** Create or update user from Clerk webhook

**Headers:**

```http
Content-Type: application/json
X-Clerk-Signature: <webhook_signature>
```

**Request Body:**

```json
{
  "type": "user.created",
  "data": {
    "id": "user_xxxxx",
    "email_addresses": [{ "email_address": "user@example.com" }],
    "first_name": "John",
    "last_name": "Doe",
    "profile_image_url": "https://...",
    "external_accounts": []
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "User synced successfully"
}
```

---

## 2. Users API

### 2.1 Get Current User

**Endpoint:** `GET /users/me`

**Description:** Get authenticated user's profile

**Auth Required:** Yes

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "9876543210",
    "profileImageUrl": "https://...",
    "profile": {
      "address": "123 Main St",
      "city": "Delhi",
      "state": "Delhi",
      "pincode": "110001",
      "preferredLanguage": "en",
      "notificationPreferences": {
        "email": true,
        "sms": false,
        "push": true
      }
    },
    "statistics": {
      "totalIssuesReported": 15,
      "resolvedIssues": 8,
      "pendingIssues": 7
    }
  }
}
```

---

### 2.2 Update User Profile

**Endpoint:** `PATCH /users/me`

**Description:** Update user profile information

**Auth Required:** Yes

**Request Body:**

```json
{
  "phoneNumber": "9876543210",
  "profile": {
    "address": "123 Main St",
    "city": "Delhi",
    "state": "Delhi",
    "pincode": "110001",
    "preferredLanguage": "en"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "phoneNumber": "9876543210",
    "profile": {
      /* updated profile */
    }
  },
  "message": "Profile updated successfully"
}
```

---

### 2.3 Delete User Account

**Endpoint:** `DELETE /users/me`

**Description:** Delete user account (must be done after Clerk deletion)

**Auth Required:** Yes

**Response:**

```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

## 3. Issues API

### 3.1 Create Issue

**Endpoint:** `POST /issues`

**Description:** Create a new civic issue

**Auth Required:** Yes

**Request Body:**

```json
{
  "title": "Pothole on Main Street",
  "description": "Large pothole near traffic signal causing inconvenience...",
  "category": "potholes",
  "priority": "urgent",
  "location": {
    "latitude": 28.6139,
    "longitude": 77.209,
    "address": "Main Street, Near City Center, New Delhi - 110001",
    "city": "New Delhi",
    "state": "Delhi",
    "country": "India",
    "pincode": "110001",
    "landmark": "Near City Center Mall"
  },
  "contactPhone": "9876543210",
  "attachmentIds": ["file_uuid_1", "file_uuid_2"]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "registrationNumber": "#367374873467873899",
    "title": "Pothole on Main Street",
    "description": "Large pothole near...",
    "category": "potholes",
    "priority": "urgent",
    "status": "pending",
    "location": {
      /* location object */
    },
    "contactPhone": "9876543210",
    "attachments": [
      {
        "id": "file_uuid_1",
        "fileUrl": "https://...",
        "thumbnailUrl": "https://...",
        "fileName": "pothole.jpg"
      }
    ],
    "createdAt": "2025-10-14T10:30:00.000Z",
    "updatedAt": "2025-10-14T10:30:00.000Z"
  },
  "message": "Issue created successfully"
}
```

**Status Codes:**

- `201` - Created
- `400` - Validation error
- `401` - Unauthorized
- `413` - File size limit exceeded

---

### 3.2 Get Issue by ID

**Endpoint:** `GET /issues/:id`

**Description:** Get detailed information about a specific issue

**Auth Required:** Yes

**Path Parameters:**

- `id` - Issue UUID or registration number

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "registrationNumber": "#367374873467873899",
    "title": "Pothole on Main Street",
    "description": "Large pothole near...",
    "category": "potholes",
    "priority": "urgent",
    "status": "in-progress",
    "location": {
      "latitude": 28.6139,
      "longitude": 77.209,
      "address": "Main Street, Near City Center, New Delhi - 110001",
      "city": "New Delhi",
      "state": "Delhi",
      "country": "India",
      "pincode": "110001",
      "landmark": "Near City Center Mall"
    },
    "contactPhone": "9876543210",
    "attachments": [
      {
        "id": "file_uuid_1",
        "fileUrl": "https://cdn.citycare.com/...",
        "thumbnailUrl": "https://cdn.citycare.com/.../thumb",
        "fileName": "pothole.jpg",
        "fileType": "image/jpeg",
        "fileSize": 1048576
      }
    ],
    "timeline": [
      {
        "id": "timeline_uuid_1",
        "status": "pending",
        "message": "Issue registered successfully",
        "createdAt": "2025-10-10T10:30:00.000Z"
      },
      {
        "id": "timeline_uuid_2",
        "status": "in-progress",
        "message": "Issue assigned to maintenance team",
        "changedBy": "Authority Name",
        "createdAt": "2025-10-11T09:15:00.000Z"
      }
    ],
    "createdAt": "2025-10-10T10:30:00.000Z",
    "updatedAt": "2025-10-12T14:20:00.000Z",
    "viewCount": 45,
    "upvotes": 12
  }
}
```

**Status Codes:**

- `200` - Success
- `404` - Issue not found

---

### 3.3 Get User's Issues

**Endpoint:** `GET /issues/my-issues`

**Description:** Get all issues created by the authenticated user

**Auth Required:** Yes

**Query Parameters:**

- `page` (default: 1) - Page number
- `limit` (default: 10) - Items per page
- `status` (optional) - Filter by status
- `category` (optional) - Filter by category
- `sortBy` (default: createdAt) - Sort field
- `sortOrder` (default: desc) - Sort direction

**Example:**

```
GET /issues/my-issues?page=1&limit=10&status=pending&sortBy=createdAt&sortOrder=desc
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "registrationNumber": "#367374873467873899",
      "title": "Pothole on Main Street",
      "category": "potholes",
      "status": "in-progress",
      "createdAt": "2025-10-10T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### 3.4 Update Issue (Authority Only)

**Endpoint:** `PATCH /issues/:id`

**Description:** Update issue status and details (for authorities)

**Auth Required:** Yes (Authority role)

**Request Body:**

```json
{
  "status": "resolved",
  "message": "Issue has been fixed. Road resurfaced.",
  "assignedTo": "authority_user_id"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "resolved",
    "resolvedAt": "2025-10-14T10:30:00.000Z"
  },
  "message": "Issue updated successfully"
}
```

---

### 3.5 Delete Issue (Creator Only)

**Endpoint:** `DELETE /issues/:id`

**Description:** Delete an issue (only creator can delete, only if pending)

**Auth Required:** Yes

**Response:**

```json
{
  "success": true,
  "message": "Issue deleted successfully"
}
```

**Status Codes:**

- `200` - Deleted
- `403` - Not authorized (not creator or status not pending)
- `404` - Issue not found

---

## 4. Search & Filter API

### 4.1 Search Issues

**Endpoint:** `GET /issues/search`

**Description:** Search and filter issues with advanced criteria

**Auth Required:** Yes

**Query Parameters:**

- `q` - Search term (searches in title, description, registration number)
- `category` - Filter by category
- `status` - Filter by status
- `priority` - Filter by priority
- `city` - Filter by city
- `state` - Filter by state
- `dateFrom` - Start date (ISO 8601)
- `dateTo` - End date (ISO 8601)
- `latitude` - Center latitude (for proximity search)
- `longitude` - Center longitude (for proximity search)
- `radius` - Radius in km (for proximity search)
- `page` - Page number
- `limit` - Items per page
- `sortBy` - Sort field
- `sortOrder` - Sort direction

**Example:**

```
GET /issues/search?q=pothole&category=potholes&status=pending&city=Delhi&page=1&limit=10
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "registrationNumber": "#367374873467873899",
      "title": "Pothole on Main Street",
      "description": "Large pothole near...",
      "category": "potholes",
      "status": "pending",
      "priority": "urgent",
      "location": {
        "latitude": 28.6139,
        "longitude": 77.209,
        "address": "Main Street, Near City Center, New Delhi - 110001",
        "city": "New Delhi"
      },
      "createdAt": "2025-10-10T10:30:00.000Z",
      "viewCount": 45,
      "upvotes": 12
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 156,
    "totalPages": 16,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### 4.2 Search by Registration Number

**Endpoint:** `GET /issues/registration/:registrationNumber`

**Description:** Find issue by exact registration number

**Auth Required:** Yes

**Path Parameters:**

- `registrationNumber` - Registration number (with or without #)

**Example:**

```
GET /issues/registration/367374873467873899
GET /issues/registration/%23367374873467873899
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "registrationNumber": "#367374873467873899"
    /* full issue object */
  }
}
```

---

## 5. File Upload API

### 5.1 Upload File

**Endpoint:** `POST /files/upload`

**Description:** Upload image or video file for issue

**Auth Required:** Yes

**Headers:**

```http
Content-Type: multipart/form-data
```

**Request Body (FormData):**

```
file: <binary>
uploadType: "issue"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "fileId": "file_uuid",
    "fileUrl": "https://cdn.citycare.com/uploads/xxx.jpg",
    "thumbnailUrl": "https://cdn.citycare.com/uploads/xxx_thumb.jpg",
    "fileName": "pothole.jpg",
    "fileSize": 1048576,
    "mimeType": "image/jpeg",
    "uploadedAt": "2025-10-14T10:30:00.000Z"
  },
  "message": "File uploaded successfully"
}
```

**Status Codes:**

- `201` - Created
- `400` - Invalid file type or size
- `413` - File too large (>10MB)

---

### 5.2 Delete File

**Endpoint:** `DELETE /files/:fileId`

**Description:** Delete an uploaded file (only if not attached to issue)

**Auth Required:** Yes

**Response:**

```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

---

## 6. Statistics API

### 6.1 Get Dashboard Statistics

**Endpoint:** `GET /statistics/dashboard`

**Description:** Get overall statistics for dashboard

**Auth Required:** Yes

**Response:**

```json
{
  "success": true,
  "data": {
    "totalIssues": 1543,
    "pendingIssues": 342,
    "inProgressIssues": 256,
    "resolvedIssues": 892,
    "closedIssues": 53,
    "myIssues": {
      "total": 15,
      "pending": 7,
      "resolved": 8
    },
    "categoryCounts": {
      "potholes": 456,
      "streetlights": 234,
      "rubbish-bins": 189,
      "public-spaces": 123,
      "other": 541
    },
    "recentIssues": [
      {
        "id": "uuid",
        "registrationNumber": "#367374873467873899",
        "title": "Pothole on Main Street",
        "status": "pending",
        "createdAt": "2025-10-14T10:30:00.000Z"
      }
    ]
  }
}
```

---

### 6.2 Get User Statistics

**Endpoint:** `GET /statistics/user/:userId`

**Description:** Get statistics for specific user

**Auth Required:** Yes

**Response:**

```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "totalIssuesReported": 15,
    "pendingIssues": 7,
    "resolvedIssues": 8,
    "averageResolutionTime": "5.2 days",
    "contributionScore": 87,
    "issuesByCategory": {
      "potholes": 8,
      "streetlights": 4,
      "other": 3
    }
  }
}
```

---

## 7. Timeline API

### 7.1 Get Issue Timeline

**Endpoint:** `GET /issues/:id/timeline`

**Description:** Get complete timeline/history of an issue

**Auth Required:** Yes

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "timeline_uuid_1",
      "issueId": "issue_uuid",
      "status": "pending",
      "message": "Issue registered successfully",
      "changedBy": null,
      "createdAt": "2025-10-10T10:30:00.000Z"
    },
    {
      "id": "timeline_uuid_2",
      "issueId": "issue_uuid",
      "status": "in-progress",
      "message": "Issue assigned to maintenance team",
      "changedBy": {
        "id": "authority_uuid",
        "name": "Municipal Authority",
        "role": "authority"
      },
      "createdAt": "2025-10-11T09:15:00.000Z"
    }
  ]
}
```

---

### 7.2 Add Timeline Event (Authority Only)

**Endpoint:** `POST /issues/:id/timeline`

**Description:** Add a timeline event to an issue

**Auth Required:** Yes (Authority role)

**Request Body:**

```json
{
  "status": "in-progress",
  "message": "Team dispatched to location",
  "metadata": {
    "teamId": "team_uuid",
    "estimatedCompletionDate": "2025-10-20"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "timeline_uuid",
    "issueId": "issue_uuid",
    "status": "in-progress",
    "message": "Team dispatched to location",
    "createdAt": "2025-10-14T10:30:00.000Z"
  },
  "message": "Timeline event added"
}
```

---

## 8. Error Codes

| Code                   | HTTP Status | Description                                  |
| ---------------------- | ----------- | -------------------------------------------- |
| `AUTH_TOKEN_INVALID`   | 401         | Invalid or expired authentication token      |
| `AUTH_TOKEN_MISSING`   | 401         | No authentication token provided             |
| `USER_NOT_FOUND`       | 404         | User account not found                       |
| `USER_INACTIVE`        | 403         | User account is inactive                     |
| `VALIDATION_ERROR`     | 400         | Request validation failed                    |
| `ISSUE_NOT_FOUND`      | 404         | Issue not found                              |
| `ISSUE_NOT_AUTHORIZED` | 403         | Not authorized to access this issue          |
| `ISSUE_CANNOT_DELETE`  | 403         | Issue cannot be deleted (status not pending) |
| `FILE_TOO_LARGE`       | 413         | File size exceeds 10MB limit                 |
| `FILE_TYPE_INVALID`    | 400         | Invalid file type (only images/videos)       |
| `FILE_LIMIT_EXCEEDED`  | 400         | Maximum 5 files allowed per issue            |
| `RATE_LIMIT_EXCEEDED`  | 429         | Too many requests, try again later           |
| `SERVER_ERROR`         | 500         | Internal server error                        |

---

## Rate Limiting

**Global Rate Limit:** 100 requests per minute per user

**File Upload Rate Limit:** 10 uploads per hour per user

**Headers:**

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1634203200
```

---

## Webhooks (Future Feature)

### Issue Status Changed

**URL:** Customer-defined webhook URL

**Method:** POST

**Payload:**

```json
{
  "event": "issue.status_changed",
  "issueId": "uuid",
  "registrationNumber": "#367374873467873899",
  "oldStatus": "pending",
  "newStatus": "in-progress",
  "timestamp": "2025-10-14T10:30:00.000Z"
}
```

---

**Document Control**

| Version | Date         | Author           | Changes         |
| ------- | ------------ | ---------------- | --------------- |
| 1.0     | Oct 14, 2025 | Development Team | Initial version |
