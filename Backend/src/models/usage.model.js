const mongoose = require("mongoose")

const usageSchema = new mongoose.Schema(
    {
        // ─── Which feature was used ───
        feature: {
            type: String,
            required: true,
            trim: true,
            enum: ["ats_check", "interview_prep", "resume_build"]
        },

        // ─── Date key for daily tracking (YYYY-MM-DD in IST) ───
        dateKey: {
            type: String,
            required: true
        },

        // ─── Registered user (null for guests) ───
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            default: null
        },

        // ─── Guest cookie identifier (null for logged-in users) ───
        guestKey: {
            type: String,
            default: null,
            trim: true
        },

        // ─── Guest network/browser fingerprint hash (null for logged-in users) ───
        anonFingerprint: {
            type: String,
            default: null,
            trim: true
        },

        // ─── How many times this feature was used today ───
        count: {
            type: Number,
            default: 0,
            min: 0
        },

        // ─── Daily limit for this feature (stored for DB readability e.g. "2/3") ───
        limit: {
            type: Number,
            default: 3,
            min: 1
        },

        // ─── Human-readable usage string e.g. "2/3" ───
        usageDisplay: {
            type: String,
            default: "0/3"
        },
        // ─── TTL: auto-delete this record after the IST day has ended ───
        // Midnight IST = 18:30 UTC of the same UTC day (IST is UTC+5:30)
        // Strategy: shift now to IST, find next IST calendar day midnight, convert back to UTC
        expiresAt: {
            type: Date,
            default: () => {
                const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // 5h 30m in milliseconds
                const now = new Date();
                // Represent current moment as an IST "clock time" using UTC getters
                const nowIST = new Date(now.getTime() + IST_OFFSET_MS);
                // Compute midnight of NEXT IST calendar day as a raw UTC timestamp,
                // then subtract the IST offset to get the real UTC equivalent
                const nextMidnightIST_UTC = new Date(
                    Date.UTC(
                        nowIST.getUTCFullYear(),
                        nowIST.getUTCMonth(),
                        nowIST.getUTCDate() + 1, // next IST calendar day
                        0, 0, 0, 0
                    ) - IST_OFFSET_MS // convert IST midnight -> UTC
                );
                return nextMidnightIST_UTC;
            }
        }
    },
    { timestamps: true }
)

// ─── Compound unique indexes ───
// One record per user + feature + day
usageSchema.index(
    { feature: 1, dateKey: 1, user: 1 },
    { unique: true, partialFilterExpression: { user: { $type: "objectId" } } }
)

// One record per guest + feature + day
usageSchema.index(
    { feature: 1, dateKey: 1, guestKey: 1 },
    { unique: true, partialFilterExpression: { guestKey: { $type: "string" } } }
)

// One record per anonymous fingerprint + feature + day
usageSchema.index(
    { feature: 1, dateKey: 1, anonFingerprint: 1 },
    { unique: true, partialFilterExpression: { anonFingerprint: { $type: "string" } } }
)

// ─── TTL Index: MongoDB will auto-delete documents when expiresAt is reached ───
// expireAfterSeconds: 0 means "delete exactly at the expiresAt timestamp"
usageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

module.exports = mongoose.model("Usage", usageSchema)
