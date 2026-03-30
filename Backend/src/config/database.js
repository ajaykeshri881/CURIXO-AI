const mongoose = require('mongoose');

const DEFAULT_MAX_RETRIES = 10;
const DEFAULT_RETRY_BASE_MS = 2000;
const DEFAULT_RETRY_MAX_MS = 30000;

function parsePositiveNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function getRetryDelayMs(attempt, baseDelayMs, maxDelayMs) {
    const exponentialDelay = baseDelayMs * Math.pow(2, attempt - 1);
    return Math.min(exponentialDelay, maxDelayMs);
}

async function connectToDB() {
    const mongoUri = process.env.MONGO_URI;
    const maxRetries = parsePositiveNumber(process.env.DB_CONNECT_MAX_RETRIES, DEFAULT_MAX_RETRIES);
    const retryBaseMs = parsePositiveNumber(process.env.DB_CONNECT_RETRY_BASE_MS, DEFAULT_RETRY_BASE_MS);
    const retryMaxMs = parsePositiveNumber(process.env.DB_CONNECT_RETRY_MAX_MS, DEFAULT_RETRY_MAX_MS);

    if (!mongoUri) {
        throw new Error('MONGO_URI is not set.');
    }

    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
        try {
            await mongoose.connect(mongoUri);
            console.log('MongoDB connected successfully');
            return;
        } catch (error) {
            lastError = error;
            const isLastAttempt = attempt === maxRetries;
            const retryDelayMs = getRetryDelayMs(attempt, retryBaseMs, retryMaxMs);

            console.error(`Database connection attempt ${attempt}/${maxRetries} failed: ${error.message}`);

            if (isLastAttempt) {
                break;
            }

            console.log(`Retrying database connection in ${Math.ceil(retryDelayMs / 1000)} second(s)...`);
            await sleep(retryDelayMs);
        }
    }

    throw lastError || new Error('Unable to connect to MongoDB.');
}

module.exports = connectToDB;