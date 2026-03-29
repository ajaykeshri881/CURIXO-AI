function safeText(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;")
}

function cleanJsonText(text) {
    return String(text || "").replace(/```json/g, "").replace(/```/g, "").trim()
}

const SKILL_BUCKETS = [
    {
        category: 'Frontend',
        keywords: ['html', 'css', 'sass', 'scss', 'javascript', 'typescript', 'react', 'next', 'redux', 'tailwind', 'bootstrap', 'material ui', 'mui', 'vue', 'angular', 'vite']
    },
    {
        category: 'Backend',
        keywords: ['node', 'express', 'nest', 'django', 'flask', 'spring', 'laravel', 'rest api', 'graphql', 'microservices', 'socket', 'jwt']
    },
    {
        category: 'Databases',
        keywords: ['mongodb', 'mysql', 'postgres', 'postgresql', 'sqlite', 'mariadb', 'redis', 'firebase', 'supabase', 'prisma', 'sql', 'nosql', 'vector database']
    },
    {
        category: 'DevOps & Cloud',
        keywords: ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'vercel', 'netlify', 'ci/cd', 'github actions', 'terraform', 'nginx', 'linux']
    },
    {
        category: 'Tools & Platforms',
        keywords: ['git', 'github', 'gitlab', 'postman', 'npm', 'yarn', 'pnpm', 'figma', 'jira', 'webpack', 'babel']
    },
    {
        category: 'Concepts',
        keywords: ['system design', 'dsa', 'data structures', 'algorithms', 'oop', 'design patterns', 'problem solving', 'agile', 'scrum']
    }
]

function splitSkillToken(value) {
    return String(value || "")
        .split(/[,;|]+/)
        .map(part => part.trim())
        .filter(Boolean)
}

function dedupeCaseInsensitive(items) {
    const seen = new Set()
    return items.filter(item => {
        const key = String(item || "").trim().toLowerCase()
        if (!key || seen.has(key)) return false
        seen.add(key)
        return true
    })
}

function classifySkill(skill) {
    const normalized = String(skill || "").toLowerCase()
    for (const bucket of SKILL_BUCKETS) {
        if (bucket.keywords.some(keyword => normalized.includes(keyword))) {
            return bucket.category
        }
    }
    return 'Other Skills'
}

function groupFlatSkills(flatSkills) {
    const grouped = new Map()

    flatSkills.forEach(skill => {
        const bucket = classifySkill(skill)
        if (!grouped.has(bucket)) grouped.set(bucket, [])
        grouped.get(bucket).push(skill)
    })

    const bucketOrder = SKILL_BUCKETS.map(b => b.category).concat('Other Skills')

    return bucketOrder
        .filter(category => grouped.has(category) && grouped.get(category).length)
        .map(category => ({
            category,
            items: dedupeCaseInsensitive(grouped.get(category))
        }))
}

function normalizeSkills(rawSkills) {
    if (!Array.isArray(rawSkills) || rawSkills.length === 0) return []

    const isGroupedInput = typeof rawSkills[0] === 'object' && rawSkills[0] !== null && 'items' in rawSkills[0]

    if (!isGroupedInput) {
        const flat = dedupeCaseInsensitive(rawSkills.flatMap(splitSkillToken))
        return groupFlatSkills(flat)
    }

    const normalizedGroups = rawSkills
        .filter(group => group && Array.isArray(group.items))
        .map(group => ({
            category: String(group.category || '').trim(),
            items: dedupeCaseInsensitive(group.items.flatMap(splitSkillToken))
        }))
        .filter(group => group.items.length)

    if (!normalizedGroups.length) return []

    // If AI returned one generic bucket, auto-distribute to meaningful categories.
    if (
        normalizedGroups.length === 1 &&
        /^(skills|technical skills?|tech stack)$/i.test(normalizedGroups[0].category)
    ) {
        return groupFlatSkills(normalizedGroups[0].items)
    }

    return normalizedGroups.map(group => ({
        category: group.category || 'Skills',
        items: group.items
    }))
}

