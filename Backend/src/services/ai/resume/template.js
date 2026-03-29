const { safeText } = require("./helpers")

function normalizeUrl(url) {
  const raw = String(url || "").trim()
  if (!raw) return ""
  if (/^https?:\/\//i.test(raw)) return raw
  return `https://${raw}`
}

const ICON = {
  location: `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.2c-1.22 0-2.2-.98-2.2-2.2S10.78 6.8 12 6.8s2.2.98 2.2 2.2-.98 2.2-2.2 2.2z"/></svg>`,
  email: `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>`,
  phone: `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79a15.46 15.46 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.24.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>`,
}

function buildResumeHtml(data) {
  const contactItems = []
  if (data.phone) contactItems.push(`<span class="contact-item">${ICON.phone}<span>${safeText(data.phone)}</span></span>`)
  if (data.email) contactItems.push(`<a class="contact-item" href="mailto:${safeText(data.email)}">${ICON.email}<span>${safeText(data.email)}</span></a>`)
  if (data.location) contactItems.push(`<span class="contact-item">${ICON.location}<span>${safeText(data.location)}</span></span>`)

  const profileLinks = []
  if (data.linkedin) profileLinks.push(`<a href="${safeText(normalizeUrl(data.linkedin))}" target="_blank" rel="noopener noreferrer">LinkedIn</a>`)
  if (data.github) profileLinks.push(`<a href="${safeText(normalizeUrl(data.github))}" target="_blank" rel="noopener noreferrer">GitHub</a>`)
  if (data.portfolio) profileLinks.push(`<a href="${safeText(normalizeUrl(data.portfolio))}" target="_blank" rel="noopener noreferrer">Portfolio</a>`)

  const isCourseworkLine = (line) => /^(relevant\s+)?coursework\s*:/i.test(String(line || "").trim())
  const normalizeCourseworkText = (line) => String(line || "").replace(/^(relevant\s+)?coursework\s*:/i, "").trim()
  const formatSkillCategory = (category) => {
    const raw = String(category || "").trim()
    if (!raw) return "Skills"
    return raw
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .replace(/\b\w/g, ch => ch.toUpperCase())
  }

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${safeText(data.name)} - Resume</title>
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: "Montserrat", "Segoe UI", Arial, sans-serif;
      font-size: 10pt;
      color: #2f2f2f;
      background: #ececec;
      line-height: 1.55;
      -webkit-font-smoothing: antialiased;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      background: #ffffff;
      margin: 0 auto;
      padding: 14mm 15mm 12mm;
      box-shadow: 0 0 0 1px #dddddd;
    }

    .header {
      text-align: center;
      border-bottom: 1px solid #6f6f6f;
      padding-bottom: 10px;
      margin-bottom: 12px;
    }

    .name {
      font-size: 24pt;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #2a2a2a;
      line-height: 1.1;
    }

    .role {
      margin-top: 2px;
      font-size: 11.5pt;
      font-weight: 500;
      color: #3b3b3b;
    }

    .contact-row {
      margin-top: 7px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 0;
      font-size: 8.8pt;
    }

    .contact-item {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: #555555;
      text-decoration: none;
      white-space: nowrap;
    }

    .contact-item svg {
      flex-shrink: 0;
      color: #2f2f2f;
    }

    .contact-item + .contact-item::before {
      content: "|";
      color: #8a8a8a;
      margin: 0 8px;
    }

    .links-row {
      margin-top: 4px;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0;
      font-size: 8.6pt;
    }

    .links-row a {
      color: #444444;
      text-decoration: none;
      font-weight: 600;
    }

    .links-row a + a::before {
      content: "|";
      color: #8a8a8a;
      margin: 0 7px;
    }

    section {
      margin-top: 12px;
    }

    .section-title {
      font-size: 10.8pt;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #2f2f2f;
      padding-bottom: 4px;
      border-bottom: 1px solid #6f6f6f;
      margin-bottom: 7px;
      break-after: avoid-page;
      page-break-after: avoid;
    }

    .summary {
      font-size: 10pt;
      color: #3d3d3d;
      text-align: left;
    }

    .entry {
      margin-bottom: 10px;
    }

    .entry:last-child {
      margin-bottom: 0;
    }

    .entry-meta {
      font-size: 9.2pt;
      color: #666666;
      margin-bottom: 1px;
    }

    .entry-title {
      font-size: 10.8pt;
      font-weight: 700;
      color: #2f2f2f;
      line-height: 1.35;
    }

    .entry-subtitle {
      margin-top: 1px;
      font-size: 9.6pt;
      font-weight: 600;
      color: #3f3f3f;
    }

    .entry-summary {
      margin-top: 2px;
      font-size: 9.7pt;
      color: #3f3f3f;
    }

    .blist {
      margin: 3px 0 0 18px;
      padding: 0;
    }

    .blist li {
      font-size: 9.6pt;
      color: #3f3f3f;
      line-height: 1.5;
      margin-bottom: 2px;
    }

    .coursework {
      margin-top: 2px;
      font-size: 9.5pt;
      color: #3f3f3f;
    }

    .coursework-label {
      font-weight: 700;
      color: #2f2f2f;
    }

    .project-links {
      margin-top: 3px;
      font-size: 9pt;
      color: #4a4a4a;
    }

    .project-links a {
      color: #4a4a4a;
      text-decoration: none;
      font-weight: 600;
    }

    .project-links a + a::before {
      content: "|";
      margin: 0 6px;
      color: #8a8a8a;
    }

    .skills-rows {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .skill-row {
      display: block;
      break-inside: avoid-page;
      page-break-inside: avoid;
    }

    .skill-row-key {
      display: inline;
      font-size: 10.6pt;
      font-weight: 800;
      color: #2f2f2f;
      letter-spacing: 0;
      line-height: 1.45;
    }

    .skill-row-key::after {
      content: ":";
      margin-right: 6px;
    }

    .skill-row-value {
      display: inline;
      font-size: 10.2pt;
      color: #3f3f3f;
      line-height: 1.45;
      word-break: break-word;
    }

    .simple-list {
      margin: 0;
      padding-left: 18px;
    }

    .simple-list li {
      font-size: 9.7pt;
      color: #3f3f3f;
      margin-bottom: 2px;
    }

    @page {
      size: A4;
      margin: 0;
    }

    @media print {
      html, body {
        width: 210mm;
        background: #ffffff !important;
      }

      .page {
        margin: 0;
        box-shadow: none;
      }

      .header,
      .section-title {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      section {
        break-inside: auto;
        page-break-inside: auto;
      }

      .entry,
      .skill-row,
      .simple-list li,
      .blist li {
        break-inside: avoid-page;
        page-break-inside: avoid;
      }

      a {
        text-decoration: none !important;
      }
    }

    @media (max-width: 900px) {
      .page {
        width: 100%;
        min-height: auto;
        margin: 0;
        padding: 8mm;
        box-shadow: none;
      }

      .name {
        font-size: 18pt;
      }

      .skill-row {
        display: block;
      }
    }
  </style>
</head>
<body>
<main class="page">

  <header class="header">
    <h1 class="name">${safeText(data.name)}</h1>
    ${data.title ? `<p class="role">${safeText(data.title)}</p>` : ""}
    ${contactItems.length ? `<div class="contact-row">${contactItems.join("")}</div>` : ""}
    ${profileLinks.length ? `<div class="links-row">${profileLinks.join("")}</div>` : ""}
  </header>

    ${data.summary ? `
    <section>
      <h2 class="section-title">About Me</h2>
      <p class="summary">${safeText(data.summary)}</p>
    </section>` : ""}

    ${data.education && data.education.length ? `
    <section>
      <h2 class="section-title">Education</h2>
      ${data.education.map(item => {
        const bullets = Array.isArray(item.bullets) ? item.bullets.filter(Boolean) : []
        const coursework = bullets.find(isCourseworkLine)
        const otherBullets = bullets.filter((line) => !isCourseworkLine(line))

        return `<div class="entry">
          <p class="entry-meta">${safeText(item.school || "")}${item.year ? ` | ${safeText(item.year)}` : ""}</p>
          <h3 class="entry-title">${safeText(item.degree || "")}</h3>
          ${item.location ? `<p class="entry-summary">${safeText(item.location)}</p>` : ""}
          ${coursework ? `<p class="coursework"><span class="coursework-label">Coursework:</span> ${safeText(normalizeCourseworkText(coursework))}</p>` : ""}
          ${otherBullets.length ? `<ul class="blist">${otherBullets.map(b => `<li>${safeText(b)}</li>`).join("")}</ul>` : ""}
        </div>`
      }).join("")}
    </section>` : ""}

    ${data.experience && data.experience.length ? `
    <section>
      <h2 class="section-title">Work Experience</h2>
      ${data.experience.map(item => `
      <div class="entry">
        <p class="entry-meta">${safeText(item.company || "")}${item.duration ? ` | ${safeText(item.duration)}` : ""}</p>
        <h3 class="entry-title">${safeText(item.role || "")}</h3>
        ${Array.isArray(item.bullets) && item.bullets.length ? `<ul class="blist">${item.bullets.map(b => `<li>${safeText(b)}</li>`).join("")}</ul>` : ""}
      </div>`).join("")}
    </section>` : ""}

    ${data.projects && data.projects.length ? `
    <section>
      <h2 class="section-title">Projects</h2>
      ${data.projects.map(item => `
      <div class="entry">
        <h3 class="entry-title">${safeText(item.name || "Project")}</h3>
        ${item.techStack ? `<p class="entry-summary">${safeText(item.techStack)}</p>` : ""}
        ${item.description ? `<p class="entry-summary">${safeText(item.description)}</p>` : ""}
        ${(item.demoUrl || item.githubUrl) ? `<p class="project-links">
          ${item.demoUrl ? `<a href="${safeText(normalizeUrl(item.demoUrl))}" target="_blank" rel="noopener noreferrer">Live Demo</a>` : ""}
          ${item.githubUrl ? `<a href="${safeText(normalizeUrl(item.githubUrl))}" target="_blank" rel="noopener noreferrer">Source Code</a>` : ""}
        </p>` : ""}
      </div>`).join("")}
    </section>` : ""}

    ${data.skills && data.skills.length ? `
    <section>
      <h2 class="section-title">Technical Skills</h2>
      <div class="skills-rows">
        ${data.skills.map(group => `
          <div class="skill-row">
            <span class="skill-row-key">${safeText(formatSkillCategory(group.category || "Skills"))}</span>
            <span class="skill-row-value">${(Array.isArray(group.items) ? group.items : []).map(item => safeText(item)).join(", ")}</span>
          </div>
        `).join("")}
      </div>
    </section>` : ""}

    ${data.certifications && data.certifications.length ? `
    <section>
      <h2 class="section-title">Certifications</h2>
      <ul class="simple-list">
        ${data.certifications.map(c => `<li>${safeText(c)}</li>`).join("")}
      </ul>
    </section>` : ""}

    ${data.achievements && data.achievements.length ? `
    <section>
      <h2 class="section-title">Achievements</h2>
      <ul class="simple-list">
        ${data.achievements.map(a => `<li>${safeText(a)}</li>`).join("")}
      </ul>
    </section>` : ""}
</main>
</body>
</html>`
}

module.exports = { buildResumeHtml }
