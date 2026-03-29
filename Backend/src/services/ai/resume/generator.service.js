const { generateWithFailover } = require("../google")
const { buildResumeHtml } = require("./template")
const { cleanJsonText, normalizeResumeData, structuredResumeToText } = require("./helpers")

async function generateStructuredResumeData(jobTitle, userInfo) {
    const prompt = `
You are an elite ATS resume writer.
Create a professional, highly-optimized resume EXACTLY from the provided user profile for the target job title "${jobTitle}".
Return strict JSON only (no markdown).

CRITICAL INSTRUCTIONS:
1. NEVER hallucinate, fabricate, or make up fake companies, job titles, universities, or experiences.
2. Rely strictly on the real data provided by the user. If information is scarce, do NOT invent filler content or random experiences.
3. Ensure all core sections (summary, skills, experience, education, projects) are fully populated using the provided data and formatted perfectly for ATS scanners.
4. Enhance the wording to be highly professional and action-oriented, but maintain 100% factual accuracy.

User Profile JSON:
${JSON.stringify(userInfo, null, 2)}

Return this exact structure:
{
  "name": "",
  "title": "",
  "email": "",
  "phone": "",
  "location": "",
  "linkedin": "",
  "github": "",
  "portfolio": "",
  "summary": "",
  "skills": [""],
  "experience": [
    {
      "role": "",
      "company": "",
      "duration": "",
      "bullets": [""]
    }
  ],
  "education": [
    {
      "degree": "",
      "school": "",
      "year": ""
    }
  ],
  "projects": [
    {
      "name": "",
      "description": "",
      "techStack": "",
      "githubUrl": "",
      "demoUrl": ""
    }
  ]
}
`

    const text = await generateWithFailover(prompt)
    return JSON.parse(cleanJsonText(text))
}

async function generateResumeHtmlFromScratch(jobTitle, userInfo) {
    try {
        const structuredDataRaw = await generateStructuredResumeData(jobTitle, userInfo)
        const structuredData = normalizeResumeData(structuredDataRaw, jobTitle)
        const generatedResume = structuredResumeToText(structuredData)
        const resumeHtml = buildResumeHtml(structuredData)

        return { generatedResume, resumeHtml, structuredData }
    } catch (error) {
        console.error("Error in generateResumeHtmlFromScratch:", error)
        return { error: "Failed to generate HTML resume." }
    }
}

module.exports = {
    generateStructuredResumeData,
    generateResumeHtmlFromScratch
}
