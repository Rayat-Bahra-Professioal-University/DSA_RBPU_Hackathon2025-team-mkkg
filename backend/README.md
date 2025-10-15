CityCare Backend

This is a minimal Express backend scaffold for the CityCare frontend.

Features:
- Express API with endpoints for complaints and uploads
- Cloudinary integration for file uploads (images/videos)
- Tiny JSON file DB for prototyping
- Clerk auth placeholder (add middleware where needed)

Quick start:

1. Copy `.env.example` to `.env` and fill values (Cloudinary credentials, FRONTEND_BASE_URL if necessary)
2. Install dependencies

   npm install

3. Start server in dev mode

   npm run dev

4. API endpoints:
- GET /api/v1/health
- GET /api/v1/complaints
- POST /api/v1/complaints
- GET /api/v1/complaints/:id
- POST /api/v1/uploads  (multipart/form-data, field name: file)

Notes:
- This is a prototype. Replace the file-backed DB with a real database (Postgres, MongoDB) for production.
- Add Clerk verification middleware for protected routes as needed.
