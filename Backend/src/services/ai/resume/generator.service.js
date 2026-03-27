const { generateWithFailover } = require("../google")
const { buildResumeHtml } = require("./template")
const { cleanJsonText, normalizeResumeData, structuredResumeToText } = require("./helpers")

async function generateStructuredResumeData(jobTitle, userInfo) {
    const prompt = `
You are an elite ATS resume writer.
Create a professional resume from user profile for job title "${jobTitle}".
Return strict JSON only (no markdown).

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
