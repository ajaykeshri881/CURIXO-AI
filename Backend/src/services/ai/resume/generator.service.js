const { generateWithFailover } = require("../google")
const { buildResumeHtml } = require("./template")
const { cleanJsonText, normalizeResumeData, structuredResumeToText } = require("./helpers")

async function generateStructuredResumeData(jobTitle, userInfo) {
    const prompt = `
You are an elite ATS resume writer.
Create a professional, highly-optimized resume EXACTLY from the provided user profile for the target job title "${jobTitle}".
Return strict JSON only (no markdown).

CRITICAL INSTRUCTIONS:
1. NEVER hallucinate or invent fake companies, job titles, or unearned degrees.
2. HOWEVER, you must heavily EXPAND and ELABORATE on the provided experience and projects. If the provided descriptions are short or basic, transform them into 3 to 5 highly detailed, impressive, and lengthy bullet points per role/project.
3. Use universally accepted industry standards, methodologies, and technical details that logically fit the provided role to make the resume heavily ATS-optimized.
4. Ensure the summary is powerful and comprehensive. Do not output a sparse or empty-looking resume.
5. Enhance all wording to be highly professional and action-oriented.
6. If the user has NOT provided any work experience data, return an EMPTY "experience" array ([]). Do NOT invent or fabricate any work experience. Only include experience the user explicitly mentioned.
7. If the user did not explicitly provide any 'Achievements', you MUST generate 2-3 impressive achievements by intelligently extracting implicit successes from their provided work experience or projects. Do not invent completely fake metrics, but do highlight their real work as explicit achievements.

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
      "year": "",
      "bullets": [""]
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
  ],
  "certifications": [""],
  "achievements": [""]
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
