import { idSchema } from "@resume-space/schema";
import { z } from "zod";

export const payloadSchema = z.object({
  id: idSchema,
  isTwoFactorAuth: z.boolean().optional(),
});

export type Payload = z.infer<typeof payloadSchema>;
