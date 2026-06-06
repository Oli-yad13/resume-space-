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
import { CreateApplicationDto, CreateJobDto, UpdateApplicationStatusDto, UpdateJobDto, UserWithSecrets } from "@resume-space/dto";
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
  // Authenticated via TwoFactorGuard. A dedicated admin/role guard is still a TODO.

  @Get("admin/all")
  @UseGuards(TwoFactorGuard)
  async findAllAdmin() {
    return this.jobService.findAllAdmin();
  }

  @Post()
  @UseGuards(TwoFactorGuard)
  async create(@Body() dto: CreateJobDto) {
    return this.jobService.create(dto);
  }

  @Patch(":id")
  @UseGuards(TwoFactorGuard)
  async update(@Param("id") id: string, @Body() dto: UpdateJobDto) {
    return this.jobService.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(TwoFactorGuard)
  async delete(@Param("id") id: string) {
    return this.jobService.delete(id);
  }

  @Patch(":id/toggle-publish")
  @UseGuards(TwoFactorGuard)
  async togglePublish(@Param("id") id: string) {
    return this.jobService.togglePublish(id);
  }

  @Patch(":id/toggle-featured")
  @UseGuards(TwoFactorGuard)
  async toggleFeatured(@Param("id") id: string) {
    return this.jobService.toggleFeatured(id);
  }

  @Get(":id/applications")
  @UseGuards(TwoFactorGuard)
  async getJobApplications(@Param("id") jobId: string) {
    return this.jobService.getJobApplications(jobId);
  }

  // Public: Get single job
  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.jobService.findOne(id);
  }

  @Patch("applications/:id/status")
  @UseGuards(TwoFactorGuard)
  async updateApplicationStatus(
    @Param("id") applicationId: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.jobService.updateApplicationStatus(applicationId, dto);
  }
}
