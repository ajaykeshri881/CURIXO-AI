/**
 * Global Error Handler Middleware
 * Must be registered AFTER all routes in app.js
 * Express identifies this as an error handler by the 4-parameter signature.
 */

function globalErrorHandler(err, req, res, _next) {
    // Log the full error in development
    console.error("💥 Unhandled Error:", err)

    // Default values
    let statusCode = err.statusCode || err.status || 500
    let message = "Internal server error."
    let details = undefined

    // ── Mongoose Validation Error ──
    if (err.name === "ValidationError" && err.errors) {
        statusCode = 400
        message = "Validation failed."
        details = Object.values(err.errors).map(e => e.message)
    }

    // ── Mongoose Cast Error (bad ObjectId etc.) ──
    else if (err.name === "CastError") {
        statusCode = 400
        message = `Invalid value for ${err.path}: ${err.value}`
    }

    // ── Mongoose Duplicate Key ──
    else if (err.code === 11000) {
        statusCode = 409
        const field = Object.keys(err.keyValue || {})[0] || "field"
        message = `Duplicate value for '${field}'. This ${field} already exists.`
    }

    // ── JWT Errors ──
    else if (err.name === "JsonWebTokenError") {
        statusCode = 401
        message = "Invalid token."
    }
    else if (err.name === "TokenExpiredError") {
        statusCode = 401
        message = "Token has expired."
    }

    // ── Multer File Errors ──
    else if (err.code === "LIMIT_FILE_SIZE") {
        statusCode = 413
        message = "File too large. Maximum size is 3 MB."
    }
    else if (err.code === "LIMIT_UNEXPECTED_FILE") {
        statusCode = 400
        message = "Unexpected file field."
    }

    // ── Zod Validation Error ──
    else if (err.name === "ZodError") {
        statusCode = 400
        message = "Validation failed."
        details = err.issues?.map(i => `${i.path.join(".")}: ${i.message}`)
    }

    // ── Syntax Error (malformed JSON body) ──
    else if (err.type === "entity.parse.failed") {
        statusCode = 400
        message = "Malformed JSON in request body."
    }

    // ── Custom errors with a message ──
    else if (err.message && statusCode !== 500) {
        message = err.message
    }

    // Build response
    const response = { message }

    if (details) {
        response.details = details
    }

    // In development, attach stack trace
    if (process.env.NODE_ENV !== "production") {
        response.stack = err.stack
    }

    return res.status(statusCode).json(response)
}

module.exports = globalErrorHandler
