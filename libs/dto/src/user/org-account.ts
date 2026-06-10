import { createZodDto } from "nestjs-zod";
import { z } from "zod";

// Org admin accounts are provisioned by the super admin and handed to
// trusted organizations — there is no self-signup for this role.
export const createOrgAccountSchema = z.object({
  name: z.string().min(1).max(255),
  organization: z.string().min(2).max(255),
  email: z
    .string()
    .email()
    .transform((value) => value.toLowerCase()),
  password: z.string().min(6),
});

export class CreateOrgAccountDto extends createZodDto(createOrgAccountSchema) {}

export const updateOrgAccountSchema = createOrgAccountSchema.partial().extend({
  disabled: z.boolean().optional(),
});

export class UpdateOrgAccountDto extends createZodDto(updateOrgAccountSchema) {}
