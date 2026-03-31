const { z } = require("zod")

const emailSchema = z
    .string()
    .trim()
    .email("invalid email address")
    .transform((value) => value.toLowerCase())

const registerSchema = z.object({
    name: z.string().trim().min(2, "name must be at least 2 characters").max(60),
    email: emailSchema,
    password: z
        .string()
        .min(8, "password must be at least 8 characters")
        .max(128)
})

const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, "password is required")
})

module.exports = {
    registerSchema,
    loginSchema
}