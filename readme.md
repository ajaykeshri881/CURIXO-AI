# 🚀 CURIXO - AI-Powered Career Platform

Welcome to the CURIXO monorepo. This project is an AI-powered career platform designed to help users build job-winning resumes, analyze them against Applicant Tracking Systems (ATS), and prepare for interviews.

The repository is structured into two main parts: a **Backend** API and a **Frontend** client application.

---

## ✨ Key Features

-   **🤖 AI-Powered Resume Builder**: Create a professional, tailored resume from scratch with AI assistance.
-   **📊 ATS Resume Analysis**: Upload your resume to get an instant ATS score and AI-driven feedback for improvement.
-   **🎙️ AI Interview Preparation**: Practice for interviews with AI-generated questions and receive detailed performance reports.
-   **📄 PDF Generation**: Download your generated or improved resumes as pixel-perfect PDFs directly from the server.
-   **🔐 Secure Authentication**: Robust user authentication using JWT with a secure, cookie-based refresh token strategy and CSRF protection.

---

## 📂 Project Structure

```
.
├── Backend/      # Node.js, Express, MongoDB REST API
└── Frontend/     # React, Vite, Tailwind CSS Client
```

---

## Backend

The `Backend` is a robust RESTful API built with Node.js, Express, and MongoDB. It handles all business logic, including user authentication, AI integrations with Google Gemini, database management, and PDF generation.

-   **Tech Stack**: Node.js, Express, Mongoose, JWT, Zod, Puppeteer, Gemini AI.
-   **For detailed setup and API documentation, see the [Backend README](./Backend/README.md).**

### Quick Start (Backend)

```bash
# Navigate to the backend directory
cd Backend

# Install dependencies
npm install

# Set up environment variables (copy .env.example to .env)
cp .env.example .env

# Start the server
npm start
```

---

## Frontend

The `Frontend` is a modern, responsive single-page application (SPA) built with React and Vite. It provides a rich user interface for all of the platform's features, including the resume builder, ATS checker, and interview prep tools.

-   **Tech Stack**: React, Vite, Tailwind CSS, React Router, Axios, Framer Motion.
-   **For detailed setup and component information, see the [Frontend README](./Frontend/README.md).**

### Quick Start (Frontend)

```bash
# Navigate to the frontend directory
cd Frontend

# Install dependencies
npm install

# Set up environment variables (copy .env.example to .env)
cp .env.example .env

# Start the development server
npm run dev
```

---

## 🏁 Full Stack Quick Start

To run the entire application locally:

1.  **Start the Backend**: Follow the backend quick start steps in one terminal. The API will be running on `http://localhost:3000` by default.
2.  **Start the Frontend**: Follow the frontend quick start steps in a second terminal. The client will be available at `http://localhost:5173`.
3.  **Open the App**: Open your browser and navigate to `http://localhost:5173`.
