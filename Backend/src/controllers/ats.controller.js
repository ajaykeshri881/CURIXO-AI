const pdf = require('pdf-parse');
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

        const data = await pdf(resumeFile.buffer);
        const resumeText = data.text;

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

        res.status(200).json({ improvedResume });
    } catch (error) {
        console.error('Error improving resume:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
