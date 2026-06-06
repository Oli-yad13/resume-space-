import { idSchema } from "@resume-space/schema";
import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const deleteResumeSchema = z.object({
  id: idSchema,
});

export class DeleteResumeDto extends createZodDto(deleteResumeSchema) {}
