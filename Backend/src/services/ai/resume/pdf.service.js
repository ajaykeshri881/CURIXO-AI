const puppeteer = require("puppeteer")

const A4_WIDTH_PX = 794
const A4_HEIGHT_PX = 1123
const RENDER_TIMEOUT_MS = 45000

const CHROMIUM_ARGS = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--font-render-hinting=none",
    `--window-size=${A4_WIDTH_PX},${A4_HEIGHT_PX}`,
]

if (process.platform === "linux") {
    CHROMIUM_ARGS.push("--no-zygote", "--single-process")
}

function sanitizeHtmlForPdf(html) {
    if (!html || typeof html !== "string") return ""
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
        .replace(/<link\b[^>]*href=(['"])\s*https?:[^'"]*\1[^>]*>/gi, "")
        .replace(/\s(?:src|href)=(['"])(?:chrome-extension|moz-extension|safari-web-extension):[^'"]*\1/gi, "")
        .replace(/\s(?:src|href)=(['"])\s*javascript:[^'"]*\1/gi, "")
        .replace(/\scontenteditable=(['"]?)(true|false)\1/gi, "")
}

function getLaunchConfigs() {
    const baseConfig = {
        args: CHROMIUM_ARGS,
        ignoreHTTPSErrors: true,
        timeout: RENDER_TIMEOUT_MS,
        protocolTimeout: 120000,
    }

    const rawPaths = [
        process.env.PUPPETEER_EXECUTABLE_PATH,
        process.env.CHROME_BIN,
        process.env.GOOGLE_CHROME_BIN,
    ].filter(Boolean)

    try {
        if (typeof puppeteer.executablePath === "function") {
            const bundledPath = puppeteer.executablePath()
            if (bundledPath) rawPaths.push(bundledPath)
        }
    } catch (_) {
        // No bundled browser path available, continue with default launch lookup.
    }

    const uniquePaths = Array.from(new Set(rawPaths.map(path => String(path).trim()).filter(Boolean)))
    const configs = []
    const headlessModes = ["new", true]

    uniquePaths.forEach((executablePath) => {
        headlessModes.forEach((headless) => {
            configs.push({ ...baseConfig, executablePath, headless })
        })
    })

    headlessModes.forEach((headless) => {
        configs.push({ ...baseConfig, headless })
    })

    return configs
}

async function launchBrowserWithFallback() {
    const launchErrors = []
    const launchConfigs = getLaunchConfigs()

    for (const launchConfig of launchConfigs) {
        try {
            return await puppeteer.launch(launchConfig)
        } catch (error) {
            launchErrors.push(error)
        }
    }

    const summarized = launchErrors
        .slice(0, 3)
        .map((error, index) => `${index + 1}) ${error?.message || "Unknown browser launch error"}`)
        .join(" | ")

    const launchError = new Error(
        `Failed to launch PDF browser. ${summarized || "No browser executable could be started."}`
    )
    launchError.code = "PDF_BROWSER_LAUNCH_FAILED"
    throw launchError
}

function toFullHtmlDocument(cleanedHtml) {
    let fullHtml = cleanedHtml
    const lowerHtml = cleanedHtml.toLowerCase().trim()

    if (!lowerHtml.startsWith("<!doctype") && !lowerHtml.startsWith("<html")) {
        fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8">
          <style>body{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;padding:36px;color:#111;line-height:1.6;}</style>
        </head><body>${cleanedHtml}</body></html>`
    }

    return fullHtml
}

async function safeClose(target) {
    if (!target) return
    try {
        await target.close()
    } catch (_) {
        // Ignore close errors to preserve original failure reason.
    }
}

async function generateResumePdfFromHtml(resumeHtml) {
    const cleanedHtml = sanitizeHtmlForPdf(resumeHtml)
    if (!cleanedHtml.trim()) {
        const validationError = new Error("resumeHtml must contain printable HTML content.")
        validationError.code = "PDF_INVALID_HTML"
        throw validationError
    }

    const browser = await launchBrowserWithFallback()
    let page = null

    try {
        page = await browser.newPage()

        await page.setRequestInterception(true)
        page.on("request", (request) => {
            const url = String(request.url() || "")

            if (
                url.startsWith("data:") ||
                url.startsWith("blob:") ||
                url.startsWith("about:") ||
                url.startsWith("file:")
            ) {
                return request.continue()
            }

            if (/^https?:/i.test(url)) {
                return request.abort()
            }

            return request.continue()
        })

        // Set viewport to exact A4 dimensions so there is no extra chrome-window space
        await page.setViewport({ width: A4_WIDTH_PX, height: A4_HEIGHT_PX, deviceScaleFactor: 1 })

        page.setDefaultNavigationTimeout(RENDER_TIMEOUT_MS)
        page.setDefaultTimeout(RENDER_TIMEOUT_MS)

        const fullHtml = toFullHtmlDocument(cleanedHtml)

        // Use print media so @media print rules apply (removes body background, page margins etc.)
        await page.emulateMediaType("print")

        await page.setContent(fullHtml, { waitUntil: "domcontentloaded", timeout: RENDER_TIMEOUT_MS })

        await page.evaluate(async () => {
            if (document.fonts && document.fonts.ready) {
                try {
                    await document.fonts.ready
                } catch (_) {
                    // Ignore font readiness errors and continue PDF rendering.
                }
            }
        })

        // Wait a tick for any CSS transitions / font rendering to settle
        await new Promise(r => setTimeout(r, 300))

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,    // render background colours & gradients
            preferCSSPageSize: true,  // respect @page { size: A4; margin: 0 } in CSS
            margin: { top: "0", right: "0", bottom: "0", left: "0" },
            timeout: RENDER_TIMEOUT_MS,
        })

        return Buffer.from(pdfBuffer)
    } finally {
        await safeClose(page)
        await safeClose(browser)
    }
}

module.exports = { generateResumePdfFromHtml }
