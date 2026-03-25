const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);
const modelName = "gemini-3-flash-preview"; // Centralized model name

module.exports = { genAI, modelName };
