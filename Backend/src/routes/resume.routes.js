const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resume.controller');
const { authUser } = require('../middlewares/auth.middleware');
const { rateLimitPerDay } = require('../middlewares/rateLimiter.middleware');

router.post(
	'/create-from-scratch',
	authUser,
	rateLimitPerDay({ feature: 'resume_build', userLimit: 3, guestLimit: 0, requireLogin: true }),
	resumeController.createFromScratch
);

router.post(
	'/create-from-scratch/pdf',
	authUser,
	rateLimitPerDay({ feature: 'resume_build', userLimit: 30, guestLimit: 0, requireLogin: true }),
	resumeController.downloadPdfFromScratch
);

module.exports = router;
