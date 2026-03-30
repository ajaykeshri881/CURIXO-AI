const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")
const refreshTokenModel = require("../models/refreshToken.model")

const isProduction = process.env.NODE_ENV === "production"
const allowedSameSite = new Set(["lax", "strict", "none"])
const configuredSameSite = String(process.env.COOKIE_SAME_SITE || "").toLowerCase()
const cookieSameSite = allowedSameSite.has(configuredSameSite)
    ? configuredSameSite
    : (isProduction ? "none" : "lax")
const cookieSecure = process.env.COOKIE_SECURE === undefined
    ? isProduction
    : String(process.env.COOKIE_SECURE).toLowerCase() === "true"

function getCookieBaseOptions() {
    // Browsers require Secure=true when SameSite=None.
    const secure = cookieSameSite === "none" ? true : cookieSecure
    return {
        secure,
        sameSite: cookieSameSite,
        path: "/"
    }
}

function getCookieOptions(maxAge) {
    return {
        httpOnly: true,
        ...getCookieBaseOptions(),
        ...(typeof maxAge === "number" ? { maxAge } : {})
    }
}

function getClearCookieOptions() {
    return {
        httpOnly: true,
        ...getCookieBaseOptions()
    }
}

function signAccessToken(user) {
    return jwt.sign(
        { id: user._id, name: user.name, tv: user.tokenVersion || 0 },
        process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_TTL || "15m" }
    )
}

function signRefreshToken(user) {
    return jwt.sign(
        { id: user._id, tv: user.tokenVersion || 0 },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_TTL || "7d" }
    )
}

async function issueAuthCookies(res, user) {
    const accessToken = signAccessToken(user)
    const refreshToken = signRefreshToken(user)

    const decodedRefresh = jwt.decode(refreshToken)
    const expiresAt = decodedRefresh?.exp
        ? new Date(decodedRefresh.exp * 1000)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await refreshTokenModel.create({
        user: user._id,
        token: refreshToken,
        expiresAt
    })

    // keep legacy token cookie for backward compatibility
    res.cookie("token", accessToken, getCookieOptions(15 * 60 * 1000))
    res.cookie("accessToken", accessToken, getCookieOptions(15 * 60 * 1000))
    res.cookie("refreshToken", refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000))
}

/**
 * @name registerUserController
 * @description register a new user, expects name, email and password in the request body
 * @access Public
 */
async function registerUserController(req, res) {
    try {
        const { name, email, password } = req.body

        const isUserAlreadyExists = await userModel.findOne({ email })

        if (isUserAlreadyExists) {
            return res.status(400).json({
                message: "Account already exists with this email address"
            })
        }

        const hash = await bcrypt.hash(password, 10)

        const user = await userModel.create({
            name,
            email,
            password: hash
        })

        await issueAuthCookies(res, user)

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        })
    } catch (error) {
        console.error("Register error:", error)
        return res.status(500).json({ message: "Internal server error." })
    }
}

/**
 * @name loginUserController
 * @description login a user, expects email and password in the request body
 * @access Public
 */
async function loginUserController(req, res) {
    try {
        const { email, password } = req.body

        const user = await userModel.findOne({ email })

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }

        await issueAuthCookies(res, user)

        return res.status(200).json({
            message: "User loggedIn successfully.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        })
    } catch (error) {
        console.error("Login error:", error)
        return res.status(500).json({ message: "Internal server error." })
    }
}

/**
 * @name refreshTokenController
 * @description issue new access token using valid refresh token
 * @access Public (cookie based)
 */
async function refreshTokenController(req, res) {
    try {
        const refreshToken = req.cookies.refreshToken

        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token not provided." })
        }

        const savedToken = await refreshTokenModel.findOne({ token: refreshToken })
        if (!savedToken || savedToken.expiresAt < new Date()) {
            return res.status(401).json({ message: "Invalid or expired refresh token." })
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET)
        const user = await userModel.findById(decoded.id)

        if (!user) {
            return res.status(401).json({ message: "User not found." })
        }

        const tokenVersion = typeof decoded.tv === "number" ? decoded.tv : 0
        if (tokenVersion !== user.tokenVersion) {
            return res.status(401).json({ message: "Refresh token revoked. Please login again." })
        }

        const newAccessToken = signAccessToken(user)

        res.cookie("token", newAccessToken, getCookieOptions(15 * 60 * 1000))
        res.cookie("accessToken", newAccessToken, getCookieOptions(15 * 60 * 1000))

        return res.status(200).json({ message: "Access token refreshed." })
    } catch (_error) {
        return res.status(401).json({ message: "Invalid refresh token." })
    }
}

/**
 * @name logoutAllDevicesController
 * @description invalidate all active sessions on all devices
 * @access private
 */
async function logoutAllDevicesController(req, res) {
    try {
        const userId = req.user.id
        const currentAccessToken = req.cookies.accessToken || req.cookies.token

        const user = await userModel.findById(userId)
        if (!user) {
            return res.status(404).json({ message: "User not found." })
        }

        user.tokenVersion += 1
        await user.save()

        await refreshTokenModel.deleteMany({ user: userId })

        if (currentAccessToken) {
            await tokenBlacklistModel.create({ token: currentAccessToken })
        }

        res.clearCookie("token", getClearCookieOptions())
        res.clearCookie("accessToken", getClearCookieOptions())
        res.clearCookie("refreshToken", getClearCookieOptions())

        return res.status(200).json({ message: "Logged out from all devices successfully." })
    } catch (error) {
        console.error("Logout-all error:", error)
        return res.status(500).json({ message: "Internal server error." })
    }
}

/**
 * @name logoutUserController
 * @description clear auth cookies, blacklist access token and revoke refresh token
 * @access public
 */
async function logoutUserController(req, res) {
    try {
        const accessToken = req.cookies.accessToken || req.cookies.token
        const refreshToken = req.cookies.refreshToken

        if (accessToken) {
            await tokenBlacklistModel.create({ token: accessToken })
        }

        if (refreshToken) {
            await refreshTokenModel.deleteOne({ token: refreshToken })
        }

        res.clearCookie("token", getClearCookieOptions())
        res.clearCookie("accessToken", getClearCookieOptions())
        res.clearCookie("refreshToken", getClearCookieOptions())

        return res.status(200).json({
            message: "User logged out successfully"
        })
    } catch (error) {
        console.error("Logout error:", error)
        return res.status(500).json({ message: "Internal server error." })
    }
}

/**
 * @name getMeController
 * @description get the current logged in user details.
 * @access private
 */
async function getMeController(req, res) {
    try {
        const user = await userModel.findById(req.user.id)

        if (!user) {
            return res.status(404).json({ message: "User not found." })
        }

        return res.status(200).json({
            message: "User details fetched successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        })
    } catch (error) {
        console.error("GetMe error:", error)
        return res.status(500).json({ message: "Internal server error." })
    }
}

/**
 * @name getCsrfTokenController
 * @description expose csrf token for frontend header usage
 * @access Public
 */
function getCsrfTokenController(req, res) {
    return res.status(200).json({ csrfToken: req.csrfToken })
}

module.exports = {
    registerUserController,
    loginUserController,
    refreshTokenController,
    logoutUserController,
    logoutAllDevicesController,
    getMeController,
    getCsrfTokenController
}
