const express = require('express');
const router = express.Router();
const atsController = require('../controllers/ats.controller');
const upload = require('../middlewares/file.middleware');
const { authUser } = require('../middlewares/auth.middleware');
const optionalAuth = require('../middlewares/optionalAuth.middleware');
const { rateLimitPerDay } = require('../middlewares/rateLimiter.middleware');

router.post(
	'/check',
	optionalAuth,
	rateLimitPerDay({ feature: 'ats_check', userLimit: 3, guestLimit: 1, requireLogin: false, consumeOnSuccess: true }),
	upload.single('resume'),
	atsController.checkAts
);

router.post(
	'/improve',
	authUser,
	rateLimitPerDay({ feature: 'resume_build', userLimit: 3, guestLimit: 0, requireLogin: true }),
	atsController.improveResume
);

router.get(
	'/report/:id',
	authUser,
	atsController.getAtsReportById
);

module.exports = router;
