import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  CreateApplicationDto,
  CreateJobDto,
  ReviewPostDto,
  UpdateApplicationStatusDto,
  UpdateJobDto,
  UserWithSecrets,
} from "@resume-space/dto";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import { TwoFactorGuard } from "../auth/guards/two-factor.guard";
import { User } from "../user/decorators/user.decorator";
import { JobService } from "./job.service";

@Controller("job")
export class JobController {
  constructor(private readonly jobService: JobService) {}

  // Public: Get all jobs with filters
  @Get()
  async findAll(
    @Query("search") search?: string,
    @Query("category") category?: string,
    @Query("locationType") locationType?: string,
    @Query("employmentType") employmentType?: string,
    @Query("experienceLevel") experienceLevel?: string,
    @Query("featured") featured?: string,
    @Query("skip") skip?: string,
    @Query("take") take?: string,
  ) {
    return this.jobService.findAll({
      search,
      category,
      locationType,
      employmentType,
      experienceLevel,
      featured: featured === "true",
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
    });
  }

  // Public: Get job categories
  @Get("categories")
  async getCategories() {
    return this.jobService.getCategories();
  }

  // Public: Get job statistics
  @Get("stats")
  async getStats() {
    return this.jobService.getStats();
  }

  // =============== AUTHENTICATED USER ENDPOINTS ===============

  // User: Apply to job
  @Post(":id/apply")
  @UseGuards(TwoFactorGuard)
  async apply(@User() user: UserWithSecrets, @Param("id") jobId: string, @Body() dto: CreateApplicationDto) {
    // Transform empty strings to null
    const data = {
      ...dto,
      jobId,
      resumeUrl: dto.resumeUrl === "" ? null : dto.resumeUrl,
      coverLetter: dto.coverLetter === "" ? null : dto.coverLetter,
    };
    return this.jobService.apply(user.id, data);
  }

  // User: Get my applications
  @Get("my-applications/list")
  @UseGuards(TwoFactorGuard)
  async getMyApplications(@User() user: UserWithSecrets) {
    return this.jobService.getMyApplications(user.id);
  }

  // User: Get AI-powered job recommendations (Approach 1)
  @Get("recommendations/ai")
  @UseGuards(TwoFactorGuard)
  async getRecommendations(@User() user: UserWithSecrets) {
    return this.jobService.getPersonalizedRecommendations(user.id);
  }

  // User: Get AI-enhanced search results (Approach 2)
  @Get("search/ai")
  @UseGuards(TwoFactorGuard)
  async getEnhancedSearch(
    @User() user: UserWithSecrets,
    @Query("q") query: string,
    @Query("category") category?: string,
    @Query("locationType") locationType?: string,
    @Query("employmentType") employmentType?: string,
    @Query("experienceLevel") experienceLevel?: string,
  ) {
    return this.jobService.getEnhancedSearchResults(user.id, query, {
      category,
      locationType,
      employmentType,
      experienceLevel,
    });
  }

  // User: Withdraw application
  @Patch("applications/:id/withdraw")
  @UseGuards(TwoFactorGuard)
  async withdrawApplication(@User() user: UserWithSecrets, @Param("id") applicationId: string) {
    return this.jobService.withdrawApplication(user.id, applicationId);
  }

  // =============== ADMIN ENDPOINTS ===============
  // Guard order matters: TwoFactorGuard populates request.user, RolesGuard
  // then checks it. Org admins manage only their own posts (enforced in the
  // service); SUPER_ADMIN passes every gate.

  @Get("admin/all")
  @UseGuards(TwoFactorGuard, RolesGuard)
  @Roles("ORG_ADMIN")
  async findAllAdmin(@User() user: UserWithSecrets, @Query("status") status?: string) {
    return this.jobService.findAllAdmin(user, { status });
  }

  // Loads a job in any review status for edit forms (the public GET /job/:id
  // 404s non-approved posts). Must be declared before GET ":id".
  @Get("admin/:id")
  @UseGuards(TwoFactorGuard, RolesGuard)
  @Roles("ORG_ADMIN")
  async findOneAdmin(@User() user: UserWithSecrets, @Param("id") id: string) {
    return this.jobService.findOneAdmin(user, id);
  }

  @Post()
  @UseGuards(TwoFactorGuard, RolesGuard)
  @Roles("ORG_ADMIN")
  async create(@User() user: UserWithSecrets, @Body() dto: CreateJobDto) {
    return this.jobService.create(user, dto);
  }

  @Patch("applications/:id/status")
  @UseGuards(TwoFactorGuard, RolesGuard)
  @Roles("ORG_ADMIN")
  async updateApplicationStatus(
    @User() user: UserWithSecrets,
    @Param("id") applicationId: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.jobService.updateApplicationStatus(user, applicationId, dto);
  }

  @Patch(":id/review")
  @UseGuards(TwoFactorGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async review(
    @User() user: UserWithSecrets,
    @Param("id") id: string,
    @Body() dto: ReviewPostDto,
  ) {
    return this.jobService.review(user, id, dto);
  }

  @Patch(":id/toggle-publish")
  @UseGuards(TwoFactorGuard, RolesGuard)
  @Roles("ORG_ADMIN")
  async togglePublish(@User() user: UserWithSecrets, @Param("id") id: string) {
    return this.jobService.togglePublish(user, id);
  }

  @Patch(":id/toggle-featured")
  @UseGuards(TwoFactorGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async toggleFeatured(@Param("id") id: string) {
    return this.jobService.toggleFeatured(id);
  }

  @Patch(":id")
  @UseGuards(TwoFactorGuard, RolesGuard)
  @Roles("ORG_ADMIN")
  async update(
    @User() user: UserWithSecrets,
    @Param("id") id: string,
    @Body() dto: UpdateJobDto,
  ) {
    return this.jobService.update(user, id, dto);
  }

  @Delete(":id")
  @UseGuards(TwoFactorGuard, RolesGuard)
  @Roles("ORG_ADMIN")
  async delete(@User() user: UserWithSecrets, @Param("id") id: string) {
    return this.jobService.delete(user, id);
  }

  @Get(":id/applications")
  @UseGuards(TwoFactorGuard, RolesGuard)
  @Roles("ORG_ADMIN")
  async getJobApplications(@User() user: UserWithSecrets, @Param("id") jobId: string) {
    return this.jobService.getJobApplications(user, jobId);
  }

  // Public: Get single job
  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.jobService.findOne(id);
  }
}
