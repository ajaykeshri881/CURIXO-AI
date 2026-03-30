const { generateResumeHtmlFromScratch, generateResumePdfFromHtml } = require('../services/ai/resume.service');

exports.createFromScratch = async (req, res) => {
    try {
        const { jobTitle, userInfo } = req.body;

        if (!jobTitle || !userInfo) {
            return res.status(400).json({ message: 'Job title and user information are required.' });
        }

        const resumePackage = await generateResumeHtmlFromScratch(jobTitle, userInfo);

        if (resumePackage?.error) {
            return res.status(500).json({ message: resumePackage.error });
        }

        res.status(200).json({
            generatedResume: resumePackage.generatedResume,
            resumeHtml: resumePackage.resumeHtml,
            structuredData: resumePackage.structuredData
        });
    } catch (error) {
        console.error('Error creating resume from scratch:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.downloadPdfFromScratch = async (req, res) => {
    try {
        const { resumeHtml } = req.body;

        if (!resumeHtml || !String(resumeHtml).trim()) {
            return res.status(400).json({ message: 'resumeHtml is required to download PDF.' });
        }

        const htmlToRender = resumeHtml

        const pdfBuffer = await generateResumePdfFromHtml(htmlToRender)

        // Ensure it's a real Buffer for binary response
        const buf = Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer)

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=ATS_Optimized_Resume.pdf',
            'Content-Length': buf.length
        })

        // Use res.end() not res.send() to avoid Express 5 string coercion
        return res.end(buf)
    } catch (error) {
        console.error('Error downloading resume pdf:', {
            message: error?.message,
            code: error?.code,
            stack: error?.stack
        })

        if (error?.code === 'PDF_INVALID_HTML') {
            return res.status(400).json({ message: 'Resume HTML is invalid or empty. Please regenerate the preview and retry.' })
        }

        if (error?.code === 'PDF_BROWSER_LAUNCH_FAILED') {
            return res.status(503).json({ message: 'PDF engine is temporarily unavailable. Please try again in a minute.' })
        }

        if (error?.name === 'TimeoutError') {
            return res.status(504).json({ message: 'PDF generation timed out. Please try again.' })
        }

        return res.status(500).json({ message: 'Unable to generate PDF right now. Please try again.' })
    }
}
