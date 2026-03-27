const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");
const { authUser } = require("../middlewares/auth.middleware");

router.get("/data", authUser, dashboardController.getDashboardData);

module.exports = router;
