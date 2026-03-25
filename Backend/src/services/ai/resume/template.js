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
      :root {
        --text: #1f2937;
        --muted: #6b7280;
        --line: #e5e7eb;
        --heading: #111827;
        --accent: #0f766e;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        color: var(--text);
        background: #f8fafc;
      }
      .page {
        width: 210mm;
        min-height: 297mm;
        margin: 12mm auto;
        background: #ffffff;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        padding: 16mm;
      }
      .header {
        border-bottom: 2px solid var(--line);
        padding-bottom: 10px;
        margin-bottom: 14px;
      }
      h1 {
        margin: 0;
        font-size: 28px;
        color: var(--heading);
      }
      .title {
        margin-top: 4px;
        font-size: 14px;
        color: var(--accent);
        font-weight: 600;
      }
      .contacts {
        margin-top: 8px;
        font-size: 11px;
        color: var(--muted);
        line-height: 1.6;
      }
      section { margin-top: 12px; }
      h2 {
        margin: 0 0 6px;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--heading);
      }
      p {
        margin: 0;
        line-height: 1.5;
        font-size: 12px;
      }
      .skills {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .chip {
        border: 1px solid var(--line);
        border-radius: 999px;
        padding: 2px 8px;
        font-size: 11px;
      }
      .item {
        margin-bottom: 10px;
      }
      .item-head {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: baseline;
        font-size: 12px;
      }
      .item-title { font-weight: 700; }
      .item-meta { color: var(--muted); font-size: 11px; }
      ul {
        margin: 6px 0 0 16px;
        padding: 0;
      }
      li {
        margin-bottom: 4px;
        font-size: 12px;
        line-height: 1.45;
      }
      @page {
        size: A4;
        margin: 10mm;
      }
      @media print {
        body { background: #fff; }
        .page {
          margin: 0;
          box-shadow: none;
          width: auto;
          min-height: auto;
          padding: 0;
        }
      }
    </style>
  </head>
  <body>
    <main class="page">
      <header class="header">
        <h1>${safeText(data.name)}</h1>
        <div class="title">${safeText(data.title)}</div>
        <div class="contacts">${contacts.map(safeText).join(" | ")}</div>
      </header>

      ${data.summary ? `<section><h2>Professional Summary</h2><p>${safeText(data.summary)}</p></section>` : ""}

      ${data.skills.length ? `<section><h2>Skills</h2><div class="skills">${data.skills.map((skill) => `<span class="chip">${safeText(skill)}</span>`).join("")}</div></section>` : ""}

      ${data.experience.length ? `<section><h2>Work Experience</h2>${data.experience.map((item) => `
            <div class="item">
              <div class="item-head">
                <span class="item-title">${safeText(item.role || "")}${item.company ? `, ${safeText(item.company)}` : ""}</span>
                <span class="item-meta">${safeText(item.duration || "")}</span>
              </div>
              <ul>
                ${(Array.isArray(item.bullets) ? item.bullets : []).map((bullet) => `<li>${safeText(bullet)}</li>`).join("")}
              </ul>
            </div>
          `).join("")}</section>` : ""}

      ${data.education.length ? `<section><h2>Education</h2>${data.education.map((item) => `
            <div class="item">
              <div class="item-head">
                <span class="item-title">${safeText(item.degree || "")}${item.school ? `, ${safeText(item.school)}` : ""}</span>
                <span class="item-meta">${safeText(item.year || "")}</span>
              </div>
            </div>
          `).join("")}</section>` : ""}

      ${data.projects.length ? `<section><h2>Projects</h2>${data.projects.map((item) => `
            <div class="item">
              <div class="item-head"><span class="item-title">${safeText(item.name || "Project")}</span></div>
              <p>${safeText(item.description || "")}</p>
              ${item.techStack ? `<p class="item-meta">Tech: ${safeText(item.techStack)}</p>` : ""}
            </div>
          `).join("")}</section>` : ""}
    </main>
  </body>
</html>
`
}

module.exports = { buildResumeHtml }
