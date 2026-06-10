import { createZodDto } from "nestjs-zod";
import { z } from "zod";

// Super-admin review verdict for org-posted jobs and resources.
export const reviewPostSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  reviewNote: z.string().max(2000).optional(),
});

export class ReviewPostDto extends createZodDto(reviewPostSchema) {}
