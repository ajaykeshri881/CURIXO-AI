const puppeteer = require("puppeteer")

function sanitizeHtmlForPdf(html) {
    if (!html || typeof html !== "string") return ""
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/\s(?:src|href)=(['"])(?:chrome-extension|moz-extension|safari-web-extension):[^'"]*\1/gi, "")
        .replace(/\scontenteditable=(['"]?)(true|false)\1/gi, "")
}

async function generateResumePdfFromHtml(resumeHtml) {
    // A4 at 96 dpi = 794 x 1123 px
    const A4_WIDTH_PX  = 794
    const A4_HEIGHT_PX = 1123

    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            `--window-size=${A4_WIDTH_PX},${A4_HEIGHT_PX}`,
        ],
    })

    try {
        const page = await browser.newPage()

        // Set viewport to exact A4 dimensions so there is no extra chrome-window space
        await page.setViewport({ width: A4_WIDTH_PX, height: A4_HEIGHT_PX, deviceScaleFactor: 2 })

        page.setDefaultNavigationTimeout(60000)
        page.setDefaultTimeout(60000)

        const cleanedHtml = sanitizeHtmlForPdf(resumeHtml)
        let fullHtml = cleanedHtml
        const lowerHtml = cleanedHtml.toLowerCase().trim()
        if (!lowerHtml.startsWith("<!doctype") && !lowerHtml.startsWith("<html")) {
            fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8">
              <style>body{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;padding:36px;color:#111;line-height:1.6;}</style>
            </head><body>${cleanedHtml}</body></html>`
        }

        // Use print media so @media print rules apply (removes body background, page margins etc.)
        await page.emulateMediaType("print")

        await page.setContent(fullHtml, { waitUntil: "networkidle0", timeout: 60000 })

        // Wait a tick for any CSS transitions / font rendering to settle
        await new Promise(r => setTimeout(r, 300))

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,    // render background colours & gradients
            preferCSSPageSize: true,  // respect @page { size: A4; margin: 0 } in CSS
            margin: { top: "0", right: "0", bottom: "0", left: "0" },
        })

        return Buffer.from(pdfBuffer)
    } finally {
        await browser.close()
    }
}

module.exports = { generateResumePdfFromHtml }
