const { Router } = require('express')
const authController = require("../controllers/auth.controller")
const authMiddleware = require("../middlewares/auth.middleware")
const { validateBody } = require("../middlewares/validate.middleware")
const { registerSchema, loginSchema } = require("../validators/auth.validator")

const authRouter = Router()

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
authRouter.post("/register", validateBody(registerSchema), authController.registerUserController)


/**
 * @route POST /api/auth/login
 * @description login user with email and password
 * @access Public
 */
authRouter.post("/login", validateBody(loginSchema), authController.loginUserController)

/**
 * @route POST /api/auth/refresh
 * @description issue new access token via refresh token
 * @access Public
 */
authRouter.post("/refresh", authController.refreshTokenController)

/**
 * @route GET /api/auth/csrf-token
 * @description get csrf token for subsequent mutating requests
 * @access Public
 */
authRouter.get("/csrf-token", authController.getCsrfTokenController)


/**
 * @route POST /api/auth/logout
 * @description clear token from user cookie and add the token in blacklist
 * @access public
 */
authRouter.post("/logout", authController.logoutUserController)

/**
 * @route POST /api/auth/logout-all
 * @description logout user from all devices/sessions
 * @access private
 */
authRouter.post("/logout-all", authMiddleware.authUser, authController.logoutAllDevicesController)


/**
 * @route GET /api/auth/get-me
 * @description get the current logged in user details
 * @access private
 */
authRouter.get("/get-me", authMiddleware.authUser, authController.getMeController)


module.exports = authRouter