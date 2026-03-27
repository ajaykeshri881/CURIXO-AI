const AtsReport = require("../models/atsReport.model");
const InterviewReport = require("../models/interviewReport.model");
const Usage = require("../models/usage.model");

exports.getDashboardData = async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 3;

        // Fetch Interview Reports
        const interviews = await InterviewReport.find({ user: userId })
            .sort({ createdAt: -1 })
            .lean();

        // Fetch ATS Reports
        const atsScans = await AtsReport.find({ user: userId })
            .sort({ createdAt: -1 })
            .lean();
            
        // Map to a unified activity model format
        const formatActivity = (item, type) => ({
            _id: item._id,
            type, // "interview" | "ats"
            title: item.jobTitle || item.userJobTitle || "Untitled Scan",
            createdAt: item.createdAt,
            data: item
        });

        const allActivities = [
            ...interviews.map(i => formatActivity(i, "interview")),
            ...atsScans.map(s => formatActivity(s, "ats"))
        ];

        // Sort descending
        allActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Limit results
        const recentActivities = allActivities.slice(0, limit);

        // Fetch limits tracking (today)
        // dateKey uses IST timezone to match the rate limiter middleware
        const todayDateKey = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

        const usages = await Usage.find({
            user: userId,
            dateKey: todayDateKey
        });

        const usageMap = {
            ats_check: 0,
            interview_prep: 0,
            resume_build: 0
        };

        const usageDisplayMap = {
            ats_check: "0/3",
            interview_prep: "0/3",
            resume_build: "0/3"
        };

        usages.forEach(u => {
            usageMap[u.feature] = u.count;
            usageDisplayMap[u.feature] = u.usageDisplay || `${u.count}/${u.limit || 3}`;
        });

        // Current platform limits per feature (read from user DB record or default to 3)
        const limitsMap = {
            ats_check: req.user.limits?.ats_check ?? 3,
            interview_prep: req.user.limits?.interview_prep ?? 3,
            resume_build: req.user.limits?.resume_build ?? 3
        };

        res.status(200).json({
            activities: recentActivities,
            totalActivities: allActivities.length,
            usages: usageMap,
            usageDisplay: usageDisplayMap,
            limits: limitsMap
        });
    } catch (error) {
        console.error("Dashboard DB error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};
