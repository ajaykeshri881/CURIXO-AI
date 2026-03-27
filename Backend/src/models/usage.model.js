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

        // ─── Guest identifier – IP address (null for logged-in users) ───
        guestKey: {
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

module.exports = mongoose.model("Usage", usageSchema)
