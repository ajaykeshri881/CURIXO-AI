const multer = require("multer")

const allowedMimeTypes = ["application/pdf"]

function resumeFileFilter(_req, file, cb) {
    if (allowedMimeTypes.includes(file.mimetype)) {
        return cb(null, true)
    }

    return cb(new Error("Only PDF resume files are allowed."), false)
}

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 3 * 1024 * 1024 // 3MB
    },
    fileFilter: resumeFileFilter
})


module.exports = upload