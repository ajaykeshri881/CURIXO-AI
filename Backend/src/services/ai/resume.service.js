const { analyzeResumeWithATS, improveResumeWithAI } = require("./resume/ats.service")
const { generateResumeHtmlFromScratch } = require("./resume/generator.service")
const { generateResumePdfFromHtml } = require("./resume/pdf.service")

module.exports = {
    analyzeResumeWithATS,
    improveResumeWithAI,
    generateResumeHtmlFromScratch,
    generateResumePdfFromHtml
}
