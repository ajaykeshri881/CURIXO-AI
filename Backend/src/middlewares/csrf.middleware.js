const crypto = require("crypto")

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"])
const CSRF_COOKIE = "csrfToken"
const CSRF_HEADER = "x-csrf-token"

const isProduction = process.env.NODE_ENV === "production"
const allowedSameSite = new Set(["lax", "strict", "none"])
const configuredSameSite = String(process.env.COOKIE_SAME_SITE || "").toLowerCase()
const cookieSameSite = allowedSameSite.has(configuredSameSite)
    ? configuredSameSite
    : (isProduction ? "none" : "lax")
const cookieSecure = process.env.COOKIE_SECURE === undefined
    ? isProduction
    : String(process.env.COOKIE_SECURE).toLowerCase() === "true"

function getCsrfCookieOptions() {
    // Browsers require Secure=true when SameSite=None.
    const secure = cookieSameSite === "none" ? true : cookieSecure
    return {
        httpOnly: false,
        sameSite: cookieSameSite,
        secure,
        path: "/"
    }
}

function issueCsrfToken(req, res, next) {
    const cookieToken = req.cookies?.[CSRF_COOKIE]
    const headerToken = req.get(CSRF_HEADER)

    // For cross-site setups where the browser may not persist third-party cookies,
    // keep the CSRF token stable by reusing the client-sent header token.
    const token = cookieToken || headerToken || crypto.randomBytes(24).toString("hex")

    if (!cookieToken) {
        res.cookie(CSRF_COOKIE, token, getCsrfCookieOptions())
    }

    req.csrfToken = token

    next()
}

function verifyCsrf({ ignorePaths = [] } = {}) {
    return function csrfVerifier(req, res, next) {
        if (SAFE_METHODS.has(req.method)) {
            return next()
        }

        const pathname = req.originalUrl.split("?")[0]
        if (ignorePaths.includes(pathname)) {
            return next()
        }

        const cookieToken = req.cookies?.[CSRF_COOKIE]
        const headerToken = req.get(CSRF_HEADER)
        const effectiveToken = cookieToken || req.csrfToken

        if (!effectiveToken || !headerToken || effectiveToken !== headerToken) {
            return res.status(403).json({ message: "Invalid CSRF token." })
        }

        return next()
    }
}

module.exports = {
    issueCsrfToken,
    verifyCsrf,
    CSRF_COOKIE,
    CSRF_HEADER
}
