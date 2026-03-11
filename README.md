# HealRec

**A comprehensive healthcare platform** for secure medical record management with real-time messaging, doctor-patient follow relationships, and notifications.

---

## ⚠️ Important: Read Before Getting Started

This project has been **fully refactored and fixed** for production readiness. Please read:
- **[STARTUP_GUIDE.md](STARTUP_GUIDE.md)** - Complete setup and deployment guide
- **[FIXES_SUMMARY.md](FIXES_SUMMARY.md)** - All critical issues that were fixed
- **[quick-start.bat](quick-start.bat)** - Windows setup script (or [quick-start.sh](quick-start.sh) for Linux/Mac)

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Architecture](#project-architecture)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Overview](#api-overview)
- [WebSocket](#websocket)
- [Critical Fixes Applied](#critical-fixes-applied)
- [Common Issues](#common-issues)
- [Examples](#examples)
- [Contributing](#contributing)

---

## About

HealRec is a **full-stack healthcare management platform** with:

- **REST API** (Node.js + Express) - Port 5000
- **WebSocket Server** (Real-time messaging) - Port 7000
- **React Frontend** (SPA with Vite) - Port 5173
- **RabbitMQ Integration** (Event-driven microservices)
- **MongoDB Database** (Document storage)
- **Cloudinary Integration** (Secure file storage)

Perfect for telemedicine platforms, health clinics, and patient-doctor communication systems.

---

## Features

✅ **User Management**
- Email/OTP-based signup & login (Email + SMS)
- Password reset flow
- Doctor & patient profile management
- Role-based access control

✅ **Doctor-Patient Relationships**
- Patient → Doctor follow requests
- Doctor accept/decline/remove functionality
- Relationship status tracking (pending, accepted, declined)

✅ **Medical Records**
- Upload and store patient medical reports
- Cloudinary cloud storage integration
- Secure access control & sharing

✅ **Real-Time Messaging**
- WebSocket-based instant messaging
- Message history retrieval
- Online/offline status
- Read/unread tracking

✅ **Notifications**
- Real-time notifications via WebSocket
- Persistent notification history
- Event-based triggers
- Read/unread status management

✅ **Inter-Service Communication**
- RabbitMQ event bus
- Asynchronous event publishing
- Service decoupling & scalability

---

## Tech Stack

### Backend
- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **WebSocket (ws)**
- **RabbitMQ (amqplib)**
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Cloudinary** - Cloud storage
- **Nodemailer** + **Twilio** - Notifications
- **Redis** - Caching (optional)

### Frontend
- **React 18**
- **Vite** - Build tool
- **React Router**
- **TanStack React Query**
- **Axios**
- **Shadcn/UI** + **Tailwind CSS**

---

## Quick Start

### Option 1: Automated Setup (Recommended)

**Windows:**
```cmd
quick-start.bat
```

**Linux/Mac:**
```bash
bash quick-start.sh
```

### Option 2: Manual Setup

```bash
# 1. Clone repository
git clone <repo>
cd HealRec

# 2. Ensure environment files exist with proper configuration
#    - healrec-API/.env
#    - ChatService/.env

# 3. Start MongoDB & RabbitMQ (Docker)
docker run -d -p 27017:27017 --name mongodb mongo:latest
docker run -d -p 5672:5672 -p 15672:15672 --name rabbitmq \
  rabbitmq:3.12-management

# 4. See "Running the Application" section below
```

---

## Project Architecture

```
HealRec/
├── healrec-API/              # REST API (Port 5000)
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── websocket/
│   │   └── server.js
│   ├── .env                  # Configuration (keep this)
│   └── package.json
│
├── ChatService/              # WebSocket Server (Port 7000)
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── ws/
│   │   └── server.js
│   ├── .env                  # Configuration (keep this)
│   └── package.json
│
├── client/client/            # React Frontend (Port 5173)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── App.jsx
│   └── package.json
│
├── Shared/                   # RabbitMQ utilities
│   └── RabbitMQ/
│
├── STARTUP_GUIDE.md
├── FIXES_SUMMARY.md
├── quick-start.sh/.bat
└── README.md
```

---

## Environment Variables

### healrec-API/.env

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/healrec
JWT_SECRET=your_super_secret_key_min_32_chars
RABBITMQ_URL=amqp://guest:guest@localhost:5672/
FRONTEND_URL=http://localhost:5173

CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

### ChatService/.env

```env
PORT=7000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/healrec
JWT_SECRET=same_as_healrec_api
RABBITMQ_URL=amqp://guest:guest@localhost:5672/
FRONTEND_URL=http://localhost:5173
```

### client/client/.env

```env
# URL of the REST API
VITE_HEALREC_API_URL=http://localhost:5000/HealRec
# WebSocket endpoint – must point to ChatService (default port 7000)
VITE_WS_URL=ws://localhost:7000
```

Ensure all `.env` files are properly configured with your credentials.

---

## Running the Application

### Prerequisites
- Node.js v16+
- MongoDB running
- RabbitMQ running
- Environment variables configured

### Terminal 1: HealRec API
```bash
cd healrec-API
npm install
npm run dev
# Server at http://localhost:5000
```

### Terminal 2: ChatService
```bash
cd ChatService
npm install
npm run dev
# Chat at http://localhost:7000
```

### Terminal 3: Frontend
```bash
cd client/client
npm install
npm run dev
# Frontend at http://localhost:5173
```

### Verify Everything Works
```bash
curl http://localhost:5000/HealRec/health
# Response: { "status": "UP" }
```

---

## API Overview

### Base URL: `http://localhost:5000/HealRec`

### Authentication Endpoints (`/users`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/signup` | ❌ | Start OTP signup |
| POST | `/verify-otp` | ❌ | Complete signup |
| POST | `/login` | ❌ | Login user |
| POST | `/forget-password` | ❌ | Request password reset |
| POST | `/reset-password` | ❌ | Reset password |
| GET | `/search?q=name` | ✅ | Search users |

### Reports Endpoints (`/reports`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/uploadReport` | ✅ | Patient | Upload report |
| GET | `/:patientId` | ✅ | Patient | Get reports |
| GET | `/shared-with-me` | ✅ | Doctor | Get shared reports |

### Follow Endpoints (`/followers`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/follow-request` | ✅ | Patient | Send request |
| POST | `/accept-request` | ✅ | Doctor | Accept request |
| POST | `/decline-request` | ✅ | Doctor | Decline request |
| POST | `/unfollow-request` | ✅ | Patient | Unfollow doctor |
| POST | `/remove-patient` | ✅ | Doctor | Remove patient |
| GET | `/get-Pending-requests` | ✅ | Doctor | Get pending |
| GET | `/get-followed-doctors` | ✅ | Patient | Get followed |
| GET | `/get-followers` | ✅ | Doctor | Get followers |

### Doctor Endpoints (`/doctor`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/me` | ✅ | Get profile |
| PUT | `/update-profile` | ✅ | Update profile |
| POST | `/update-profile/verify-otp` | ✅ | Verify OTP |

### Patient Endpoints (`/patient`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/me` | ✅ | Get profile |
| PUT | `/update-profile` | ✅ | Update profile |
| POST | `/update-profile/verify-otp` | ✅ | Verify OTP |
| GET | `/search-doctors?q=name` | ✅ | Search doctors |

### Notifications Endpoints (`/notifications`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | ✅ | Get notifications |

### Health Endpoint (`/health`)

```bash
curl http://localhost:5000/HealRec/health
# Response: { "status": "UP" }
```

---

## WebSocket

### Connection

**Endpoint:** `ws://localhost:7000`

```javascript
const token = localStorage.getItem('token');
const ws = new WebSocket('ws://localhost:7000');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: "AUTH",
    token: token
  }));
};
```

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `join_chat` | `{ with: "userId" }` | Start chatting |
| `leave_chat` | `{}` | Stop chatting |
| `message` | `{ receiverId: "...", content: "..." }` | Send message |
| `history` | `{ with: "userId" }` | Get history |

### Server → Client Events

| Event | Description |
|-------|-------------|
| `info` | Auth success response |
| `message` | Incoming message |
| `notification` | Message notification |
| `sent` | Sent confirmation |
| `history` | Message history |
| `follow_notification` | Follow event (payload.event may be `FOLLOW_REQUEST`, `FOLLOW_ACCEPTED`, `FOLLOW_UNFOLLOWED`, `FOLLOW_REVOKED`) |
| `error` | Error response |

---

## Critical Fixes Applied

✅ **CORS Configuration** - Multiple origin support
✅ **Token Security** - Authorization header (not URL params)
✅ **RabbitMQ Validation** - Required environment variable✅ **Real-time follow requests** - Doctor dashboards now update instantly when a patient sends a request✅ **AllowedPair Cleanup** - Delete on unfollow/revoke
✅ **Error Handling** - Proper validation & throwing
✅ **WebSocket Security** - Secure authentication
✅ **ID Handling** - Proper MongoDB ObjectId conversion
✅ **Logging** - Clear debugging indicators

**[See FIXES_SUMMARY.md for detailed information](FIXES_SUMMARY.md)**

---

## Common Issues & Solutions

### CORS Error
```
Solution: Check FRONTEND_URL in .env matches your frontend origin
```

### "Missing RABBITMQ_URL"
```
Solution: Add to .env
RABBITMQ_URL=amqp://guest:guest@localhost:5672/
```

### MongoDB Connection Refused
```
Solution: docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### WebSocket Connection Failed
```
Solution: Ensure ChatService is running and token is valid
```

---

## Examples

### Signup Flow
```bash
# Request OTP
curl -X POST http://localhost:5000/HealRec/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "role": "patient",
    "username": "john_doe",
    "email": "john@example.com",
    "password": "Pass123!",
    "name": "John Doe",
    "signupMethod": "email"
  }'

# Verify OTP (check email for code)
curl -X POST http://localhost:5000/HealRec/users/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "...",
    "otp": "123456"
  }'
```

### Follow Doctor
```bash
# Patient sends request
curl -X POST http://localhost:5000/HealRec/followers/follow-request \
  -H "Authorization: Bearer <token>" \
  -d '{"doctorId": "..."}'

# Doctor accepts
curl -X POST http://localhost:5000/HealRec/followers/accept-request \
  -H "Authorization: Bearer <token>" \
  -d '{"patientId": "..."}'
```

### Upload Report
```bash
curl -X POST http://localhost:5000/HealRec/reports/uploadReport \
  -H "Authorization: Bearer <token>" \
  -F "report=@file.pdf"
```

---

## Contributing

1. Create issue describing bug/feature
2. Fork repository
3. Create `feature/your-feature` branch
4. Make changes and test locally
5. Submit pull request

---

## Support & Documentation

- [STARTUP_GUIDE.md](STARTUP_GUIDE.md) - Complete setup guide
- [FIXES_SUMMARY.md](FIXES_SUMMARY.md) - All fixes applied
- [quick-start.bat](quick-start.bat) / [quick-start.sh](quick-start.sh) - Automated setup

---

## License

ISC

---

## Authors

- **Vivek** - Backend Development
- **Saloni** - Backend Features

---

**Built with ❤️ for healthcare**
