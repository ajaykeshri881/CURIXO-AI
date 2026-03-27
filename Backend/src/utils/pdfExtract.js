const { getDocument } = require("pdfjs-dist/legacy/build/pdf.mjs");

/**
 * Extract text from a PDF buffer using the modern pdfjs-dist library.
 * This replaces the old `pdf-parse` package which used PDF.js v1.10
 * and could not handle many modern PDF files ("bad XRef entry" errors).
 *
 * @param {Buffer} buffer - The raw PDF file buffer
 * @returns {Promise<string>} - The extracted plain text
 */
async function extractTextFromPdf(buffer) {
    const uint8 = new Uint8Array(buffer);
    const doc = await getDocument({ data: uint8, useSystemFonts: true }).promise;

    const pages = [];
    for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((item) => item.str);
        pages.push(strings.join(" "));
    }

    return pages.join("\n");
}

module.exports = { extractTextFromPdf };
