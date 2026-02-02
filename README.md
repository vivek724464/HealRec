# HealRec

**Backend Project for HealRec** — a health-record management API with user authentication, report uploads (Cloudinary), doctor–patient follow relationships, notifications, and WebSocket support.

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Run (Dev / Prod)](#run-dev--prod)
- [API Overview](#api-overview)
  - [Authentication & Users](#authentication--users)
  - [Reports](#reports)
  - [Followers / Follow Requests](#followers--follow-requests)
  - [Doctor Routes](#doctor-routes)
  - [Patient Routes](#patient-routes)
  - [Notifications](#notifications)
  - [Health Check](#health-check)
- [WebSocket](#websocket)
- [Project Structure](#project-structure)
- [Troubleshooting & Notes](#troubleshooting--notes)
- [Examples](#examples)

---

## About

HealRec is an **Express.js REST API** that provides:

- Secure user authentication
- Patient & doctor profile management with OTP verification
- Patient → doctor follow/accept flows
- Report uploads using Cloudinary
- Notifications system
- WebSocket integration for real-time features

---

## Features

- Email/OTP-based signup & login
- Password reset flow
- Patient → Doctor follow requests (accept / decline / unfollow)
- Upload patient reports to Cloudinary
- Doctor & patient profile updates with OTP verification
- Notifications listing
- Health check endpoint
- WebSocket server for real-time functionality

---

## Tech Stack

- **Node.js + Express**
- **MongoDB** (via `connectDB`)
- **Cloudinary** (via `multer-storage-cloudinary`)
- **WebSockets** (custom `wsServer`)
- **CORS** configured for frontend origins

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/vivek724464/HealRec.git

# Move into API directory
cd HealRec/healrec-API

# Install dependencies
npm install
```
Add environment variables (see below), then start the server:

# Development
npm run dev

# Production
npm start
or
node src/server.js

Visit:

GET / → Welcome to HealRec API

GET /HealRec/health → { "status": "UP" }

# Environment Variables

Create a .env file at healrec-API/.env:

- PORT=5000
- MONGO_URI=<your_mongodb_connection_string>
- FRONTEND_URL=http://localhost:5173
- JWT_SECRET=<your_jwt_secret>
- CLOUDINARY_CLOUD_NAME=<cloud_name>
- CLOUDINARY_API_KEY=<api_key>
- CLOUDINARY_API_SECRET=<api_secret>


Check src/config and .env.example (if present) for additional required variables.

# Run (Dev / Prod)

Development: npm run dev (nodemon)

Production: npm start or node src/server.js

The server creates an HTTP server and initializes WebSocket support via:

initWebSocket(server);


Default port: process.env.PORT || 5000

# API Overview

Base path: /HealRec

# Authentication & Users

src/routes/userRoutes.js

- POST /HealRec/users/signup
- POST /HealRec/users/verify-otp
- POST /HealRec/users/login
- POST /HealRec/users/forget-password
- GET  /HealRec/users/reset-password
- POST /HealRec/users/reset-password
- GET  /HealRec/users/search        (protected)

# Reports

src/routes/reportRoutes.js

- POST /HealRec/reports/uploadReport
- GET  /HealRec/reports/:patientId
- GET  /HealRec/reports/shared-with-me


Protected by isLoggedIn

Upload uses multipart/form-data

Field name: report

Stored in Cloudinary

## Followers / Follow Requests

src/routes/followRoutes.js

- POST /HealRec/followers/follow-request
- POST /HealRec/followers/accept-request
- POST /HealRec/followers/decline-request
- POST /HealRec/followers/unfollow-request
- POST /HealRec/followers/remove-patient
- GET  /HealRec/followers/get-Pending-requests
- GET  /HealRec/followers/get-followed-doctors
- GET  /HealRec/followers/get-followers

## Doctor Routes

src/routes/docRoutes.js

- PUT /HealRec/doctor/update-profile
- POST /HealRec/doctor/update-profile/verify-otp
- GET /HealRec/doctor/me

## Patient Routes

src/routes/patientRoutes.js

- PUT /HealRec/patient/update-profile
- POST /HealRec/patient/update-profile/verify-otp
- GET /HealRec/patient/search-doctors

## Notifications

src/routes/notificationRoutes.js

- GET /HealRec/notifications/


Returns notifications sorted by newest first

## Health Check
- GET /HealRec/health


Response:

{ "status": "UP" }

## WebSocket

Initialized in src/server.js

Uses initWebSocket(server)

## Logs:

Server + WebSocket running on port <PORT>


### Check implementation in:

src/websocket/
  wsServer.js

# Project Structure
```bash
healrec-API/
│
├── src/
│   ├── config/        # DB, Cloudinary, env configs
│   ├── controllers/  # Business logic
│   ├── middleware/   # Auth & role-based middleware
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API routes
│   ├── utils/
│   ├── websocket/    # WebSocket server
│   └── server.js     # App bootstrap
│
├── public/
│   └── resetPassword.html
│
├── package.json
└── .env
```
# Contributing

Open an issue describing the bug or feature.

Fork the repo and create a feature branch.

Implement changes and open a PR.

Add tests if applicable.

Update README and .env.example if needed.

# Troubleshooting & Notes

Ensure MongoDB is reachable via MONGO_URI

Verify Cloudinary credentials for file uploads

Update CORS origins in server.js if frontend URL changes

Check multer + CloudinaryStorage configuration for upload issues

Server has a global error handler that returns err.message


# Examples
## Health Check
curl http://localhost:5000/HealRec/health

## Login
curl -X POST http://localhost:5000/HealRec/users/login \
-H "Content-Type: application/json" \
-d '{"username":"<username>","password":"<password>"}'

## Upload Report
curl -X POST http://localhost:5000/HealRec/reports/uploadReport \
-H "Authorization: Bearer <token>" \
-F "report=@/path/to/file.pdf"

