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
    },

    password: {
        type: String,
        required: true
    },

    tokenVersion: {
        type: Number,
        default: 0
    }
})

const userModel = mongoose.model("users", userSchema)

module.exports = userModel