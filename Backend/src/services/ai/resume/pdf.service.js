const puppeteer = require("puppeteer")

async function generateResumePdfFromHtml(resumeHtml) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    try {
        const page = await browser.newPage()

        // If the HTML doesn't contain a full document structure, wrap it
        let fullHtml = resumeHtml
        const lowerHtml = resumeHtml.toLowerCase().trim()
        if (!lowerHtml.startsWith('<!doctype') && !lowerHtml.startsWith('<html')) {
            fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8">
              <style>body{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;padding:40px;color:#111;line-height:1.6;}</style>
            </head><body>${resumeHtml}</body></html>`
        }

        await page.setContent(fullHtml, { waitUntil: "load", timeout: 15000 })

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
