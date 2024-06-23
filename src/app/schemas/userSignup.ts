import { z } from "zod";

export const userSignupSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 character long" })
    .max(20, { message: "Username must be at most 20 character long" })
    .regex(/^[a-zA-Z0-9_]*$/, {
      message: "Username must contain only letters, numbers and underscores",
    }),

  email: z.string().email({ message: "Invalid email format" }),

  password: z
    .string()
    .min(6, { message: "Password must be at least 6 character long" }),
});
