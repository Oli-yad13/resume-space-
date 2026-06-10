import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import {
  CreateOrgAccountDto,
  UpdateOrgAccountDto,
  UpdateUserDto,
  UserDto,
} from "@resume-space/dto";
import { ErrorMessage } from "@resume-space/utils";
import type { Response } from "express";

import { AuthService } from "../auth/auth.service";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import { TwoFactorGuard } from "../auth/guards/two-factor.guard";
import { User } from "./decorators/user.decorator";
import { UserService } from "./user.service";

@ApiTags("User")
@Controller("user")
export class UserController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Get("me")
  @UseGuards(TwoFactorGuard)
  fetch(@User() user: UserDto) {
    return user;
  }

  @Patch("me")
  @UseGuards(TwoFactorGuard)
  async update(@User("email") email: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      // If user is updating their email, send a verification email
      if (updateUserDto.email && updateUserDto.email !== email) {
        await this.userService.updateByEmail(email, {
          emailVerified: false,
          email: updateUserDto.email,
        });

        await this.authService.sendVerificationEmail(updateUserDto.email);

        email = updateUserDto.email;
      }

      return await this.userService.updateByEmail(email, {
        name: updateUserDto.name,
        picture: updateUserDto.picture,
        username: updateUserDto.username,
        locale: updateUserDto.locale,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
        throw new BadRequestException(ErrorMessage.UserAlreadyExists);
      }

      Logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  @Delete("me")
  @UseGuards(TwoFactorGuard)
  async delete(@User("id") id: string, @Res({ passthrough: true }) response: Response) {
    await this.userService.deleteOneById(id);

    response.clearCookie("Authentication");
    response.clearCookie("Refresh");

    response.status(200).send({ message: "Sorry to see you go, goodbye!" });
  }

  // =============== ORG ACCOUNT MANAGEMENT (SUPER ADMIN) ===============
  // The super admin provisions ORG_ADMIN accounts for trusted organizations
  // and can disable them or reset their credentials at any time.

  @Get("admin/org-accounts")
  @UseGuards(TwoFactorGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  findOrgAccounts() {
    return this.userService.findOrgAccounts();
  }

  @Post("admin/org-accounts")
  @UseGuards(TwoFactorGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async createOrgAccount(@Body() dto: CreateOrgAccountDto) {
    const user = await this.authService.createOrgAccount(dto);
    // Never return secrets.
    const { secrets: _secrets, ...rest } = user;
    return rest;
  }

  @Patch("admin/org-accounts/:id")
  @UseGuards(TwoFactorGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async updateOrgAccount(@Param("id") id: string, @Body() dto: UpdateOrgAccountDto) {
    const target = await this.userService.findOneById(id);

    // Only ORG_ADMIN accounts are manageable here — prevents a super admin
    // from accidentally disabling themselves or regular users via this route.
    if (target.role !== "ORG_ADMIN") {
      throw new BadRequestException("This account is not an organization account.");
    }

    try {
      return await this.userService.updateById(id, {
        name: dto.name,
        email: dto.email,
        organization: dto.organization,
        disabled: dto.disabled,
        secrets: dto.password
          ? { update: { password: await this.authService.hashPassword(dto.password) } }
          : undefined,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
        throw new BadRequestException(ErrorMessage.UserAlreadyExists);
      }

      Logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  @Delete("admin/org-accounts/:id")
  @UseGuards(TwoFactorGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async deleteOrgAccount(@Param("id") id: string) {
    const target = await this.userService.findOneById(id);

    if (target.role !== "ORG_ADMIN") {
      throw new BadRequestException("This account is not an organization account.");
    }

    await this.userService.deleteOneById(id);
    return { message: "Organization account deleted." };
  }
}
