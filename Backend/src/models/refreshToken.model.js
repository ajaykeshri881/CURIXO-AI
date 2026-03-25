const mongoose = require("mongoose")

const refreshTokenSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
            index: true
        },
        token: {
            type: String,
            required: true,
            unique: true
        },
        expiresAt: {
            type: Date,
            required: true,
            index: true
        }
    },
    { timestamps: true }
)

module.exports = mongoose.model("refreshTokens", refreshTokenSchema)
