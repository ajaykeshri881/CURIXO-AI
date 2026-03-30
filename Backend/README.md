<p align="center">
  <h1 align="center">🚀 Curixo Backend</h1>
  <p align="center">
    AI-Powered Career Platform — Backend API
    <br />
    <em>Built with Node.js · Express · MongoDB · Gemini AI</em>
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen?logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-5.x-blue?logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/AI-Gemini-FF6F00?logo=google" alt="Gemini" />
  <img src="https://img.shields.io/badge/License-ISC-yellow" alt="License" />
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Security](#-security)
- [Rate Limiting](#-rate-limiting)
- [Testing with Postman](#-testing-with-postman)
- [Error Reference](#-error-reference)
- [Frontend Integration Guide](#-frontend-integration-guide)
- [License](#-license)

---

## 🌟 Overview

Curixo Backend is a RESTful API that powers the Curixo AI Career Platform. It provides intelligent resume analysis, resume generation, and mock interview capabilities — all backed by Google's Gemini AI. The server handles authentication, authorization, file uploads, rate limiting, and PDF generation.

---

## ✨ Features

| Category | Feature |
|----------|---------|
| **🔐 Authentication** | Access + Refresh token cookies with automatic renewal |
| **🔒 Security** | CSRF protection, Helmet, XSS sanitization, CORS, Zod validation |
| **📄 ATS Checker** | Upload a resume + job description → get AI-powered ATS score & feedback |
| **✍️ Resume Improvement** | AI suggestions to improve your resume for a specific role |
| **📝 Resume Builder** | Generate a complete resume from scratch with HTML + PDF output |
| **🎤 Mock Interview** | AI-generated interview reports with personalized feedback |
| **⏱️ Rate Limiting** | Per-feature, per-user daily usage limits (DB-backed) |
| **🔄 Session Management** | Logout from current device or all devices at once |
| **🔑 AI Key Failover** | Supports multiple Gemini API keys with automatic round-robin rotation |
| **🛡️ Global Error Handler** | Uniform JSON error responses for all error types (Mongoose, JWT, Zod, etc.) |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Node.js 18+** | Runtime environment |
| **Express 5** | Web framework |
| **MongoDB + Mongoose** | Database & ODM |
| **JWT** | Cookie-based authentication (access + refresh tokens) |
| **Zod** | Request body/params validation |
| **Multer** | File uploads (resume PDF) |
| **Puppeteer** | Server-side PDF generation |
| **Gemini AI** | AI-powered resume analysis, generation & interview reports |
| **Helmet** | HTTP security headers |
| **bcryptjs** | Password hashing |

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        CLIENT (Frontend)                       │
│              React + Axios (withCredentials: true)              │
└───────────────────────────┬────────────────────────────────────┘
                            │  HTTPS
                            ▼
┌────────────────────────────────────────────────────────────────┐
│                      EXPRESS MIDDLEWARE                         │
│                                                                │
│  ┌──────────┐ ┌──────┐ ┌─────┐ ┌──────┐ ┌────────┐ ┌───────┐ │
│  │  Helmet   │ │ CORS │ │ XSS │ │ CSRF │ │  Auth  │ │ Rate  │ │
│  │          │ │      │ │     │ │      │ │Middleware│ │Limiter│ │
│  └──────────┘ └──────┘ └─────┘ └──────┘ └────────┘ └───────┘ │
└───────────────────────────┬────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│                         ROUTES                                 │
│                                                                │
│   /api/auth    /api/ats    /api/resume    /api/interview        │
└───────────────────────────┬────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│                       CONTROLLERS                              │
│    auth.controller  ats.controller  resume.controller           │
│                     interview.controller                        │
└──────────┬───────────────────────────────────┬─────────────────┘
           │                                   │
           ▼                                   ▼
┌─────────────────────┐           ┌──────────────────────┐
│   MongoDB (Mongoose) │           │    AI Services        │
│                     │           │    (Gemini API)        │
│  • Users            │           │                       │
│  • Refresh Tokens   │           │  • Resume Analysis    │
│  • Blacklisted Tokens│          │  • Resume Generation  │
│  • Usage Tracking   │           │  • Interview Reports  │
│  • ATS Reports      │           │                       │
│  • Interview Reports│           │  Puppeteer (PDF Gen)  │
└─────────────────────┘           └──────────────────────┘
```

---

## 📁 Project Structure

```
Backend/
├── package.json
├── server.js                          # Entry point — connects DB & starts server
├── .env                               # Environment variables (not committed)
└── src/
    ├── app.js                         # Express app setup & middleware registration
    ├── config/
    │   └── database.js                # MongoDB connection
    ├── controllers/
    │   ├── auth.controller.js         # Register, login, logout, refresh, get-me
    │   ├── ats.controller.js          # ATS check & resume improvement
    │   ├── interview.controller.js    # Mock interview & report generation
    │   └── resume.controller.js       # Resume creation & PDF export
    ├── middlewares/
    │   ├── auth.middleware.js          # JWT verification (required auth)
    │   ├── optionalAuth.middleware.js  # JWT verification (optional — for guests)
    │   ├── rateLimiter.middleware.js   # Per-feature daily usage limiter
    │   ├── csrf.middleware.js          # Double-submit CSRF cookie pattern
    │   ├── xss.middleware.js           # Sanitize request body/query/params
    │   ├── validate.middleware.js      # Zod schema validation
    │   ├── error.middleware.js         # Global error handler (Mongoose, JWT, Zod, Multer)
    │   └── file.middleware.js          # Multer config (PDF only, 3MB limit)
    ├── models/
    │   ├── user.model.js              # User schema (name, email, password, tokenVersion)
    │   ├── refreshToken.model.js      # Persisted refresh tokens
    │   ├── blacklist.model.js         # Blacklisted access tokens (15min TTL)
    │   ├── usage.model.js             # Daily usage tracking per user/guest
    │   ├── atsReport.model.js         # Saved ATS analysis reports
    │   └── interviewReport.model.js   # Saved interview reports
    ├── routes/
    │   ├── auth.routes.js             # Auth endpoints
    │   ├── ats.routes.js              # ATS endpoints
    │   ├── interview.routes.js        # Interview endpoints
    │   └── resume.routes.js           # Resume endpoints
    ├── services/
    │   └── ai/
    │       ├── google.js              # Gemini AI client + multi-key failover
    │       ├── interview.service.js   # Interview analysis logic
    │       ├── resume.service.js      # ATS analysis & improvement logic
    │       └── resume/
    │           ├── ats.service.js     # ATS scoring service
    │           ├── generator.service.js # AI resume generation
    │           ├── template.js        # HTML resume template
    │           ├── pdf.service.js     # Puppeteer HTML → PDF
    │           └── helpers.js         # Utility functions
    └── validators/
        └── auth.validator.js          # Zod schemas for register/login
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **MongoDB** (local or Atlas connection string)
- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

```bash
# 1. Navigate to the Backend directory
cd Backend

# 2. Install dependencies
npm install

# 3. Create your .env file (see Environment Variables below)

# 4. Start development server (with auto-restart)
npm run dev

# 5. Or start production server
npm start
```

The server will start on `http://localhost:3000` (or your configured `PORT`).

---

## 🔧 Environment Variables

Create a `.env` file in the `Backend/` root:

```env
# ──── Server ────
PORT=3000
NODE_ENV=development

# ──── Database ────
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/curixo

# ──── CORS ────
CORS_ORIGIN=http://localhost:5173

# ──── Cookies (important for cross-origin production) ────
COOKIE_SAME_SITE=lax                           # use "none" for different frontend/backend domains
COOKIE_SECURE=false                            # must be true when COOKIE_SAME_SITE=none

# ──── AI (supports multiple comma-separated keys for failover) ────
GOOGLE_GENAI_API_KEY=your_key_1,your_key_2,your_key_3,your_key_4

# ──── JWT Tokens ────
JWT_SECRET=your_fallback_secret
JWT_ACCESS_SECRET=your_access_token_secret       # optional, falls back to JWT_SECRET
JWT_REFRESH_SECRET=your_refresh_token_secret      # optional, falls back to JWT_SECRET
ACCESS_TOKEN_TTL=15m                               # access token lifetime
REFRESH_TOKEN_TTL=7d                               # refresh token lifetime
```

> **Note:** If `JWT_ACCESS_SECRET` or `JWT_REFRESH_SECRET` are not set, the system falls back to `JWT_SECRET` for both.

> **Cookie note:** For production setups where frontend and backend are on different domains, set `COOKIE_SAME_SITE=none` and `COOKIE_SECURE=true` (HTTPS required).

> **AI Keys:** You can provide 1 or more Gemini API keys separated by commas. The system uses round-robin rotation and automatically fails over to the next key if one hits a rate limit or error. There is no limit on how many keys you can add.

---

## 📡 API Reference

**Base URL:** `http://localhost:3000`

### 🔐 Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | Public | Register a new user |
| `POST` | `/login` | Public | Login with email & password |
| `POST` | `/refresh` | Public | Issue new access token via refresh cookie |
| `GET` | `/csrf-token` | Public | Get CSRF token for mutating requests |
| `GET` | `/get-me` | 🔒 Required | Get current logged-in user details |
| `POST` | `/logout` | Public | Logout current device (clears cookies) |
| `POST` | `/logout-all` | 🔒 Required | Logout all devices (revokes all tokens) |

<details>
<summary><b>Request/Response Examples</b></summary>

**Register:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Ajay Keshri",
  "email": "ajay@example.com",
  "password": "securepassword123"
}
```

**Login:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "ajay@example.com",
  "password": "securepassword123"
}
```

**Success Response (both):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "665a...",
    "name": "Ajay Keshri",
    "email": "ajay@example.com"
  }
}
```
</details>

---

### 📄 ATS — `/api/ats`

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| `POST` | `/check` | Optional | Guest: 1/day, User: 3/day | Analyze resume against job description |
| `POST` | `/improve` | 🔒 Required | 3/day | AI-powered resume improvement suggestions |

<details>
<summary><b>Request/Response Examples</b></summary>

**ATS Check:**
```http
POST /api/ats/check
Content-Type: multipart/form-data

resume: [PDF file]
jobTitle: "Senior Frontend Developer"
jobDescription: "We are looking for..."
```

**ATS Improve:**
```http
POST /api/ats/improve
Content-Type: application/json
x-csrf-token: <csrfToken>

{
  "resumeText": "Full text of the resume...",
  "jobTitle": "Senior Frontend Developer",
  "jobDescription": "We are looking for...",
  "atsFeedback": { /* previous ATS check result */ }
}
```
</details>

---

### 📝 Resume — `/api/resume`

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| `POST` | `/create-from-scratch` | 🔒 Required | 3/day | Generate resume from user info (HTML + text) |
| `POST` | `/create-from-scratch/pdf` | 🔒 Required | 3/day | Generate resume as downloadable PDF |

<details>
<summary><b>Request/Response Examples</b></summary>

**Create Resume:**
```http
POST /api/resume/create-from-scratch
Content-Type: application/json
x-csrf-token: <csrfToken>

{
  "jobTitle": "Senior Frontend Developer",
  "userInfo": {
    "name": "Ajay Keshri",
    "email": "ajay@example.com",
    "phone": "+91-9876543210",
    "skills": ["React", "Node.js", "TypeScript"]
  }
}
```

**Generate PDF:**
```http
POST /api/resume/create-from-scratch/pdf
Content-Type: application/json
x-csrf-token: <csrfToken>

{ "resumeHtml": "<html>...</html>" }
```
</details>

---

### 🎤 Interview — `/api/interview`

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| `POST` | `/` | 🔒 Required | 3/day | Generate mock interview report |
| `GET` | `/` | 🔒 Required | — | List all interview reports |
| `GET` | `/report/:interviewId` | 🔒 Required | — | Get specific interview report |
| `POST` | `/resume/pdf/:interviewReportId` | 🔒 Required | 3/day | Generate interview-optimized resume PDF |

<details>
<summary><b>Request Example</b></summary>

**Generate Interview Report:**
```http
POST /api/interview/
Content-Type: multipart/form-data
x-csrf-token: <csrfToken>

resume: [PDF file]
selfDescription: "I am a frontend developer with 3 years..."
jobDescription: "We are looking for..."
```
</details>

---

## 🔒 Security

The API implements multiple layers of security:

| Layer | Implementation | Details |
|-------|---------------|---------|
| **HTTP Headers** | Helmet | Sets secure headers (X-Frame-Options, CSP, etc.) |
| **XSS Protection** | Custom middleware | Sanitizes all `req.body`, `req.query`, `req.params` |
| **CORS** | Express CORS | Restricted to `CORS_ORIGIN` with credentials |
| **CSRF** | Double-submit cookie | Cookie + header token must match on mutating requests |
| **Input Validation** | Zod | Schema-based validation on auth endpoints |
| **Password Security** | bcryptjs | Passwords hashed with salt rounds = 10 |
| **Token Strategy** | Access + Refresh | Short-lived access (15m), long-lived refresh (7d) |
| **Token Revocation** | Blacklist + Version | Blacklisted tokens auto-expire (15min TTL via MongoDB) |
| **Session Revocation** | Token versioning | `logout-all` bumps version, invalidating all sessions |
| **Global Error Handler** | Custom middleware | Catches all unhandled errors, returns clean JSON |

### CSRF Flow

```
1. Client calls GET /api/auth/csrf-token
2. Server sets csrfToken cookie (httpOnly: false) + returns token in response
3. Client reads token from cookie or response body
4. Client sends x-csrf-token header on all POST/PUT/PATCH/DELETE requests
5. Server validates: cookie token === header token
```

> **Ignored paths** (no CSRF needed): `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`

### Auth & Session Flow

```
┌─ Register/Login ─────────────────────────────────────────┐
│  Server sets 3 cookies:                                  │
│  • accessToken  (httpOnly, 15 min)                       │
│  • refreshToken (httpOnly, 7 days)                       │
│  • token        (httpOnly, 15 min — legacy compat)       │
└──────────────────────────────────────────────────────────┘
        │
        ▼  Access token expires
┌─ Refresh ────────────────────────────────────────────────┐
│  POST /api/auth/refresh                                  │
│  Server verifies refresh cookie → issues new accessToken │
└──────────────────────────────────────────────────────────┘
        │
        ▼  User logs out
┌─ Logout (current device) ────────────────────────────────┐
│  POST /api/auth/logout                                   │
│  Blacklists access token, deletes refresh token,         │
│  clears all cookies                                      │
└──────────────────────────────────────────────────────────┘
        │
        ▼  User logs out everywhere
┌─ Logout All Devices ─────────────────────────────────────┐
│  POST /api/auth/logout-all                               │
│  Increments user.tokenVersion → all existing tokens      │
│  become invalid, deletes all refresh tokens              │
└──────────────────────────────────────────────────────────┘
```

---

## ⏱️ Rate Limiting

Usage is tracked per-feature, per-day in the database:

| Feature Key | Guest Limit | User Limit | Login Required |
|------------|-------------|------------|----------------|
| `ats_check` | 1/day | 3/day | No |
| `ats_improve` | — | 3/day | Yes |
| `resume_from_scratch` | — | 3/day | Yes |
| `resume_from_scratch_pdf` | — | 3/day | Yes |
| `interview_report` | — | 3/day | Yes |
| `interview_resume_pdf` | — | 3/day | Yes |

- Guest users are identified by IP address.
- Logged-in users are tracked by their MongoDB user ID.
- Limits reset daily at midnight (IST / Asia/Kolkata).

---

## 🧪 Testing with Postman

1. **Enable cookies**: Make sure cookie jar is enabled in Postman settings.
2. **Get CSRF token**: `GET /api/auth/csrf-token` — note the `csrfToken` cookie.
3. **Register or Login**: `POST /api/auth/register` or `/login`.
4. **Set CSRF header**: For all `POST`/`PUT`/`DELETE` requests, add header:
   ```
   x-csrf-token: <value from csrfToken cookie>
   ```
5. **Upload files**: Use `form-data` body type with key `resume` for PDF uploads.

---

## ❌ Error Reference

All errors are handled by the **Global Error Handler** and returned in a uniform JSON format:

```json
{
  "message": "Human-readable error message",
  "details": ["Optional array of specific issues"],
  "stack": "Stack trace (development mode only)"
}
```

| Status | Error Message | Cause |
|--------|--------------|-------|
| `400` | `Account already exists with this email address` | Duplicate registration |
| `400` | `Invalid email or password` | Wrong credentials |
| `400` | `Resume file is required` | Missing PDF in upload |
| `400` | `Validation failed` | Mongoose or Zod validation error |
| `400` | `Malformed JSON in request body` | Invalid JSON syntax in body |
| `401` | `Token not provided` | Missing or expired access token cookie |
| `401` | `Session expired. Please login again.` | Token version mismatch (logged out from all devices) |
| `401` | `Invalid or expired refresh token` | Refresh token missing/expired/revoked |
| `401` | `Login required` | Feature requires authentication |
| `401` | `Invalid token` / `Token has expired` | JWT verification failed |
| `403` | `Invalid CSRF token` | Missing or mismatched `x-csrf-token` header |
| `404` | `Route not found: GET /api/xyz` | Unknown API endpoint |
| `409` | `Duplicate value for 'email'` | MongoDB duplicate key error |
| `413` | `File too large. Maximum size is 3 MB.` | Multer file size limit exceeded |
| `429` | `{feature} limit reached...` | Daily usage limit exceeded |
| `500` | `Internal server error` | Unexpected server error |

---

## 🔗 Frontend Integration Guide

### Setup Axios (Recommended)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true, // IMPORTANT: sends cookies with every request
});

// Fetch CSRF token on app startup
async function initCsrf() {
  const { data } = await api.get('/auth/csrf-token');
  api.defaults.headers.common['x-csrf-token'] = data.csrfToken;
}

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      await api.post('/auth/refresh');
      return api(error.config); // retry original request
    }
    return Promise.reject(error);
  }
);
```

### Key Reminders

- ✅ Always call `GET /api/auth/csrf-token` at app startup
- ✅ Use `withCredentials: true` / `credentials: "include"` for all requests
- ✅ Send `x-csrf-token` header on all mutating requests
- ✅ On `401`, call `/api/auth/refresh` and retry once
- ✅ Logout endpoint is `POST /api/auth/logout` (not GET)
- ✅ If frontend and backend are on different domains in production, use `COOKIE_SAME_SITE=none` and `COOKIE_SECURE=true`

---

## 🤖 AI Model Configuration

The Gemini model and API key management is centralized in:

```
src/services/ai/google.js
```

- **Model name**: Change `modelName` in this file to switch AI models across all features.
- **Key rotation**: All services use `generateWithFailover(prompt)` which automatically rotates through your configured API keys.

### How Key Failover Works

```
Request 1 → Key #1 ✅ Success
Request 2 → Key #2 ✅ Success (round-robin)
Request 3 → Key #3 ❌ Rate limited → Key #4 ✅ Fallback success
Request 4 → Key #1 ✅ (cycles back)
```

- Keys are load-balanced via **round-robin** (not just used as fallback)
- If a key fails, the **next key is tried automatically**
- Error is thrown **only if ALL keys fail**
- Console logs show which key succeeded/failed for debugging

---
## ⚠️ DNS Resolution Issue (Development Only)

If you face issues like:

* Database connection failing
* External APIs not resolving
* `ENOTFOUND` or DNS-related errors

This might be due to your local ISP DNS.

### ✅ Fix (Optional)

You can force Google DNS in development:

```js
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
```


## ⚠️ Important

* Use this **only in development**
* Do NOT enable in production (cloud providers manage DNS internally)


## 📜 License

This project is licensed under the **ISC License**.
