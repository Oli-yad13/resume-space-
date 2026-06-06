import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const locationTypeSchema = z.enum(["REMOTE", "ONSITE", "HYBRID"]);
export const employmentTypeSchema = z.enum([
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
  "FREELANCE",
]);
export const experienceLevelSchema = z.enum([
  "ENTRY",
  "JUNIOR",
  "MID_LEVEL",
  "SENIOR",
  "LEAD",
  "EXECUTIVE",
]);

export const jobSchema = z.object({
  id: z.string().cuid(),
  title: z.string(),
  company: z.string(),
  companyLogo: z.string().url().nullable().optional(),
  location: z.string(),
  locationType: locationTypeSchema,
  employmentType: employmentTypeSchema,
  description: z.string(),
  requirements: z.string().nullable().optional(),
  responsibilities: z.string().nullable().optional(),
  salaryMin: z.number().int().positive().nullable().optional(),
  salaryMax: z.number().int().positive().nullable().optional(),
  salaryCurrency: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  experienceLevel: experienceLevelSchema,
  featured: z.boolean(),
  published: z.boolean(),
  expiresAt: z.date().nullable().optional(),
  views: z.number().int().min(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export class JobDto extends createZodDto(jobSchema) {}

