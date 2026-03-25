const { genAI, modelName } = require("../google")
const { cleanJsonText } = require("./helpers")

async function analyzeResumeWithATS(resumeText, jobTitle, jobDescription) {
    try {
        const model = genAI.getGenerativeModel({ model: modelName })
        const prompt = `
        You are the most advanced and strict Applicant Tracking System (ATS) used by top-tier tech companies.
        Your task is to perform a forensic analysis of the provided resume against the job description. Your standards are exceptionally high.

        **Resume Text:**
        ${resumeText}

        **Job Title:**
        ${jobTitle}

        **Job Description:**
        ${jobDescription}

        **Strict Analysis Rules:**
        1.  **ATS Score (out of 100):** Calculate a score with extreme precision.
            - Deduct points for every missing keyword from the job description.
            - Deduct points for experience that doesn't directly correlate with the job's requirements.
            - Analyze the formatting. The resume must be clean, simple, and easily parsable. No complex tables, columns, or graphics.
            - Score 100 should be reserved for a resume that is a perfect, flawless match.
        2.  **Strengths:** List the top 3 elements that strongly align with the job description.
        3.  **Weaknesses & Gaps:** Identify every single weakness, gap, or area for improvement. Be brutally honest.
        4.  **Critical Missing Keywords:** List all high-priority keywords and skills from the job description that are completely missing from the resume.
        5.  **Actionable Suggestions:** Provide a clear, step-by-step guide on how to improve the resume to reach a 100 score. The suggestions must be specific and directly reference parts of the resume and job description.

        **Output Format (JSON only, no markdown):**
        {
          "score": <number>,
          "strengths": "<string>",
          "weaknesses": "<string>",
          "missingKeywords": ["<keyword1>", "<keyword2>", ...],
          "suggestions": "<string>"
        }
      `

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = await response.text()
        return JSON.parse(cleanJsonText(text))
    } catch (error) {
        console.error("Error in analyzeResumeWithATS:", error)
        return { error: "Failed to analyze resume." }
    }
}

async function improveResumeWithAI(resumeText, jobTitle, jobDescription, atsFeedback) {
    try {
        const model = genAI.getGenerativeModel({ model: modelName })
        const prompt = `
              You are an expert resume writer and career coach with a specialization in passing ATS scans with a 100% score.
              Your task is to rewrite and perfect the given resume based on the provided ATS feedback to make it an undeniable match for the job description.

              **Original Resume:**
              ${resumeText}

              **Job Title:**
              ${jobTitle}

              **Job Description:**
              ${jobDescription}

              **ATS Feedback to Address:**
              ${JSON.stringify(atsFeedback, null, 2)}

              **Instructions:**
              1.  **Keyword Integration:** Seamlessly integrate every single "Missing Keyword" from the ATS feedback into the resume. The integration must be natural and contextually appropriate.
              2.  **Action-Oriented Language:** Rewrite all experience bullet points using the STAR (Situation, Task, Action, Result) method. Start every bullet point with a powerful action verb.
              3.  **Quantify Everything:** Where possible, add quantifiable achievements (e.g., "Increased user engagement by 25%", "Reduced API response time by 150ms"). If no numbers are present, frame the achievement in a way that implies significant impact.
              4.  **Tailor Summary:** Rewrite the professional summary to be a powerful, concise pitch that mirrors the language and priorities of the job description.
              5.  **ATS-Friendly Formatting:** Ensure the final output is plain text, perfectly formatted for easy parsing. Use standard section headers (e.g., "Professional Summary", "Skills", "Work Experience", "Education", "Projects").

              **Output:**
              Return only the full, improved, and 100% ATS-compliant resume text. Do not include any commentary or explanation.
          `

        const result = await model.generateContent(prompt)
        const response = await result.response
        return await response.text()
    } catch (error) {
        console.error("Error in improveResumeWithAI:", error)
        return { error: "Failed to improve resume." }
    }
}

module.exports = {
    analyzeResumeWithATS,
    improveResumeWithAI
}
