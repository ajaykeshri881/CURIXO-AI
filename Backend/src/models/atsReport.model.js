const mongoose = require('mongoose');

const atsReportSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
        default: null,
    },
    jobTitle: {
        type: String,
        required: true,
    },
    jobDescription: {
        type: String,
        required: true,
    },
    resumeText: {
        type: String,
        required: true,
    },
    report: {
        score: Number,
        strengths: String,
        weaknesses: String,
        missingKeywords: [String],
        suggestions: String,
    },
}, { timestamps: true });

const AtsReport = mongoose.model('AtsReport', atsReportSchema);

module.exports = AtsReport;
