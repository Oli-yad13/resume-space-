import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Role, UserDto } from "@resume-space/dto";

import { ROLES_KEY } from "../decorators/roles.decorator";

/**
 * Role gate. MUST run after an authentication guard (TwoFactorGuard) so that
 * `request.user` is populated — Nest executes `@UseGuards` left to right:
 *
 *   @UseGuards(TwoFactorGuard, RolesGuard)
 *   @Roles("ORG_ADMIN")
 *
 * SUPER_ADMIN implicitly passes every role gate.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest<{ user?: UserDto }>();
    const user = request.user;

    if (!user) throw new ForbiddenException();
    if (user.role === "SUPER_ADMIN") return true;
    if (requiredRoles.includes(user.role)) return true;

    throw new ForbiddenException("You do not have permission to perform this action.");
  }
}
