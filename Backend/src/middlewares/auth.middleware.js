const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")
const userModel = require("../models/user.model")

async function authUser(req, res, next) {

    const token = req.cookies.accessToken || req.cookies.token

    if (!token) {
        return res.status(401).json({
            message: "Token not provided."
        })
    }

    const isTokenBlacklisted = await tokenBlacklistModel.findOne({
        token
    })

    if (isTokenBlacklisted) {
        return res.status(401).json({
            message: "token is invalid"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET)

        const user = await userModel.findById(decoded.id).select("tokenVersion limits role")
        if (!user) {
            return res.status(401).json({ message: "User not found." })
        }

        const tokenVersion = typeof decoded.tv === "number" ? decoded.tv : 0
        if (tokenVersion !== user.tokenVersion) {
            return res.status(401).json({ message: "Session expired. Please login again." })
        }

        req.user = { 
            ...decoded, 
            limits: user.limits, 
            role: user.role 
        }

        next()

    } catch (err) {

        return res.status(401).json({
            message: "Invalid token."
        })
    }

}

module.exports = { authUser }