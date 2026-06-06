import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { locationTypeSchema, employmentTypeSchema, experienceLevelSchema } from "./job";

export const createJobSchema = z.object({
  title: z.string().min(3).max(200),
  company: z.string().min(2).max(100),
  companyLogo: z.string().url().optional().nullable(),
  location: z.string().min(2).max(200),
  locationType: locationTypeSchema,
  employmentType: employmentTypeSchema,
  description: z.string().min(50),
  requirements: z.string().optional().nullable(),
  responsibilities: z.string().optional().nullable(),
  salaryMin: z.number().int().positive().optional().nullable(),
  salaryMax: z.number().int().positive().optional().nullable(),
  salaryCurrency: z.string().default("ETB"),
  category: z.string().min(2).max(100),
  tags: z.array(z.string()).default([]),
  experienceLevel: experienceLevelSchema,
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  expiresAt: z.string().datetime().optional().nullable(),
});

export class CreateJobDto extends createZodDto(createJobSchema) {}

