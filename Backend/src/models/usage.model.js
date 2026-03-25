const mongoose = require("mongoose")

const usageSchema = new mongoose.Schema(
    {
        feature: {
            type: String,
            required: true,
            trim: true
        },
        dateKey: {
            type: String,
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        guestKey: {
            type: String,
            default: null,
            trim: true
        },
        count: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    { timestamps: true }
)

usageSchema.index({ feature: 1, dateKey: 1, user: 1 }, { unique: true, partialFilterExpression: { user: { $type: "objectId" } } })
usageSchema.index({ feature: 1, dateKey: 1, guestKey: 1 }, { unique: true, partialFilterExpression: { guestKey: { $type: "string" } } })

module.exports = mongoose.model("Usage", usageSchema)
