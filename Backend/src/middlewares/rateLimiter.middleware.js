const crypto = require("crypto")
const UsageModel = require("../models/usage.model")

const GUEST_COOKIE = "guestUsageId"
const GUEST_COOKIE_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000
const GUEST_FINGERPRINT_SECRET = process.env.GUEST_FINGERPRINT_SECRET || process.env.JWT_SECRET || "curixo-guest-fingerprint"

const isProduction = process.env.NODE_ENV === "production"
const allowedSameSite = new Set(["lax", "strict", "none"])
const configuredSameSite = String(process.env.COOKIE_SAME_SITE || "").toLowerCase()
const cookieSameSite = allowedSameSite.has(configuredSameSite)
    ? configuredSameSite
    : (isProduction ? "none" : "lax")
const cookieSecure = process.env.COOKIE_SECURE === undefined
    ? isProduction
    : String(process.env.COOKIE_SECURE).toLowerCase() === "true"

function getGuestCookieOptions() {
    // Browsers require Secure=true when SameSite=None.
    const secure = cookieSameSite === "none" ? true : cookieSecure
    return {
        httpOnly: true,
        sameSite: cookieSameSite,
        secure,
        path: "/",
        maxAge: GUEST_COOKIE_MAX_AGE_MS
    }
}

function getDateKey() {
    // Returns date in YYYY-MM-DD format for IST timezone
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

function createGuestId() {
    if (typeof crypto.randomUUID === "function") {
        return crypto.randomUUID()
    }

    return crypto.randomBytes(16).toString("hex")
}

function getGuestKey(req, res) {
    const cookieGuestId = req.cookies?.[GUEST_COOKIE]
    if (typeof cookieGuestId === "string" && cookieGuestId.trim()) {
        return cookieGuestId.trim()
    }

    const guestId = createGuestId()
    res.cookie(GUEST_COOKIE, guestId, getGuestCookieOptions())
    return guestId
}

function normalizeClientIp(ip) {
    if (typeof ip !== "string") {
        return "unknown"
    }

    // In proxy chains, keep the first client hop and normalize IPv4-mapped IPv6.
    const firstHop = ip.split(",")[0].trim()
    const normalized = firstHop.replace("::ffff:", "")
    return normalized || "unknown"
}

function getGuestFingerprint(req) {
    const ip = normalizeClientIp(req.ip || req.headers?.["x-forwarded-for"] || req.socket?.remoteAddress)
    const userAgent = String(req.get("user-agent") || "unknown")
    const rawIdentity = `${GUEST_FINGERPRINT_SECRET}|${ip}|${userAgent}`

    return crypto.createHash("sha256").update(rawIdentity).digest("hex")
}

async function bumpUsage({ feature, dateKey, userId = null, guestKey = null, anonFingerprint = null, maxLimit = 3 }) {
    const query = {
        feature,
        dateKey,
        user: userId || null,
        guestKey: guestKey || null,
        anonFingerprint: anonFingerprint || null
    }

    const existing = await UsageModel.findOne(query)
    if (!existing) {
        const newCount = 1
        await UsageModel.create({
            ...query,
            count: newCount,
            limit: maxLimit,
            usageDisplay: `${newCount}/${maxLimit}`
        })
        return newCount
    }

    existing.count += 1
    existing.limit = maxLimit
    existing.usageDisplay = `${existing.count}/${maxLimit}`
    await existing.save()
    return existing.count
}

/**
 * Rate limit middleware.
 * 
 * `userLimit` is the fallback — if the user has a custom limit
 * stored in `req.user.limits[feature]`, that value takes priority.
 */
function rateLimitPerDay({ feature, userLimit = 3, guestLimit = 0, requireLogin = true, consumeOnSuccess = false }) {
    return async function usageRateLimit(req, res, next) {
        try {
            const dateKey = getDateKey()
            const userId = req.user?.id || req.user?._id || null

            if (userId) {
                // ─── Read per-user custom limit, fall back to route-defined limit ───
                const effectiveLimit = req.user?.limits?.[feature] || userLimit

                const query = { feature, dateKey, user: userId, guestKey: null, anonFingerprint: null }
                const existing = await UsageModel.findOne(query)

                if (existing && existing.count >= effectiveLimit) {
                    return res.status(429).json({
                        message: `${feature} limit reached. You can use this feature ${effectiveLimit} times per day.`,
                        limit: effectiveLimit,
                        used: existing.count,
                        usageDisplay: `${existing.count}/${effectiveLimit}`
                    })
                }

                if (consumeOnSuccess) {
                    let hasCommittedUsage = false
                    req.commitUsage = async () => {
                        if (hasCommittedUsage) {
                            return
                        }

                        await bumpUsage({ feature, dateKey, userId, maxLimit: effectiveLimit })
                        hasCommittedUsage = true
                    }
                    return next()
                }

                await bumpUsage({ feature, dateKey, userId, maxLimit: effectiveLimit })
                return next()
            }

            if (requireLogin) {
                return res.status(401).json({ message: "Login required." })
            }

            if (guestLimit <= 0) {
                return res.status(401).json({ message: "Login required." })
            }

            const guestKey = getGuestKey(req, res)
            const anonFingerprint = getGuestFingerprint(req)
            const existingRecords = await UsageModel.find({
                feature,
                dateKey,
                user: null,
                $or: [{ guestKey }, { anonFingerprint }]
            })
            const usedCount = existingRecords.reduce((maxCount, record) => Math.max(maxCount, record.count), 0)

            if (usedCount >= guestLimit) {
                return res.status(429).json({
                    message: `Free ${feature} usage exhausted for today. Please login to continue (up to ${userLimit}/day).`,
                    usageDisplay: `${usedCount}/${guestLimit}`
                })
            }

            if (consumeOnSuccess) {
                let hasCommittedUsage = false
                req.commitUsage = async () => {
                    if (hasCommittedUsage) {
                        return
                    }

                    const latestRecords = await UsageModel.find({
                        feature,
                        dateKey,
                        user: null,
                        $or: [{ guestKey }, { anonFingerprint }]
                    })

                    if (latestRecords.length) {
                        await Promise.all(latestRecords.map((record) => {
                            record.count += 1
                            record.limit = guestLimit
                            record.usageDisplay = `${record.count}/${guestLimit}`
                            return record.save()
                        }))
                    } else {
                        await bumpUsage({ feature, dateKey, guestKey, anonFingerprint, maxLimit: guestLimit })
                    }

                    hasCommittedUsage = true
                }

                return next()
            }

            if (existingRecords.length) {
                await Promise.all(existingRecords.map((record) => {
                    record.count += 1
                    record.limit = guestLimit
                    record.usageDisplay = `${record.count}/${guestLimit}`
                    return record.save()
                }))
            } else {
                await bumpUsage({ feature, dateKey, guestKey, anonFingerprint, maxLimit: guestLimit })
            }

            return next()
        } catch (error) {
            console.error("Usage limiter error:", error)
            return res.status(500).json({ message: "Unable to validate daily usage limit." })
        }
    }
}

module.exports = { rateLimitPerDay }
