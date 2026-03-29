const { extractTextFromPdf } = require('../utils/pdfExtract');
const AtsReport = require('../models/atsReport.model');
const { analyzeResumeWithATS, improveResumeWithAI } = require('../services/ai/resume.service');

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

        const report = new AtsReport({
            user: req.user?.id || null,
            jobTitle,
            jobDescription,
            resumeText,
            report: analysis,
        });

        await report.save();

        res.status(200).json({
            ...analysis,
            resumeText,
            isGuest: !req.user?.id
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
