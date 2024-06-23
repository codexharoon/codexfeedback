import { z } from "zod";

export const userLoginSchema = z.object({
  identifier: z.string(),
  password: z.string(),
});
