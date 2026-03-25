const { GoogleGenerativeAI } = require("@google/generative-ai");

const modelName = "gemini-3-flash-preview"; // Centralized model name

// Parse comma-separated API keys from env
const apiKeys = (process.env.GOOGLE_GENAI_API_KEY || "")
    .split(",")
    .map(k => k.trim())
    .filter(Boolean)

if (apiKeys.length === 0) {
    console.error("⚠️  No GOOGLE_GENAI_API_KEY found in environment variables!")
}

// Create a GoogleGenerativeAI client for each key
const clients = apiKeys.map(key => new GoogleGenerativeAI(key))

// Round-robin index — start requests from a different key each time
let currentIndex = 0

/**
 * Generate content with automatic API key failover.
 * Tries each key in round-robin order. If a key fails (rate limit, quota, network),
 * it moves to the next key. Throws only if ALL keys fail.
 *
 * @param {string} prompt - The prompt to send to Gemini
 * @param {object} [options] - Optional config
 * @param {string} [options.model] - Override model name
 * @returns {Promise<string>} - The generated text response
 */
async function generateWithFailover(prompt, options = {}) {
    const model = options.model || modelName
    const totalKeys = clients.length

    if (totalKeys === 0) {
        throw new Error("No Gemini API keys configured. Set GOOGLE_GENAI_API_KEY in .env")
    }

    const startIndex = currentIndex
    let lastError = null

    for (let attempt = 0; attempt < totalKeys; attempt++) {
        const keyIndex = (startIndex + attempt) % totalKeys
        const client = clients[keyIndex]

        try {
            const genModel = client.getGenerativeModel({ model })
            const result = await genModel.generateContent(prompt)
            const response = await result.response
            const text = await response.text()

            // Success — advance round-robin for next call
            currentIndex = (keyIndex + 1) % totalKeys

            console.log(`✅ Gemini response OK (key #${keyIndex + 1}/${totalKeys})`)
            return text
        } catch (error) {
            lastError = error
            const status = error?.status || error?.code || "unknown"
            console.warn(`⚠️  Gemini key #${keyIndex + 1}/${totalKeys} failed (${status}). ${attempt + 1 < totalKeys ? "Trying next key..." : "No more keys to try."}`)
        }
    }

    // All keys failed
    throw new Error(`All ${totalKeys} Gemini API keys failed. Last error: ${lastError?.message || lastError}`)
}

module.exports = { generateWithFailover, modelName }
