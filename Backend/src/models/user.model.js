const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        unique: [ true, "An account already exists with this email address." ],
        required: true,
        trim: true,
        lowercase: true,
    },

    password: {
        type: String,
        required: true
    },

    tokenVersion: {
        type: Number,
        default: 0
    },

    // ─── Per-user daily limits (override defaults) ───
    // If a field is missing / 0, the system default (3) is used.
    limits: {
        ats_check:      { type: Number, default: 3 },
        interview_prep: { type: Number, default: 3 },
        resume_build:   { type: Number, default: 3 }
    },

    // ─── User role for future admin features ───
    role: {
        type: String,
        enum: ["user", "pro", "admin"],
        default: "user"
    }
}, { timestamps: true })

const userModel = mongoose.model("users", userSchema)

module.exports = userModel