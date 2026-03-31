const { extractTextFromPdf } = require('../utils/pdfExtract');
const AtsReport = require('../models/atsReport.model');
const { analyzeResumeWithATS, improveResumeWithAI } = require('../services/ai/resume.service');

const GUEST_REPORT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

exports.checkAts = async (req, res) => {
    try {
        const { jobTitle, jobDescription } = req.body;
        const resumeFile = req.file;

        if (!resumeFile) {
            return res.status(400).json({ message: 'Resume file is required.' });
        }

        if (!jobTitle || !jobDescription) {
            return res.status(400).json({ message: 'Job title and description are required.' });
        }

        const resumeText = await extractTextFromPdf(resumeFile.buffer);

        const analysis = await analyzeResumeWithATS(resumeText, jobTitle, jobDescription);
        if (analysis?.error) {
            return res.status(502).json({ message: analysis.error });
        }

        const isGuest = !req.user?.id;

        const report = new AtsReport({
            user: req.user?.id || null,
            jobTitle,
            jobDescription,
            resumeText,
            report: analysis,
            expiresAt: isGuest ? new Date(Date.now() + GUEST_REPORT_TTL_MS) : null,
        });

        await report.save();

        if (typeof req.commitUsage === 'function') {
            try {
                await req.commitUsage();
            } catch (usageError) {
                console.error('ATS usage commit error:', usageError);
            }
        }

        res.status(200).json({
            ...analysis,
            resumeText,
            isGuest
        });
    } catch (error) {
        console.error('Error in ATS check:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.improveResume = async (req, res) => {
    try {
        const { resumeText, jobTitle, jobDescription, atsFeedback } = req.body;

        if (!resumeText || !jobTitle || !jobDescription || !atsFeedback) {
            return res.status(400).json({ message: 'Missing required fields for resume improvement.' });
        }

        const improvedResume = await improveResumeWithAI(resumeText, jobTitle, jobDescription, atsFeedback);

        if (improvedResume?.error) {
            return res.status(500).json({ message: improvedResume.error });
        }

        res.status(200).json({ improvedResume });
    } catch (error) {
        console.error('Error improving resume:', error);
    }
};

exports.getAtsReportById = async (req, res) => {
    try {
        const reportId = req.params.id;
        const report = await AtsReport.findOne({ _id: reportId, user: req.user.id });

        if (!report) {
            return res.status(404).json({ message: 'ATS scan report not found' });
        }

        res.status(200).json({ report });
    } catch (error) {
        console.error('Error fetching ATS report:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
