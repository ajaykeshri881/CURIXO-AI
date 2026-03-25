const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")
const userModel = require("../models/user.model")

async function optionalAuth(req, _res, next) {
    try {
        const token = req.cookies?.accessToken || req.cookies?.token

        if (!token) {
            return next()
        }

        const isTokenBlacklisted = await tokenBlacklistModel.findOne({ token })
        if (isTokenBlacklisted) {
            return next()
        }

        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET)

        const user = await userModel.findById(decoded.id).select("tokenVersion")
        if (!user) {
            return next()
        }

        const tokenVersion = typeof decoded.tv === "number" ? decoded.tv : 0
        if (tokenVersion !== user.tokenVersion) {
            return next()
        }

        req.user = decoded
        return next()
    } catch (_error) {
        return next()
    }
}

module.exports = optionalAuth
