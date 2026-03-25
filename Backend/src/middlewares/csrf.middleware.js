const crypto = require("crypto")

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"])
const CSRF_COOKIE = "csrfToken"
const CSRF_HEADER = "x-csrf-token"

function issueCsrfToken(req, res, next) {
    if (!req.cookies?.[CSRF_COOKIE]) {
        const token = crypto.randomBytes(24).toString("hex")
        res.cookie(CSRF_COOKIE, token, {
            httpOnly: false,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
        })
        req.csrfToken = token
    } else {
        req.csrfToken = req.cookies[CSRF_COOKIE]
    }

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

        if (!cookieToken || !headerToken || cookieToken !== headerToken) {
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
