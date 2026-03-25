const UsageModel = require("../models/usage.model")

function getDateKey() {
    // Returns date in YYYY-MM-DD format for IST timezone
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

function getGuestKey(req) {
    const ip = req.ip || req.headers["x-forwarded-for"] || "unknown-ip"
    return String(ip).split(",")[0].trim()
}

async function bumpUsage({ feature, dateKey, userId = null, guestKey = null }) {
    const query = {
        feature,
        dateKey,
        user: userId || null,
        guestKey: guestKey || null
    }

    const existing = await UsageModel.findOne(query)
    if (!existing) {
        await UsageModel.create({ ...query, count: 1 })
        return 1
    }

    existing.count += 1
    await existing.save()
    return existing.count
}

function rateLimitPerDay({ feature, userLimit = 3, guestLimit = 0, requireLogin = true }) {
    return async function usageRateLimit(req, res, next) {
        try {
            const dateKey = getDateKey()
            const userId = req.user?.id || req.user?._id || null

            if (userId) {
                const query = { feature, dateKey, user: userId, guestKey: null }
                const existing = await UsageModel.findOne(query)

                if (existing && existing.count >= userLimit) {
                    return res.status(429).json({
                        message: `${feature} limit reached. You can use this feature ${userLimit} times per day.`
                    })
                }

                await bumpUsage({ feature, dateKey, userId })
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
                    message: `Free ${feature} usage exhausted for today. Please login to continue (up to ${userLimit}/day).`
                })
            }

            await bumpUsage({ feature, dateKey, guestKey })
            return next()
        } catch (error) {
            console.error("Usage limiter error:", error)
            return res.status(500).json({ message: "Unable to validate daily usage limit." })
        }
    }
}

module.exports = { rateLimitPerDay }
