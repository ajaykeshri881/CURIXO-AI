const { generateWithFailover } = require("../google")
const { cleanJsonText } = require("./helpers")

async function analyzeResumeWithATS(resumeText, jobTitle, jobDescription) {
    try {
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
        1.  **ATS Score (out of 100):** Calculate an integer score. Return a whole number only (e.g., 82, not 82.88).
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
          "score": <number (integer)>,
          "strengths": "<string>",
          "weaknesses": "<string>",
          "missingKeywords": ["<keyword1>", "<keyword2>", ...],
          "suggestions": "<string>"
        }
        `

        const text = await generateWithFailover(prompt)
        const parsedResult = JSON.parse(cleanJsonText(text));
        if (parsedResult && typeof parsedResult.score === 'number') {
            parsedResult.score = Math.round(parsedResult.score);
        }
        return parsedResult;
    } catch (error) {
        console.error("Error in analyzeResumeWithATS:", error)
        return { error: "Failed to analyze resume." }
    }
}

async function improveResumeWithAI(resumeText, jobTitle, jobDescription, atsFeedback) {
    try {
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
              1.  **Keyword Integration:** Seamlessly integrate the "Missing Keyword" from the ATS feedback into the resume naturally, adjusting the surrounding context so it flows beautifully with the candidate's existing experience.
              2.  **Action-Oriented Language & Expansion:** Rewrite all experience bullet points using the STAR method. START every bullet point with a powerful action verb. If the original text is short or basic, you MUST confidently EXPAND and ELABORATE upon the described responsibilities using standard, universally accepted industry practices. Ensure every role has 3-5 high-impact, detailed sentence-length bullets.
              3.  **No Fake Jobs:** DO NOT invent entirely fake or unmentioned companies, job titles, or degrees. However, DO logically flesh out the given roles to make them sound incredibly competent, senior, and ATS-optimized.
              4.  **Complete Sections:** Ensure that all essential resume sections (Summary, Experience, Education, Skills, Projects) are present, look full, and are properly formatted for ATS systems.
              5.  **Tailor Summary:** Rewrite the professional summary to mirror the language of the job description using ONLY the candidate's real background.
              6.  **ATS-Friendly Formatting:** Structure the final output as clean, semantic HTML. Use vanilla inline CSS to make it look like a highly professional, modern resume suitable for a PDF export. 
                  - Use standard layout components like <header>, <section>, <h1>, <h2>, <ul>, <li>.
                  - Use a clean sans-serif font like Inter, Arial, or Helvetica.
                  - Do NOT use complex multi-column layouts, tables, or Javascript. Keep the HTML simple and linearly parsable so ATS systems can easily read it.

              **Output format rules:**
              Return ONLY the raw HTML string containing the <style> block and the resume body content. Do NOT include \`<!DOCTYPE html>\`, \`<html>\`, \`<head>\`, \`<meta>\`, or \`<title>\` tags, as this output will be directly injected into a <div> element. Do not include any markdown wrappers (like \`\`\`html) or explanatory text.
          `

        const text = await generateWithFailover(prompt)
        return text.replace(/```html/g, "").replace(/```/g, "").trim()
    } catch (error) {
        console.error("Error in improveResumeWithAI:", error)
        return { error: "Failed to improve resume." }
    }
}

module.exports = {
    analyzeResumeWithATS,
    improveResumeWithAI
}
