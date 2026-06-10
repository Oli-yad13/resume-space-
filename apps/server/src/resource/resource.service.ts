import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, ResourceType } from "@prisma/client";
import { CreateResourceDto, ReviewPostDto, UpdateResourceDto, UserDto } from "@resume-space/dto";
import { PrismaService } from "nestjs-prisma";

// The fields the admin endpoints need from the authenticated user.
type Actor = Pick<UserDto, "id" | "role" | "organization">;

@Injectable()
export class ResourceService {
  constructor(private readonly prisma: PrismaService) {}

  // Ownership rule, centralized: org admins manage only their OWN posts;
  // the super admin manages everything (including legacy posts with no owner).
  private assertCanManage(user: Actor, resource: { postedById: string | null }) {
    if (user.role === "SUPER_ADMIN") return;
    if (resource.postedById !== user.id) {
      throw new ForbiddenException("You can only manage your own resources.");
    }
  }

  // Admin: Create resource. Org-admin posts start PENDING and only go public
  // after super-admin approval; super-admin posts are approved immediately.
  async create(user: Actor, createResourceDto: CreateResourceDto) {
    const isSuper = user.role === "SUPER_ADMIN";

    return this.prisma.resource.create({
      data: {
        ...createResourceDto,
        // Only the super admin can feature posts.
        featured: isSuper ? createResourceDto.featured : false,
        status: isSuper ? "APPROVED" : "PENDING",
        postedById: user.id,
        organization: user.organization ?? null,
      },
    });
  }

  // Public listing: only approved + published content.
  async findAll(filters?: {
    type?: ResourceType;
    category?: string;
    search?: string;
    published?: boolean;
    featured?: boolean;
  }) {
    const where: Prisma.ResourceWhereInput = { status: "APPROVED" };

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

  // Admin: org admins see their own posts (any status); the super admin sees
  // everything with an optional status filter.
  async findAllAdmin(
    user: Actor,
    filters?: {
      type?: ResourceType;
      category?: string;
      search?: string;
      published?: boolean;
      status?: string;
    },
  ) {
    const where: Prisma.ResourceWhereInput =
      user.role === "SUPER_ADMIN"
        ? { status: filters?.status as Prisma.ResourceWhereInput["status"] }
        : { postedById: user.id };

    if (filters?.type) where.type = filters.type;
    if (filters?.category) where.category = filters.category;
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }
    if (filters?.published !== undefined) where.published = filters.published;

    return this.prisma.resource.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      include: {
        postedBy: { select: { id: true, name: true, organization: true } },
      },
    });
  }

  // Admin: Load a single resource regardless of status (edit forms).
  async findOneAdmin(user: Actor, id: string) {
    const resource = await this.prisma.resource.findUnique({
      where: { id },
      include: {
        postedBy: { select: { id: true, name: true, organization: true } },
      },
    });

    if (!resource) throw new NotFoundException("Resource not found");
    this.assertCanManage(user, resource);

    return resource;
  }

  async findOne(id: string) {
    return this.prisma.resource.findUniqueOrThrow({
      where: { id },
    });
  }

  // Public: single resource — 404 for unapproved/unpublished content.
  async findOneAndIncrementViews(id: string) {
    const resource = await this.prisma.resource.findUnique({ where: { id } });

    if (!resource || !resource.published || resource.status !== "APPROVED") {
      throw new NotFoundException("Resource not found");
    }

    return this.prisma.resource.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  }

  // Admin: Update resource. When an org admin edits a post that has already
  // been reviewed (APPROVED or REJECTED), it goes back to PENDING — nothing
  // changes publicly without a fresh super-admin sign-off.
  async update(user: Actor, id: string, updateResourceDto: UpdateResourceDto) {
    const resource = await this.prisma.resource.findUnique({ where: { id } });
    if (!resource) throw new NotFoundException("Resource not found");
    this.assertCanManage(user, resource);

    const isSuper = user.role === "SUPER_ADMIN";
    const resubmit = !isSuper && resource.status !== "PENDING";

    return this.prisma.resource.update({
      where: { id },
      data: {
        ...updateResourceDto,
        featured: isSuper ? updateResourceDto.featured : undefined,
        status: resubmit ? "PENDING" : undefined,
      },
    });
  }

  // The owner's own on/off switch; does NOT touch the review status.
  async togglePublish(user: Actor, id: string, published: boolean) {
    const resource = await this.prisma.resource.findUnique({ where: { id } });
    if (!resource) throw new NotFoundException("Resource not found");
    this.assertCanManage(user, resource);

    return this.prisma.resource.update({
      where: { id },
      data: { published },
    });
  }

  // Super admin only (enforced at the controller).
  async toggleFeatured(id: string, featured: boolean) {
    return this.prisma.resource.update({
      where: { id },
      data: { featured },
    });
  }

  // Super admin: Approve or reject a post (with an optional note for the org).
  async review(user: Actor, id: string, data: ReviewPostDto) {
    const resource = await this.prisma.resource.findUnique({ where: { id } });
    if (!resource) throw new NotFoundException("Resource not found");

    return this.prisma.resource.update({
      where: { id },
      data: {
        status: data.status,
        reviewNote: data.reviewNote ?? null,
        reviewedAt: new Date(),
        reviewedById: user.id,
      },
    });
  }

  async remove(user: Actor, id: string) {
    const resource = await this.prisma.resource.findUnique({ where: { id } });
    if (!resource) throw new NotFoundException("Resource not found");
    this.assertCanManage(user, resource);

    return this.prisma.resource.delete({
      where: { id },
    });
  }

  async getCategories() {
    const resources = await this.prisma.resource.groupBy({
      by: ["category"],
      where: { published: true, status: "APPROVED" },
      _count: { category: true },
      orderBy: { category: "asc" },
    });

    return resources.map((r) => ({
      category: r.category,
      count: r._count.category,
    }));
  }

  async getStats() {
    const publicWhere = { published: true, status: "APPROVED" as const };
    const [total, videos, articles, totalViews] = await Promise.all([
      this.prisma.resource.count({ where: publicWhere }),
      this.prisma.resource.count({ where: { ...publicWhere, type: "VIDEO" } }),
      this.prisma.resource.count({ where: { ...publicWhere, type: "ARTICLE" } }),
      this.prisma.resource.aggregate({
        _sum: { views: true },
        where: publicWhere,
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
