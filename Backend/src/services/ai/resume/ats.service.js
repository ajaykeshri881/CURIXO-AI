const { generateWithFailover } = require("../google")
const { cleanJsonText, normalizeResumeData } = require("./helpers")
const { buildResumeHtml } = require("./template")

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
You are an expert ATS resume writer.
Rewrite the resume as structured JSON so it is stronger for the target role while remaining fully truthful.

STRICT RULES:
1. Use ONLY facts present in the original resume and ATS feedback context. Do not invent companies, job titles, degrees, awards, or fake metrics.
2. You may improve language, clarity, and impact, but must preserve factual integrity.
3. Ensure all major sections are well-formed: summary, skills, experience, projects, education.
4. EDUCATION FORMAT is mandatory:
     - "school" must contain only the institution/college name (for example: "IES College of Technology, Bhopal").
     - "degree" must contain only the course/degree name (for example: "B.Tech in Computer Science & Engineering").
     - Do NOT combine school + degree + year in one field.
     - If coursework exists, place it in education.bullets as a separate bullet.
5. ACHIEVEMENTS are mandatory:
     - Return a non-empty "achievements" array with 2-4 entries.
     - Derive achievements from real resume content only (projects, education, experience, certifications).
     - No fabricated awards, rankings, or numbers.
6. Keep output ATS-friendly and concise with strong action-oriented bullets.
7. SKILLS FORMAT is mandatory:
    - Group skills into practical categories such as Frontend, Backend, Databases, DevOps & Cloud, Tools & Platforms, Testing, and Concepts (include only relevant ones).
    - Do not return a single generic category like "Skills" unless there is no other valid grouping possible.
8. Return strict JSON only. No markdown.

Original Resume Text:
${resumeText}

Target Job Title:
${jobTitle}

Job Description:
${jobDescription}

ATS Feedback:
${JSON.stringify(atsFeedback, null, 2)}

Return this exact JSON shape:
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
    "skills": [
        { "category": "", "items": [""] }
    ],
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
            "location": "",
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
                const structuredDataRaw = JSON.parse(cleanJsonText(text))
                const structuredData = normalizeResumeData(structuredDataRaw, jobTitle)

                return buildResumeHtml(structuredData)
    } catch (error) {
        console.error("Error in improveResumeWithAI:", error)
        return { error: "Failed to improve resume." }
    }
}

module.exports = {
    analyzeResumeWithATS,
    improveResumeWithAI
}
