const xss = require("xss")

function sanitize(value) {
    if (typeof value === "string") {
        return xss(value)
    }

    if (Array.isArray(value)) {
        return value.map(sanitize)
    }

    if (value && typeof value === "object") {
        const next = {}
        Object.keys(value).forEach((key) => {
            // Bypass sanitization for specific fields that strictly require raw HTML (like PDF generation payloads)
            if (key === 'resumeHtml') {
                next[key] = value[key];
            } else {
                next[key] = sanitize(value[key]);
            }
        })
        return next
    }

    return value
}

function xssSanitizer(req, _res, next) {
    if (req.body) req.body = sanitize(req.body)
    if (req.query) req.query = sanitize(req.query)
    if (req.params) req.params = sanitize(req.params)
    next()
}

module.exports = xssSanitizer
