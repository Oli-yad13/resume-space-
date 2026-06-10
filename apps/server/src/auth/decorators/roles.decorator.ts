import { SetMetadata } from "@nestjs/common";
import type { Role } from "@resume-space/dto";

export const ROLES_KEY = "roles";

/**
 * Restrict a route to the given roles. Must be combined with an
 * authentication guard that populates `request.user`, in this order:
 *
 *   @UseGuards(TwoFactorGuard, RolesGuard)
 *   @Roles("ORG_ADMIN")
 *
 * SUPER_ADMIN implicitly passes every role gate.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
