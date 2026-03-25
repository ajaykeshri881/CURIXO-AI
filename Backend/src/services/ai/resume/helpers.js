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

function normalizeResumeData(data, fallbackJobTitle = "") {
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
        skills: Array.isArray(data?.skills) ? data.skills : [],
        experience: Array.isArray(data?.experience) ? data.experience : [],
        education: Array.isArray(data?.education) ? data.education : [],
        projects: Array.isArray(data?.projects) ? data.projects : []
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
        lines.push(data.skills.join(", "))
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
