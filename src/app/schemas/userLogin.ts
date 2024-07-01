import { z } from "zod";

export const userLoginSchema = z.object({
  identifier: z
    .string()
    .min(3, { message: "Please enter a valid identifier." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 character long" }),
});
