const { generateWithFailover } = require('./google');
const puppeteer = require("puppeteer")

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
  try {
    const prompt = `
You are an expert interview coach.
Analyze the candidate profile and return strict JSON only.

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

Return JSON in this exact shape:
{
  "overallScore": <number 0-100>,
  "summary": "<short summary>",
  "technicalQuestions": ["q1", "q2", "q3", "q4", "q5"],
  "behavioralQuestions": ["q1", "q2", "q3", "q4", "q5"],
  "skillGaps": ["gap1", "gap2", "gap3"],
  "preparationPlan": ["step1", "step2", "step3", "step4", "step5"]
}
`

    const text = await generateWithFailover(prompt)
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim()
    return JSON.parse(cleanedText)
  } catch (error) {
    console.error("Error generating interview report:", error)
    return {
      overallScore: 0,
      summary: "Unable to generate report at this time.",
      technicalQuestions: [],
      behavioralQuestions: [],
      skillGaps: [],
      preparationPlan: []
    }
  }
}

async function generateResumePdf({ resume, jobDescription, selfDescription }) {
  const browser = await puppeteer.launch({ headless: true })
  try {
    const page = await browser.newPage()

    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; line-height: 1.5; color: #111; }
            h1 { margin-bottom: 8px; }
            h2 { margin-top: 24px; margin-bottom: 8px; }
            .section { margin-bottom: 16px; white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <h1>AI Resume Package</h1>
          <h2>Resume</h2>
          <div class="section">${String(resume || "")}</div>
          <h2>Target Job Description</h2>
          <div class="section">${String(jobDescription || "")}</div>
          <h2>Self Description</h2>
          <div class="section">${String(selfDescription || "")}</div>
        </body>
      </html>
    `

    await page.setContent(html, { waitUntil: "domcontentloaded" })
    return await page.pdf({ format: "A4", printBackground: true })
  } finally {
    await browser.close()
  }
}

module.exports = { generateInterviewReport, generateResumePdf };
