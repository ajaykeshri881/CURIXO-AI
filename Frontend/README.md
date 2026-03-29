# 🚀 Curixo Frontend

Welcome to the frontend of Curixo, an AI-powered career platform designed to empower job seekers. This application provides a modern, responsive, and intuitive user interface for building resumes, analyzing them against Applicant Tracking Systems (ATS), and preparing for interviews.

---

## ✨ Core Features

- **AI-Enhanced Resume Builder**: Craft a professional resume from scratch with contextual suggestions from our AI.
- **In-Depth ATS Analysis**: Upload an existing resume to receive a detailed ATS score and AI-driven recommendations for improvement.
- **Interactive Interview Prep**: Simulate interview scenarios and get instant feedback on your responses.
- **Personalized User Dashboard**: A central hub to manage your profile, track your application history, and view all your generated reports.
- **Secure & Seamless Authentication**: Robust, cookie-based authentication flow with automatic token refresh and CSRF protection.

## 🛠️ Technology Stack

This project is built with a cutting-edge technology stack to ensure a high-performance, scalable, and maintainable application.

| Category          | Technology                                                                                             | Description                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| **Core Framework**| [React 19](https://react.dev/) & [Vite](https://vitejs.dev/)                                             | For a fast, modern, and efficient development experience.   |
| **Styling**       | [Tailwind CSS](https://tailwindcss.com/)                                                               | A utility-first CSS framework for rapid UI development.     |
| **Routing**       | [React Router DOM](https://reactrouter.com/)                                                           | For declarative, client-side routing.                       |
| **State Management**| React Context API                                                                                      | For managing global state like authentication status.       |
| **Animations**    | [Framer Motion](https://www.framer.com/motion/)                                                        | To create fluid and beautiful user interface animations.    |
| **API Client**    | [Axios](https://axios-http.com/)                                                                       | For making promise-based HTTP requests to the backend API.  |
| **UI & Icons**    | [Lucide React](https://lucide.dev/), [React Hot Toast](https://react-hot-toast.com/)                     | For crisp icons and non-intrusive notifications.            |
| **Linting**       | [ESLint](https://eslint.org/)                                                                          | To maintain high code quality and consistency.              |
| **Offline Support**| [Vite PWA](https://vite-pwa-org.netlify.app/)                                                          | For enabling Progressive Web App features like offline access. |

## 📂 Project Architecture

The `src` directory is structured to promote scalability and separation of concerns.

```
src/
├── assets/         # Static files like images and fonts
├── components/     # Reusable React components
│   ├── layout/     # Major layout components (Navbar, Footer, ProtectedRoute)
│   └── ui/         # Generic UI elements (Button, Card, Input)
├── context/        # Global state management via React Context (e.g., AuthContext)
├── pages/          # Top-level components, each corresponding to a specific route
├── services/       # Modules for interacting with the backend API
│   ├── api.js      # Central Axios instance with interceptors for auth and error handling
│   └── *.service.js # Specific services for each API resource (auth, resume, etc.)
├── App.jsx         # Root component containing the main application router
└── main.jsx        # The application's entry point where React is mounted to the DOM
```

## 🏁 Getting Started

Follow these steps to get the frontend development environment up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18.x or higher recommended)
- [npm](https://www.npmjs.com/) (version 9.x or higher)
- A running instance of the [Curixo Backend API](https://github.com/ajaykeshri881/CURIXO-AI).

### Installation & Local Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ajaykeshri881/CURIXO-AI.git
    ```

2.  **Navigate to the frontend directory:**
    ```bash
    cd CURIXO-AI/Frontend
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Configure environment variables:**
    Create a `.env` file in the `Frontend` directory by copying the example file.
    ```bash
    cp .env.example .env
    ```
    If you're on Windows or `cp` is not available, you can create the `.env` file manually.

5.  **Set the API URL:**
    Open the newly created `.env` file and ensure `VITE_API_URL` points to your running backend instance.
    ```env
    # .env
    VITE_API_URL=http://localhost:3000/api
    ```

6.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The application will now be running and accessible at `http://localhost:5173`.

## 📜 Available NPM Scripts

-   `npm run dev`: Starts the Vite development server with Hot Module Replacement for a live-reloading experience.
-   `npm run build`: Compiles and bundles the application into the `dist/` directory for production.
-   `npm run preview`: Serves the production build locally to test before deployment.
-   `npm run lint`: Runs ESLint to analyze the code for potential errors and style issues.

## 🔐 API Client & Authentication Flow

The application's communication with the backend is handled by a sophisticated Axios instance located at `src/services/api.js`.

-   **Cookie-Based Authentication**: The client is configured with `withCredentials: true` to automatically send `httpOnly` cookies (containing JWT access and refresh tokens) with every API request.
-   **CSRF Protection**: A request interceptor automatically fetches a CSRF token from a client-readable cookie and attaches it as an `x-csrf-token` header to all state-changing requests, mitigating cross-site request forgery attacks.
-   **Automatic Token Refresh**: A response interceptor intelligently handles `401 Unauthorized` errors. When an access token expires, it seamlessly uses the refresh token to acquire a new one and then automatically retries the original failed request. This entire process is transparent to the user, providing an uninterrupted session.

## 🔍 Troubleshooting

-   **CORS Errors**: If you encounter Cross-Origin Resource Sharing (CORS) errors, verify that your backend API is configured to accept requests from the frontend's origin (`http://localhost:5173`).
-   **401/403 Authentication Errors**: Ensure your backend server is running and that the `VITE_API_URL` in your `.env` file is correct and accessible.
-   **Failed API Requests**: Open your browser's developer tools and check the Network tab and Console for detailed error messages. This can help diagnose issues with API endpoints or request payloads.
