const { z } = require("zod")

const registerSchema = z.object({
    name: z.string().trim().min(2, "name must be at least 2 characters").max(60),
    email: z.string().trim().email("invalid email address"),
    password: z
        .string()
        .min(8, "password must be at least 8 characters")
        .max(128)
})

const loginSchema = z.object({
    email: z.string().trim().email("invalid email address"),
    password: z.string().min(1, "password is required")
})

module.exports = {
    registerSchema,
    loginSchema
}