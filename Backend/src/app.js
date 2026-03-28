const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const helmet = require("helmet")
const xssSanitizer = require("./middlewares/xss.middleware")
const { issueCsrfToken, verifyCsrf } = require("./middlewares/csrf.middleware")

const app = express()

app.use(express.json({ limit: "3mb" }))
app.use(express.urlencoded({ extended: true, limit: "3mb" }))
app.use(cookieParser())
app.use(helmet())
app.use(xssSanitizer)
app.use(cors({
    origin: process.env.CORS_ORIGIN?.includes(',') ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) : (process.env.CORS_ORIGIN || 'http://localhost:5173'),
    credentials: true
}))
app.use(issueCsrfToken)
app.use(verifyCsrf({ ignorePaths: ["/api/auth/register", "/api/auth/login", "/api/auth/refresh", "/api/auth/logout"] }))

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")
const atsRouter = require("./routes/ats.routes")
const resumeRouter = require("./routes/resume.routes")
const dashboardRouter = require("./routes/dashboard.routes")


/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)
app.use("/api/ats", atsRouter)
app.use("/api/resume", resumeRouter)
app.use("/api/dashboard", dashboardRouter)

/* 404 catch-all for unknown routes */
app.use((req, res) => {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` })
})

/* Global error handler — must be AFTER all routes */
const globalErrorHandler = require("./middlewares/error.middleware")
app.use(globalErrorHandler)


module.exports = app