import { createZodDto } from "nestjs-zod";
import { createJobSchema } from "./create";

export const updateJobSchema = createJobSchema.partial();

export class UpdateJobDto extends createZodDto(updateJobSchema) {}

