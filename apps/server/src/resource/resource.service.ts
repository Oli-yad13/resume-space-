import { Injectable } from "@nestjs/common";
import { Prisma, ResourceType } from "@prisma/client";
import { CreateResourceDto, UpdateResourceDto } from "@resume-space/dto";
import { PrismaService } from "nestjs-prisma";

@Injectable()
export class ResourceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createResourceDto: CreateResourceDto) {
    return this.prisma.resource.create({
      data: createResourceDto,
    });
  }

  async findAll(filters?: {
    type?: ResourceType;
    category?: string;
    search?: string;
    published?: boolean;
    featured?: boolean;
  }) {
    const where: Prisma.ResourceWhereInput = {};

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters?.published !== undefined) {
      where.published = filters.published;
    }

    if (filters?.featured !== undefined) {
      where.featured = filters.featured;
    }

    return this.prisma.resource.findMany({
      where,
      orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
    });
  }

  async findOne(id: string) {
    return this.prisma.resource.findUniqueOrThrow({
      where: { id },
    });
  }

  async findOneAndIncrementViews(id: string) {
    // Increment view count
    await this.prisma.resource.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return this.findOne(id);
  }

  async update(id: string, updateResourceDto: UpdateResourceDto) {
    return this.prisma.resource.update({
      where: { id },
      data: updateResourceDto,
    });
  }

  async togglePublish(id: string, published: boolean) {
    return this.prisma.resource.update({
      where: { id },
      data: { published },
    });
  }

  async toggleFeatured(id: string, featured: boolean) {
    return this.prisma.resource.update({
      where: { id },
      data: { featured },
    });
  }

  async remove(id: string) {
    return this.prisma.resource.delete({
      where: { id },
    });
  }

  async getCategories() {
    const resources = await this.prisma.resource.groupBy({
      by: ["category"],
      where: { published: true },
      _count: { category: true },
      orderBy: { category: "asc" },
    });

    return resources.map((r) => ({
      category: r.category,
      count: r._count.category,
    }));
  }

  async getStats() {
    const [total, videos, articles, totalViews] = await Promise.all([
      this.prisma.resource.count({ where: { published: true } }),
      this.prisma.resource.count({ where: { published: true, type: "VIDEO" } }),
      this.prisma.resource.count({ where: { published: true, type: "ARTICLE" } }),
      this.prisma.resource.aggregate({
        _sum: { views: true },
        where: { published: true },
      }),
    ]);

    return {
      total,
      videos,
      articles,
      totalViews: totalViews._sum.views || 0,
    };
  }
}

