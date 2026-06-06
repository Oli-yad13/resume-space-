import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { CreateApplicationDto, CreateJobDto, UpdateApplicationStatusDto, UpdateJobDto } from "@resume-space/dto";
import { ResumeData } from "@resume-space/schema";
import { PrismaService } from "nestjs-prisma";

import { GeminiService } from "../gemini/gemini.service";
import { ResumeService } from "../resume/resume.service";

@Injectable()
export class JobService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geminiService: GeminiService,
    private readonly resumeService: ResumeService,
  ) {}

  // Public: Get all published jobs with filters
  async findAll(params: {
    search?: string;
    category?: string;
    locationType?: string;
    employmentType?: string;
    experienceLevel?: string;
    featured?: boolean;
    skip?: number;
    take?: number;
  }) {
    const where: Prisma.JobWhereInput = {
      published: true,
      OR: params.search
        ? [
            { title: { contains: params.search, mode: "insensitive" } },
            { company: { contains: params.search, mode: "insensitive" } },
            { description: { contains: params.search, mode: "insensitive" } },
          ]
        : undefined,
      category: params.category,
      locationType: params.locationType as any,
      employmentType: params.employmentType as any,
      experienceLevel: params.experienceLevel as any,
      featured: params.featured,
    };

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        skip: params.skip || 0,
        take: params.take || 50,
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      }),
      this.prisma.job.count({ where }),
    ]);

    return { jobs, total };
  }

  // Admin: Get all jobs (including unpublished)
  async findAllAdmin() {
    return this.prisma.job.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });
  }

  // Public: Get single job by ID
  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!job || !job.published) {
      throw new NotFoundException("Job not found");
    }

    // Increment view count
    await this.prisma.job.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return job;
  }

  // Get categories
  async getCategories() {
    const jobs = await this.prisma.job.findMany({
      where: { published: true },
      select: { category: true },
      distinct: ["category"],
    });

    return jobs.map((job: { category: string }) => job.category).sort();
  }

  // Get job statistics
  async getStats() {
    const [total, byCategory, byLocationType, byEmploymentType] = await Promise.all([
      this.prisma.job.count({ where: { published: true } }),
      this.prisma.job.groupBy({
        by: ["category"],
        where: { published: true },
        _count: true,
      }),
      this.prisma.job.groupBy({
        by: ["locationType"],
        where: { published: true },
        _count: true,
      }),
      this.prisma.job.groupBy({
        by: ["employmentType"],
        where: { published: true },
        _count: true,
      }),
    ]);

    return {
      total,
      byCategory,
      byLocationType,
      byEmploymentType,
    };
  }

  // Admin: Create job
  async create(data: CreateJobDto) {
    return this.prisma.job.create({
      data: {
        ...data,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
  }

  // Admin: Update job
  async update(id: string, data: UpdateJobDto) {
    return this.prisma.job.update({
      where: { id },
      data: {
        ...data,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      },
    });
  }

  // Admin: Delete job
  async delete(id: string) {
    return this.prisma.job.delete({ where: { id } });
  }

  // Admin: Toggle publish status
  async togglePublish(id: string) {
    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job) throw new NotFoundException("Job not found");

    return this.prisma.job.update({
      where: { id },
      data: { published: !job.published },
    });
  }

  // Admin: Toggle featured status
  async toggleFeatured(id: string) {
    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job) throw new NotFoundException("Job not found");

    return this.prisma.job.update({
      where: { id },
      data: { featured: !job.featured },
    });
  }

  // User: Apply to job
  async apply(userId: string, data: CreateApplicationDto & { jobId: string }) {
    // Ensure jobId is provided
    if (!data.jobId) {
      throw new BadRequestException("Job ID is required");
    }

    // Check if job exists and is published
    const job = await this.prisma.job.findUnique({
      where: { id: data.jobId },
    });

    if (!job || !job.published) {
      throw new NotFoundException("Job not found");
    }

    // Check if already applied
    const existing = await this.prisma.application.findUnique({
      where: {
        userId_jobId: {
          userId,
          jobId: data.jobId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException("You have already applied to this job");
    }

    return this.prisma.application.create({
      data: {
        userId,
        jobId: data.jobId,
        resumeUrl: data.resumeUrl,
        coverLetter: data.coverLetter,
      },
      include: {
        job: true,
      },
    });
  }

  // User: Get user's applications
  async getMyApplications(userId: string) {
    return this.prisma.application.findMany({
      where: { userId },
      include: {
        job: true,
      },
      orderBy: { appliedAt: "desc" },
    });
  }

  // User: Withdraw application
  async withdrawApplication(userId: string, applicationId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application || application.userId !== userId) {
      throw new NotFoundException("Application not found");
    }

    return this.prisma.application.update({
      where: { id: applicationId },
      data: { status: "WITHDRAWN" },
    });
  }

  // Admin: Get applications for a job
  async getJobApplications(jobId: string) {
    return this.prisma.application.findMany({
      where: { jobId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            picture: true,
          },
        },
      },
      orderBy: { appliedAt: "desc" },
    });
  }

  // Admin: Update application status
  async updateApplicationStatus(applicationId: string, data: UpdateApplicationStatusDto) {
    return this.prisma.application.update({
      where: { id: applicationId },
      data,
    });
  }

  // AI-Powered: Get personalized job recommendations (Approach 1)
  async getPersonalizedRecommendations(userId: string) {
    if (!this.geminiService.isAvailable()) {
      throw new BadRequestException("AI recommendations are not available");
    }

    // Get user's most recent resume
    const resumes = await this.resumeService.findAll(userId);
    if (!resumes || resumes.length === 0) {
      throw new NotFoundException("No resume found. Please create a resume first.");
    }

    const resume = resumes[0]; // Use most recent resume
    const resumeData = resume.data as ResumeData;

    // Extract relevant data from resume
    const skills: string[] = [];
    const experience: string[] = [];
    const jobTitles: string[] = [];
    const education: string[] = [];
    let experienceYears = 0;

    // Extract skills
    if (resumeData.sections?.skills?.items) {
      resumeData.sections.skills.items.forEach((skill: any) => {
        if (skill.name) skills.push(skill.name);
        if (skill.keywords) skills.push(...skill.keywords);
      });
    }

    // Extract experience
    if (resumeData.sections?.experience?.items) {
      resumeData.sections.experience.items.forEach((exp: any) => {
        if (exp.position) jobTitles.push(exp.position);
        if (exp.summary) experience.push(`${exp.position} at ${exp.company}: ${exp.summary}`);
        
        // Calculate years of experience
        if (exp.date?.start && exp.date?.end) {
          const start = new Date(exp.date.start);
          const end = new Date(exp.date.end);
          experienceYears += (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
        }
      });
    }

    // Extract education
    if (resumeData.sections?.education?.items) {
      resumeData.sections.education.items.forEach((edu: any) => {
        if (edu.studyType && edu.area) {
          education.push(`${edu.studyType} in ${edu.area}`);
        }
      });
    }

    // Get all published jobs
    const { jobs } = await this.findAll({ take: 50 });

    // Use Gemini to analyze and recommend
    const recommendations = await this.geminiService.analyzeResumeForJobs(
      {
        skills,
        experience,
        experienceYears: Math.round(experienceYears),
        jobTitles,
        education,
      },
      jobs.map((job) => ({
        id: job.id,
        title: job.title,
        company: job.company,
        description: job.description,
        requirements: job.requirements,
        category: job.category,
        experienceLevel: job.experienceLevel,
        employmentType: job.employmentType,
        locationType: job.locationType,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        salaryCurrency: job.salaryCurrency,
        location: job.location,
      })),
    );

    // Fetch full job details for recommended jobs
    const recommendedJobs = await Promise.all(
      recommendations.map(async (rec) => {
        const job = await this.findOne(rec.jobId);
        return {
          ...job,
          aiScore: rec.score,
          aiReasoning: rec.reasoning,
        };
      }),
    );

    return {
      recommendations: recommendedJobs,
      resumeUsed: {
        id: resume.id,
        title: resume.title,
      },
    };
  }

  // AI-Powered: Enhanced smart search (Approach 2)
  async getEnhancedSearchResults(userId: string, searchQuery: string, filters?: {
    category?: string;
    locationType?: string;
    employmentType?: string;
    experienceLevel?: string;
  }) {
    if (!this.geminiService.isAvailable()) {
      // Fall back to regular search if AI is not available
      return this.findAll({ search: searchQuery, ...filters });
    }

    // Get user's most recent resume
    const resumes = await this.resumeService.findAll(userId);
    if (!resumes || resumes.length === 0) {
      // Fall back to regular search if no resume
      return this.findAll({ search: searchQuery, ...filters });
    }

    const resume = resumes[0];
    const resumeData = resume.data as ResumeData;

    // Extract basic profile
    const skills: string[] = [];
    const jobTitles: string[] = [];
    let experienceYears = 0;

    if (resumeData.sections?.skills?.items) {
      resumeData.sections.skills.items.forEach((skill: any) => {
        if (skill.name) skills.push(skill.name);
      });
    }

    if (resumeData.sections?.experience?.items) {
      resumeData.sections.experience.items.forEach((exp: any) => {
        if (exp.position) jobTitles.push(exp.position);
        if (exp.date?.start && exp.date?.end) {
          const start = new Date(exp.date.start);
          const end = new Date(exp.date.end);
          experienceYears += (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
        }
      });
    }

    // Get search results
    const { jobs, total } = await this.findAll({ 
      search: searchQuery, 
      ...filters,
      take: 30,
    });

    // Use Gemini to enhance search
    const enhancement = await this.geminiService.enhanceSearch(
      searchQuery,
      {
        skills,
        experienceYears: Math.round(experienceYears),
        jobTitles,
      },
      jobs.map((job) => ({
        id: job.id,
        title: job.title,
        company: job.company,
        description: job.description,
        category: job.category,
      })),
    );

    // Reorder jobs based on AI prioritization
    const prioritizedJobs = enhancement.prioritizedJobIds
      .map((jobId) => jobs.find((j) => j.id === jobId))
      .filter(Boolean) as typeof jobs;

    // Add remaining jobs that weren't prioritized
    const remainingJobs = jobs.filter(
      (job) => !enhancement.prioritizedJobIds.includes(job.id),
    );

    return {
      jobs: [...prioritizedJobs, ...remainingJobs],
      total,
      aiEnhanced: true,
      aiInsights: enhancement.insights,
      enhancedQuery: enhancement.enhancedQuery,
    };
  }
}

