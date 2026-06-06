import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const resourceSchema = z.object({
  id: z.string().cuid(),
  title: z.string(),
  description: z.string(),
  type: z.enum(["VIDEO", "ARTICLE"]),
  category: z.string(),
  videoUrl: z.string().url().nullable(),
  content: z.string().nullable(),
  featured: z.boolean(),
  published: z.boolean(),
  views: z.number().int().min(0),
  order: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export class ResourceDto extends createZodDto(resourceSchema) {}
