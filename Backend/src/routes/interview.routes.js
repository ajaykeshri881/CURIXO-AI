const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const interviewController = require("../controllers/interview.controller")
const upload = require("../middlewares/file.middleware")
const { rateLimitPerDay } = require("../middlewares/rateLimiter.middleware")

const interviewRouter = express.Router()



/**
 * @route POST /api/interview/
 * @description generate new interview report on the basis of user self description,resume pdf and job description.
 * @access private
 */
interviewRouter.post(
	"/",
	authMiddleware.authUser,
	rateLimitPerDay({ feature: "interview_report", userLimit: 3, guestLimit: 0, requireLogin: true }),
	upload.single("resume"),
	interviewController.generateInterViewReportController
)

/**
 * @route GET /api/interview/report/:interviewId
 * @description get interview report by interviewId.
 * @access private
 */
interviewRouter.get("/report/:interviewId", authMiddleware.authUser, interviewController.getInterviewReportByIdController)


/**
 * @route GET /api/interview/
 * @description get all interview reports of logged in user.
 * @access private
 */
interviewRouter.get("/", authMiddleware.authUser, interviewController.getAllInterviewReportsController)


/**
 * @route GET /api/interview/resume/pdf
 * @description generate resume pdf on the basis of user self description, resume content and job description.
 * @access private
 */
interviewRouter.post(
	"/resume/pdf/:interviewReportId",
	authMiddleware.authUser,
	rateLimitPerDay({ feature: "interview_resume_pdf", userLimit: 3, guestLimit: 0, requireLogin: true }),
	interviewController.generateResumePdfController
)



module.exports = interviewRouter