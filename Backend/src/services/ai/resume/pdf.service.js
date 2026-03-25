const puppeteer = require("puppeteer")

async function generateResumePdfFromHtml(resumeHtml) {
    const browser = await puppeteer.launch({ headless: true })
    try {
        const page = await browser.newPage()
        await page.setContent(resumeHtml, { waitUntil: "networkidle0" })
        return await page.pdf({ format: "A4", printBackground: true })
    } finally {
        await browser.close()
    }
}

module.exports = { generateResumePdfFromHtml }
