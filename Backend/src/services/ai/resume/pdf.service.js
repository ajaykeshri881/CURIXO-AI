const puppeteer = require("puppeteer")

function sanitizeHtmlForPdf(html) {
    if (!html || typeof html !== "string") return ""

    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/\s(?:src|href)=(['"])(?:chrome-extension|moz-extension|safari-web-extension):[^'"]*\1/gi, "")
        .replace(/\scontenteditable=(['"]?)(true|false)\1/gi, "")
}

async function generateResumePdfFromHtml(resumeHtml) {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--font-render-hinting=medium'
        ]
    })
    try {
        const page = await browser.newPage()

        // Allow more time for large, styled resumes to render.
        page.setDefaultNavigationTimeout(45000)
        page.setDefaultTimeout(45000)

        // If the HTML doesn't contain a full document structure, wrap it
        const cleanedHtml = sanitizeHtmlForPdf(resumeHtml)
        let fullHtml = cleanedHtml
        const lowerHtml = cleanedHtml.toLowerCase().trim()
        if (!lowerHtml.startsWith('<!doctype') && !lowerHtml.startsWith('<html')) {
            fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8">
              <style>body{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;padding:40px;color:#111;line-height:1.6;}</style>
            </head><body>${cleanedHtml}</body></html>`
        }

        await page.setContent(fullHtml, { waitUntil: "domcontentloaded", timeout: 45000 })
        await page.emulateMediaType('screen')

        const pdfUint8 = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: { top: '30px', right: '30px', bottom: '30px', left: '30px' }
        })

        // CRITICAL: Convert Uint8Array to Node.js Buffer for Express compatibility
        return Buffer.from(pdfUint8)
    } finally {
        await browser.close()
    }
}

module.exports = { generateResumePdfFromHtml }
