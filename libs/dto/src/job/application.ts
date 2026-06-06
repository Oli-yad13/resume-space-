import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const applicationStatusSchema = z.enum([
  "PENDING",
  "REVIEWED",
  "SHORTLISTED",
  "INTERVIEWED",
  "OFFERED",
  "REJECTED",
  "WITHDRAWN",
  "ACCEPTED",
]);

export const applicationSchema = z.object({
  id: z.string().cuid(),
  jobId: z.string().cuid(),
  userId: z.string().cuid(),
  resumeUrl: z.string().url().nullable().optional(),
  coverLetter: z.string().nullable().optional(),
  status: applicationStatusSchema,
  notes: z.string().nullable().optional(),
  appliedAt: z.date(),
  updatedAt: z.date(),
});

export const createApplicationSchema = z.object({
  jobId: z.string().cuid().optional(), // Optional in body since it comes from URL param
  resumeUrl: z.literal("").or(z.string().url()).or(z.null()).optional().nullable(),
  coverLetter: z.literal("").or(z.string().max(2000)).or(z.null()).optional().nullable(),
});

export const updateApplicationStatusSchema = z.object({
  status: applicationStatusSchema,
  notes: z.string().max(1000).optional().nullable(),
});

export class ApplicationDto extends createZodDto(applicationSchema) {}
export class CreateApplicationDto extends createZodDto(createApplicationSchema) {}
export class UpdateApplicationStatusDto extends createZodDto(updateApplicationStatusSchema) {}

