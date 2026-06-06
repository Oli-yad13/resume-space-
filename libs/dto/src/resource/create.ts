import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const createResourceSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(500),
  type: z.enum(["VIDEO", "ARTICLE"]),
  category: z.string().min(2).max(100),
  videoUrl: z.string().url().optional().nullable(),
  content: z.string().optional().nullable(),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  order: z.number().int().default(0),
});

export class CreateResourceDto extends createZodDto(createResourceSchema) {}