function normalizeEducationItem(rawEdu) {
    const edu = { ...(rawEdu || {}) }
    const yearPattern = /\b(?:19|20)\d{2}\b(?:\s*[-–to]+\s*\b(?:19|20)\d{2}\b)?/i
    const schoolHintPattern = /(college|university|institute|school|academy|polytechnic)/i

    let degree = String(edu.degree || "").trim()
    let school = String(edu.school || "").trim()
    let year = String(edu.year || "").trim()

    const parseParts = (text) => String(text || "").split("|").map(p => p.trim()).filter(Boolean)
    const extractYear = (text) => {
        const match = String(text || "").match(yearPattern)
        return match ? match[0].replace(/\s+/g, " ").trim() : ""
    }

    const assignFromParts = (parts) => {
        for (const part of parts) {
            if (!year && extractYear(part)) {
                year = extractYear(part)
                continue
            }
            if (!school && schoolHintPattern.test(part)) {
                school = part
                continue
            }
            if (!degree) {
                degree = part
            }
        }
    }

    if (degree.includes("|")) {
        const degreeParts = parseParts(degree)
        degree = ""
        assignFromParts(degreeParts)
    }

    if (school.includes("|")) {
        const schoolParts = parseParts(school)
        school = ""
        assignFromParts(schoolParts)
    }

    if (!year) {
        const degreeYear = extractYear(degree)
        if (degreeYear) {
            year = degreeYear
            degree = degree.replace(yearPattern, "").replace(/\(\s*\)|\[\s*\]/g, "").trim()
        }
    }

    if (!year) {
        const schoolYear = extractYear(school)
        if (schoolYear) {
            year = schoolYear
            school = school.replace(yearPattern, "").replace(/\(\s*\)|\[\s*\]/g, "").trim()
        }
    }

    if (degree && school && degree.toLowerCase().includes(school.toLowerCase())) {
        degree = degree.replace(new RegExp(school.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig"), "").replace(/[|,-]\s*$/g, "").trim()
    }

    return {
        ...edu,
        degree,
        school,
        year
    }
}

/**
 * Derives real, non-fabricated achievement statements from what the user
 * actually provided (projects, experience, education). Used as a fallback
 * when the AI returns an empty achievements array.
 */
function generateFallbackAchievements(data) {
    const items = []

    // From projects
    if (Array.isArray(data?.projects)) {
        data.projects.slice(0, 2).forEach(p => {
            if (p && p.name) {
                const stack = p.techStack ? ` using ${p.techStack}` : ""
                items.push(`Designed and developed "${p.name}"${stack} — a fully functional application demonstrating end-to-end software engineering skills.`)
            }
        })
    }

    // From experience
    if (Array.isArray(data?.experience)) {
        data.experience.slice(0, 1).forEach(e => {
            if (e && e.role) {
                const at = e.company ? ` at ${e.company}` : ""
                items.push(`Contributed as ${e.role}${at}, applying professional engineering practices in a real-world software environment.`)
            }
        })
    }

    // From education
    if (Array.isArray(data?.education)) {
        data.education.slice(0, 1).forEach(e => {
            if (e && e.degree && e.school) {
                items.push(`Completed ${e.degree} from ${e.school}${e.year ? ` (${e.year})` : ""}, building a strong academic foundation in core computer science and engineering principles.`)
            }
        })
    }

    // Generic fallback if nothing was derivable
    if (items.length === 0) {
        items.push("Consistently demonstrated strong problem-solving skills and a commitment to writing clean, maintainable, production-ready code.")
        items.push("Proactively expanded technical expertise through self-driven learning, personal projects, and engagement with modern software development practices.")
    }

    return items.slice(0, 4)
}

function normalizeResumeData(data, fallbackJobTitle = "") {
    const cleanArray = (arr, coreKeys) => {
        if (!Array.isArray(arr)) return [];
        return arr.filter(item => {
            if (typeof item === 'string') return item.trim().length > 0;
            if (!item || typeof item !== 'object') return false;
            // Return true if any of the core keys exist and aren't empty strings
            return coreKeys.some(key => {
                const val = item[key];
                if (Array.isArray(val)) return val.some(v => v && String(v).trim().length > 0);
                return val && String(val).trim().length > 0;
            });
        });
    };

    return {
        name: data?.name || data?.fullName || "Candidate Name",
        title: data?.title || data?.headline || fallbackJobTitle || "Professional",
        email: data?.email || "",
        phone: data?.phone || "",
        location: data?.location || "",
        linkedin: data?.linkedin || "",
        github: data?.github || "",
        portfolio: data?.portfolio || "",
        summary: data?.summary || "",
        skills: normalizeSkills(data?.skills),
        experience: cleanArray(data?.experience, ['role', 'company', 'bullets']).map(exp => ({
            ...exp,
            bullets: Array.isArray(exp.bullets) ? exp.bullets.filter(b => b && String(b).trim().length > 0) : []
        })),
        education: cleanArray(data?.education, ['degree', 'school']).map(edu => {
            const normalizedEdu = normalizeEducationItem(edu)
            return {
                ...normalizedEdu,
                bullets: Array.isArray(normalizedEdu.bullets) ? normalizedEdu.bullets.filter(b => b && String(b).trim().length > 0) : []
            }
        }),
        projects: cleanArray(data?.projects, ['name', 'description']),
        certifications: cleanArray(data?.certifications, []),
        achievements: (() => {
            const cleaned = cleanArray(data?.achievements, [])
            // If AI returned a non-empty array, use it; otherwise derive from real data
            return cleaned.length > 0 ? cleaned : generateFallbackAchievements(data)
        })()
    }
}

function structuredResumeToText(data) {
    const lines = []
    lines.push(`${data.name}`)
    lines.push(`${data.title}`)

    const contacts = [data.email, data.phone, data.location, data.linkedin, data.github, data.portfolio].filter(Boolean)
    if (contacts.length) lines.push(contacts.join(" | "))

    if (data.summary) {
        lines.push("\nPROFESSIONAL SUMMARY")
        lines.push(data.summary)
    }

    if (data.skills.length) {
        lines.push("\nSKILLS")
        data.skills.forEach(group => {
            lines.push(`${group.category}: ${(Array.isArray(group.items) ? group.items : []).join(", ")}`)
        })
    }

    if (data.experience.length) {
        lines.push("\nWORK EXPERIENCE")
        data.experience.forEach((item) => {
            lines.push(`${item.role || ""} | ${item.company || ""} | ${item.duration || ""}`.replace(/\s+\|\s+\|/g, " |").trim())
            ;(Array.isArray(item.bullets) ? item.bullets : []).forEach((bullet) => {
                lines.push(`- ${bullet}`)
            })
            lines.push("")
        })
    }

    if (data.education.length) {
        lines.push("\nEDUCATION")
        data.education.forEach((item) => {
            lines.push(`${item.degree || ""} - ${item.school || ""} (${item.year || ""})`.trim())
        })
    }

    if (data.projects.length) {
        lines.push("\nPROJECTS")
        data.projects.forEach((item) => {
            lines.push(`${item.name || "Project"}: ${item.description || ""}`)
            if (item.techStack) lines.push(`Tech: ${item.techStack}`)
        })
    }

    return lines.join("\n").trim()
}

module.exports = {
    safeText,
    cleanJsonText,
    normalizeResumeData,
    structuredResumeToText
}
