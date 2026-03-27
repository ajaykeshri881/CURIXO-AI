const UsageModel = require("../models/usage.model")

function getDateKey() {
    // Returns date in YYYY-MM-DD format for IST timezone
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

function getGuestKey(req) {
    const ip = req.ip || req.headers["x-forwarded-for"] || "unknown-ip"
    return String(ip).split(",")[0].trim()
}

async function bumpUsage({ feature, dateKey, userId = null, guestKey = null, maxLimit = 3 }) {
    const query = {
        feature,
        dateKey,
        user: userId || null,
        guestKey: guestKey || null
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
function rateLimitPerDay({ feature, userLimit = 3, guestLimit = 0, requireLogin = true }) {
    return async function usageRateLimit(req, res, next) {
        try {
            const dateKey = getDateKey()
            const userId = req.user?.id || req.user?._id || null

            if (userId) {
                // ─── Read per-user custom limit, fall back to route-defined limit ───
                const effectiveLimit = req.user?.limits?.[feature] || userLimit

                const query = { feature, dateKey, user: userId, guestKey: null }
                const existing = await UsageModel.findOne(query)

                if (existing && existing.count >= effectiveLimit) {
                    return res.status(429).json({
                        message: `${feature} limit reached. You can use this feature ${effectiveLimit} times per day.`,
                        limit: effectiveLimit,
                        used: existing.count,
                        usageDisplay: `${existing.count}/${effectiveLimit}`
                    })
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

            const guestKey = getGuestKey(req)
            const query = { feature, dateKey, user: null, guestKey }
            const existing = await UsageModel.findOne(query)

            if (existing && existing.count >= guestLimit) {
                return res.status(429).json({
                    message: `Free ${feature} usage exhausted for today. Please login to continue (up to ${userLimit}/day).`,
                    usageDisplay: `${existing.count}/${guestLimit}`
                })
            }

            await bumpUsage({ feature, dateKey, guestKey, maxLimit: guestLimit })
            return next()
        } catch (error) {
            console.error("Usage limiter error:", error)
            return res.status(500).json({ message: "Unable to validate daily usage limit." })
        }
    }
}

module.exports = { rateLimitPerDay }
