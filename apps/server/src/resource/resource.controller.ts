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
import { CreateResourceDto, UpdateResourceDto } from "@resume-space/dto";

import { TwoFactorGuard } from "../auth/guards/two-factor.guard";
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

  // Admin endpoints (protected)
  @Get("admin/all")
  @UseGuards(TwoFactorGuard)
  findAllAdmin(
    @Query("type") type?: ResourceType,
    @Query("category") category?: string,
    @Query("search") search?: string,
    @Query("published") published?: string,
  ) {
    return this.resourceService.findAll({
      type,
      category,
      search,
      published: published === "true" ? true : published === "false" ? false : undefined,
    });
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.resourceService.findOneAndIncrementViews(id);
  }

  @Post()
  @UseGuards(TwoFactorGuard)
  create(@Body() createResourceDto: CreateResourceDto) {
    try {
      return this.resourceService.create(createResourceDto);
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }

  @Patch(":id")
  @UseGuards(TwoFactorGuard)
  update(@Param("id") id: string, @Body() updateResourceDto: UpdateResourceDto) {
    try {
      return this.resourceService.update(id, updateResourceDto);
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }

  @Patch(":id/toggle-publish")
  @UseGuards(TwoFactorGuard)
  togglePublish(@Param("id") id: string, @Body("published") published: boolean) {
    return this.resourceService.togglePublish(id, published);
  }

  @Patch(":id/toggle-featured")
  @UseGuards(TwoFactorGuard)
  toggleFeatured(@Param("id") id: string, @Body("featured") featured: boolean) {
    return this.resourceService.toggleFeatured(id, featured);
  }

  @Delete(":id")
  @UseGuards(TwoFactorGuard)
  remove(@Param("id") id: string) {
    try {
      return this.resourceService.remove(id);
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }
}
