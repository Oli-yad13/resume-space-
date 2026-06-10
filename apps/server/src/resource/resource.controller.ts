import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ResourceType } from "@prisma/client";
import {
  CreateResourceDto,
  ReviewPostDto,
  UpdateResourceDto,
  UserWithSecrets,
} from "@resume-space/dto";

import { Roles } from "../auth/decorators/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import { TwoFactorGuard } from "../auth/guards/two-factor.guard";
import { User } from "../user/decorators/user.decorator";
import { ResourceService } from "./resource.service";

@ApiTags("Resource")
@Controller("resource")
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  // Public endpoints
  @Get()
  findAll(
    @Query("type") type?: ResourceType,
    @Query("category") category?: string,
    @Query("search") search?: string,
    @Query("featured") featured?: string,
  ) {
    return this.resourceService.findAll({
      type,
      category,
      search,
      published: true,
      featured: featured === "true" ? true : undefined,
    });
  }

  @Get("categories")
  getCategories() {
    return this.resourceService.getCategories();
  }

  @Get("stats")
  getStats() {
    return this.resourceService.getStats();
  }

  // =============== ADMIN ENDPOINTS ===============
  // Guard order matters: TwoFactorGuard populates request.user, RolesGuard
  // then checks it. Org admins manage only their own posts (enforced in the
  // service); SUPER_ADMIN passes every gate.

  @Get("admin/all")
  @UseGuards(TwoFactorGuard, RolesGuard)
  @Roles("ORG_ADMIN")
  findAllAdmin(
    @User() user: UserWithSecrets,
    @Query("type") type?: ResourceType,
    @Query("category") category?: string,
    @Query("search") search?: string,
    @Query("published") published?: string,
    @Query("status") status?: string,
  ) {
    return this.resourceService.findAllAdmin(user, {
      type,
      category,
      search,
      published: published === "true" ? true : published === "false" ? false : undefined,
      status,
    });
  }

  // Loads a resource in any review status for edit forms (the public GET /:id
  // 404s non-approved posts). Must be declared before GET ":id".
  @Get("admin/:id")
  @UseGuards(TwoFactorGuard, RolesGuard)
  @Roles("ORG_ADMIN")
  findOneAdmin(@User() user: UserWithSecrets, @Param("id") id: string) {
    return this.resourceService.findOneAdmin(user, id);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.resourceService.findOneAndIncrementViews(id);
  }

  @Post()
  @UseGuards(TwoFactorGuard, RolesGuard)
  @Roles("ORG_ADMIN")
  create(@User() user: UserWithSecrets, @Body() createResourceDto: CreateResourceDto) {
    try {
      return this.resourceService.create(user, createResourceDto);
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }

  @Patch(":id/review")
  @UseGuards(TwoFactorGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  review(@User() user: UserWithSecrets, @Param("id") id: string, @Body() dto: ReviewPostDto) {
    return this.resourceService.review(user, id, dto);
  }

  @Patch(":id/toggle-publish")
  @UseGuards(TwoFactorGuard, RolesGuard)
  @Roles("ORG_ADMIN")
  togglePublish(
    @User() user: UserWithSecrets,
    @Param("id") id: string,
    @Body("published") published: boolean,
  ) {
    return this.resourceService.togglePublish(user, id, published);
  }

  @Patch(":id/toggle-featured")
  @UseGuards(TwoFactorGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  toggleFeatured(@Param("id") id: string, @Body("featured") featured: boolean) {
    return this.resourceService.toggleFeatured(id, featured);
  }

  @Patch(":id")
  @UseGuards(TwoFactorGuard, RolesGuard)
  @Roles("ORG_ADMIN")
  update(
    @User() user: UserWithSecrets,
    @Param("id") id: string,
    @Body() updateResourceDto: UpdateResourceDto,
  ) {
    try {
      return this.resourceService.update(user, id, updateResourceDto);
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }

  @Delete(":id")
  @UseGuards(TwoFactorGuard, RolesGuard)
  @Roles("ORG_ADMIN")
  remove(@User() user: UserWithSecrets, @Param("id") id: string) {
    try {
      return this.resourceService.remove(user, id);
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }
}
