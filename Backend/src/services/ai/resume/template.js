const { safeText } = require("./helpers")

function buildResumeHtml(data) {
    const contacts = [data.email, data.phone, data.location, data.linkedin, data.github, data.portfolio].filter(Boolean)

    return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeText(data.name)} - Resume</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: "Times New Roman", Times, serif;
        font-size: 11pt;
        color: #1a1a1a;
        background: #f0f0f0;
        line-height: 1.45;
      }
      .page {
        width: 210mm;
        min-height: 297mm;
        margin: 10mm auto;
        background: #ffffff;
        padding: 15mm 18mm;
        box-shadow: 0 4px 20px rgba(0,0,0,0.12);
      }

      /* ── HEADER ── */
      .header {
        text-align: center;
        margin-bottom: 10px;
        padding-bottom: 8px;
        border-bottom: 1.5px solid #1a1a1a;
      }
      .header h1 {
        font-size: 22pt;
        font-weight: 700;
        letter-spacing: 0.5px;
        color: #000;
        text-transform: uppercase;
      }
      .header .contacts {
        font-size: 9.5pt;
        color: #333;
        margin-top: 4px;
        line-height: 1.6;
      }
      .header .contacts a {
        color: #333;
        text-decoration: none;
      }

      /* ── SECTION HEADINGS ── */
      section {
        margin-top: 10px;
      }
      h2 {
        font-size: 10.5pt;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #1a237e;
        border-bottom: 1.5px solid #1a237e;
        padding-bottom: 2px;
        margin-bottom: 7px;
      }

      /* ── SUMMARY ── */
      .summary-text {
        font-size: 10pt;
        line-height: 1.6;
        color: #222;
        text-align: justify;
      }

      /* ── SKILLS ── */
      .skills-block {
        font-size: 10pt;
        line-height: 1.7;
      }
      .skills-block p {
        margin-bottom: 2px;
      }
      .skills-block strong {
        color: #000;
      }

      /* ── ITEM (experience / projects) ── */
      .item {
        margin-bottom: 9px;
      }
      .item-head {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
      }
      .item-role {
        font-weight: 700;
        font-size: 10.5pt;
        color: #000;
      }
      .item-company {
        font-size: 10pt;
        color: #333;
        font-style: italic;
      }
      .item-location-date {
        font-size: 10pt;
        color: #333;
        font-style: italic;
        white-space: nowrap;
        text-align: right;
      }
      ul {
        margin: 4px 0 0 18px;
        padding: 0;
      }
      li {
        font-size: 10pt;
        margin-bottom: 3px;
        line-height: 1.5;
      }

      /* ── EDUCATION ── */
      .edu-school {
        font-weight: 700;
        font-size: 10.5pt;
        color: #000;
      }
      .edu-degree {
        font-size: 10pt;
        color: #1a237e;
        font-style: italic;
        margin-top: 1px;
      }
      .edu-year {
        font-size: 10pt;
        color: #333;
        font-style: italic;
        white-space: nowrap;
      }

      /* ── CERTIFICATIONS / ACHIEVEMENTS ── */
      .plain-list {
        margin: 4px 0 0 18px;
        padding: 0;
      }
      .plain-list li {
        font-size: 10pt;
        margin-bottom: 3px;
      }

      /* ── PRINT ── */
      @page { size: A4; margin: 0; }
      @media print {
        body { background: #fff; }
        .page { margin: 0; box-shadow: none; padding: 12mm 15mm; }
      }
    </style>
  </head>
  <body>
    <main class="page">

      <!-- HEADER -->
      <header class="header">
        <h1>${safeText(data.name)}</h1>
        <div class="contacts">${contacts.map(safeText).join(" &nbsp;|&nbsp; ")}</div>
      </header>

      <!-- PROFESSIONAL SUMMARY -->
      ${data.summary ? `
      <section>
        <h2>Professional Summary</h2>
        <p class="summary-text">${safeText(data.summary)}</p>
      </section>` : ""}

      <!-- TECHNICAL SKILLS -->
      ${data.skills.length ? `
      <section>
        <h2>Technical Skills</h2>
        <div class="skills-block">
          <p>${data.skills.map(s => safeText(s)).join(", ")}</p>
        </div>
      </section>` : ""}

      <!-- PROFESSIONAL EXPERIENCE -->
      ${data.experience.length ? `
      <section>
        <h2>Professional Experience</h2>
        ${data.experience.map((item) => `
        <div class="item">
          <div class="item-head">
            <span class="item-role">${safeText(item.role || "")}</span>
            <span class="item-location-date">${safeText(item.duration || "")}</span>
          </div>
          ${item.company ? `<div class="item-company">${safeText(item.company)}</div>` : ""}
          ${Array.isArray(item.bullets) && item.bullets.length ? `
          <ul>
            ${item.bullets.map(b => `<li>${safeText(b)}</li>`).join("")}
          </ul>` : ""}
        </div>`).join("")}
      </section>` : ""}

      <!-- KEY PROJECTS -->
      ${data.projects.length ? `
      <section>
        <h2>Key Projects</h2>
        ${data.projects.map((item) => `
        <div class="item">
          <div class="item-head">
            <span class="item-role">${safeText(item.name || "Project")}${item.techStack ? `<span style="font-weight:400; font-size:9.5pt; color:#555; margin-left:6px;">| ${safeText(item.techStack)}</span>` : ""}</span>
            <span class="item-location-date">${item.demoUrl ? `<a href="${safeText(item.demoUrl)}" style="color:#1a237e;text-decoration:none;margin-right:8px;">Live Demo</a>` : ""}${item.githubUrl ? `<a href="${safeText(item.githubUrl)}" style="color:#1a237e;text-decoration:none;">GitHub Repository</a>` : ""}</span>
          </div>
          ${item.description ? `<ul><li>${safeText(item.description)}</li></ul>` : ""}
        </div>`).join("")}
      </section>` : ""}

      <!-- EDUCATION -->
      ${data.education.length ? `
      <section>
        <h2>Education</h2>
        ${data.education.map((item) => `
        <div class="item">
          <div class="item-head">
            <span class="edu-school">${safeText(item.degree || "Degree")}</span>
            <span class="edu-year">${safeText(item.year || "")}</span>
          </div>
          ${item.school ? `<div class="edu-degree">${safeText(item.school)}</div>` : ""}
          ${Array.isArray(item.bullets) && item.bullets.length ? `
          <ul>
            ${item.bullets.map(b => `<li>${safeText(b)}</li>`).join("")}
          </ul>` : ""}
        </div>`).join("")}
      </section>` : ""}

      <!-- CERTIFICATIONS -->
      ${data.certifications && data.certifications.length ? `
      <section>
        <h2>Certifications</h2>
        <ul class="plain-list">
          ${data.certifications.map(c => `<li>${safeText(c)}</li>`).join("")}
        </ul>
      </section>` : ""}

      <!-- KEY ACHIEVEMENTS -->
      ${data.achievements && data.achievements.length ? `
      <section>
        <h2>Key Achievements</h2>
        <ul class="plain-list">
          ${data.achievements.map(a => `<li>${safeText(a)}</li>`).join("")}
        </ul>
      </section>` : ""}

    </main>
  </body>
</html>
`
}

module.exports = { buildResumeHtml }
