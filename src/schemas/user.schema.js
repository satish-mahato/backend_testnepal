const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(3, "Password must be at least 3 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const passwordSchema = z.object({
  oldPassword: z.string().min(1, "Password is required"),
  newPassword: z.string().min(1, "Password is required"),
});

const updateProfileSchema = z
  .object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    password: z.string().min(3).optional(),
  })
  .refine((data) => data.name || data.email || data.password, {
    message: "At least one field must be provided",
    path: ["name", "email", "password"],
  });

module.exports = {
  registerSchema,
  loginSchema,
  passwordSchema,
  updateProfileSchema
};