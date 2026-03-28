const mongoose = require('mongoose')


const blacklistTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [ true, "token is required to be added in blacklist" ]
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 345600 // auto-delete after 4 days (4 × 24 × 60 × 60 = 345600 seconds)
    }
})

const tokenBlacklistModel = mongoose.model("blacklistTokens", blacklistTokenSchema)


module.exports = tokenBlacklistModel