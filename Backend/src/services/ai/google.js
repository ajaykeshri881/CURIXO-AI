const { GoogleGenerativeAI } = require("@google/generative-ai");

const modelName = "gemini-3-flash-preview"; // Primary model

// Fallback chain: if primary model is overloaded, cascade to next
const MODEL_FALLBACK_CHAIN = [
    "gemini-3-flash-preview",
    "gemini-3.1-pro-preview",
    "gemini-3.1-flash-lite-preview",
]

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
 * Try a single model across all API keys (round-robin).
 * Returns the text on success, or null if all keys fail.
 */
async function tryModelAcrossKeys(prompt, model) {
    const totalKeys = clients.length
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

            console.log(`✅ Gemini response OK — model: ${model}, key #${keyIndex + 1}/${totalKeys}`)
            return { text, error: null }
        } catch (error) {
            lastError = error
            const status = error?.status || error?.code || "unknown"
            console.warn(`⚠️  [${model}] key #${keyIndex + 1}/${totalKeys} failed (${status}). ${attempt + 1 < totalKeys ? "Trying next key..." : "All keys exhausted for this model."}`)
        }
    }

    return { text: null, error: lastError }
}

/**
 * Generate content with automatic API key + model failover.
 *
 * Strategy:
 *  1. gemini-3-flash-preview  (try all API keys)
 *  2. gemini-3.1-pro-preview  (try all API keys)
 *  3. gemini-3.1-flash-lite-preview (try all API keys)
 *
 * Throws only if ALL models × ALL keys fail.
 *
 * @param {string} prompt - The prompt to send to Gemini
 * @param {object} [options] - Optional config
 * @param {string} [options.model] - Override primary model (still uses fallback chain)
 * @returns {Promise<string>} - The generated text response
 */
async function generateWithFailover(prompt, options = {}) {
    const totalKeys = clients.length

    if (totalKeys === 0) {
        throw new Error("No Gemini API keys configured. Set GOOGLE_GENAI_API_KEY in .env")
    }

    // Build the fallback chain — if a custom model is passed, put it first
    const primaryModel = options.model || modelName
    const chain = [primaryModel, ...MODEL_FALLBACK_CHAIN.filter(m => m !== primaryModel)]

    let lastError = null

    for (const model of chain) {
        console.log(`🔄 Attempting model: ${model}`)
        const { text, error } = await tryModelAcrossKeys(prompt, model)

        if (text !== null) {
            return text
        }

        lastError = error
        console.warn(`❌ Model ${model} failed across all ${totalKeys} key(s). Falling back to next model...`)
    }

    // All models × all keys failed
    throw new Error(
        `All models exhausted (${chain.join(" → ")}), each tried across ${totalKeys} API key(s). ` +
        `Last error: ${lastError?.message || lastError}`
    )
}

module.exports = { generateWithFailover, modelName }
