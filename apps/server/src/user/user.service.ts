import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { Prisma, User } from "@prisma/client";
import { UserWithSecrets } from "@resume-space/dto";
import { ErrorMessage } from "@resume-space/utils";
import { PrismaService } from "nestjs-prisma";

import { StorageService } from "../storage/storage.service";

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async findOneById(id: string): Promise<UserWithSecrets> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id },
      include: { secrets: true },
    });

    if (!user.secrets) {
      throw new InternalServerErrorException(ErrorMessage.SecretsNotFound);
    }

    return user;
  }

  async findOneByIdentifier(identifier: string): Promise<UserWithSecrets | null> {
    const user = await (async (identifier: string) => {
      // First, find the user by email
      const user = await this.prisma.user.findUnique({
        where: { email: identifier },
        include: { secrets: true },
      });

      // If the user exists, return it
      if (user) return user;

      // Otherwise, find the user by username
      // If the user doesn't exist, throw an error
      return this.prisma.user.findUnique({
        where: { username: identifier },
        include: { secrets: true },
      });
    })(identifier);

    return user;
  }

  async findOneByIdentifierOrThrow(identifier: string): Promise<UserWithSecrets> {
    const user = await (async (identifier: string) => {
      // First, find the user by email
      const user = await this.prisma.user.findUnique({
        where: { email: identifier },
        include: { secrets: true },
      });

      // If the user exists, return it
      if (user) return user;

      // Otherwise, find the user by username
      // If the user doesn't exist, throw an error
      return this.prisma.user.findUniqueOrThrow({
        where: { username: identifier },
        include: { secrets: true },
      });
    })(identifier);

    return user;
  }

  create(data: Prisma.UserCreateInput): Promise<UserWithSecrets> {
    return this.prisma.user.create({ data, include: { secrets: true } });
  }

  updateByEmail(email: string, data: Prisma.UserUpdateArgs["data"]): Promise<User> {
    return this.prisma.user.update({ where: { email }, data });
  }

  async updateByResetToken(
    resetToken: string,
    data: Prisma.SecretsUpdateArgs["data"],
  ): Promise<void> {
    await this.prisma.secrets.update({ where: { resetToken }, data });
  }

  async deleteOneById(id: string): Promise<void> {
    await Promise.all([
      this.storageService.deleteFolder(id),
      this.prisma.user.delete({ where: { id } }),
    ]);
  }

  // Super admin: list all organization admin accounts with their post counts.
  findOrgAccounts() {
    return this.prisma.user.findMany({
      where: { role: "ORG_ADMIN" },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        organization: true,
        disabled: true,
        createdAt: true,
        _count: { select: { jobsPosted: true, resourcesPosted: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  updateById(id: string, data: Prisma.UserUpdateArgs["data"]): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }
}
