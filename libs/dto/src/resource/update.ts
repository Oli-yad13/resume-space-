import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const updateResourceSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(500).optional(),
  type: z.enum(["VIDEO", "ARTICLE"]).optional(),
  category: z.string().min(2).max(100).optional(),
  videoUrl: z.string().url().nullable().optional(),
  content: z.string().nullable().optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  order: z.number().int().optional(),
});

export class UpdateResourceDto extends createZodDto(updateResourceSchema) {}

