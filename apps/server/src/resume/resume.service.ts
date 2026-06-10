import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { createId } from "@paralleldrive/cuid2";
import { CreateResumeDto, ImportResumeDto, ResumeDto, UpdateResumeDto } from "@resume-space/dto";
import { defaultResumeData, ResumeData, resumeDataSchema } from "@resume-space/schema";
import type { DeepPartial } from "@resume-space/utils";
import { ErrorMessage, generateRandomName } from "@resume-space/utils";
import slugify from "@sindresorhus/slugify";
import deepmerge from "deepmerge";
import { PrismaService } from "nestjs-prisma";

import { PrinterService } from "@/server/printer/printer.service";

import { GeminiService } from "../gemini/gemini.service";
import { StorageService } from "../storage/storage.service";

@Injectable()
export class ResumeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly printerService: PrinterService,
    private readonly storageService: StorageService,
    private readonly geminiService: GeminiService,
  ) {}

  async create(userId: string, createResumeDto: CreateResumeDto) {
    const { name, email, picture } = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { name: true, email: true, picture: true },
    });

    const data = deepmerge(defaultResumeData, {
      basics: { name, email, picture: { url: picture ?? "" } },
    } satisfies DeepPartial<ResumeData>);

    return this.prisma.resume.create({
      data: {
        data,
        userId,
        title: createResumeDto.title,
        visibility: createResumeDto.visibility,
        slug: createResumeDto.slug ?? slugify(createResumeDto.title),
      },
    });
  }

  import(userId: string, importResumeDto: ImportResumeDto) {
    const randomTitle = generateRandomName();

    return this.prisma.resume.create({
      data: {
        userId,
        visibility: "private",
        data: importResumeDto.data,
        title: importResumeDto.title ?? randomTitle,
        slug: importResumeDto.slug ?? slugify(randomTitle),
      },
    });
  }

  private getErrorMessage(error: unknown) {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    return "Unknown error";
  }

  /**
   * Parse a real resume/CV file (PDF, DOCX, image, plain text) into validated ResumeData
   * using Gemini's multimodal parsing. Does NOT persist — the client previews the
   * result and then imports it through the regular `import` flow.
   */
  async parseImportedFile(file: { buffer: Buffer; mimetype: string }): Promise<ResumeData> {
    if (!this.geminiService.isAvailable()) {
      throw new BadRequestException(
        "AI-powered CV import is not available — GEMINI_API_KEY is not configured on the server.",
      );
    }

    try {
      const parsed = await this.geminiService.parseResumeFile({
        buffer: file.buffer,
        mimeType: file.mimetype,
      });

      return ResumeService.mapParsedResume(parsed);
    } catch (error) {
      Logger.error(error);
      throw new BadRequestException(
        `Resume Space could not parse this file. ${this.getErrorMessage(error)}`,
      );
    }
  }

  /** Map loosely-typed AI output onto strict ResumeData, generating item ids. */
  private static mapParsedResume(parsed: Record<string, any>): ResumeData {
    const str = (v: unknown) => (typeof v === "string" ? v : "");
    const arr = (v: unknown) => (Array.isArray(v) ? v : []);
    const item = <T extends Record<string, unknown>>(fields: T) => ({
      id: createId(),
      visible: true,
      ...fields,
    });
    const url = (v: any) =>
      typeof v === "string"
        ? { label: "", href: v }
        : { label: str(v?.label), href: str(v?.href ?? v?.url) };

    const data = structuredClone(defaultResumeData);
    const b = parsed.basics ?? {};

    data.basics = {
      ...data.basics,
      name: str(b.name),
      headline: str(b.headline),
      email: str(b.email),
      phone: str(b.phone),
      location: str(b.location),
      url: url(b.url),
    };

    data.sections.summary.content = str(parsed.summary);

    // Sections below require a non-empty key (company / institution / name / title /
    // network+username), so we drop AI entries that lack it — otherwise schema
    // validation would reject the whole resume.
    data.sections.profiles.items = arr(parsed.profiles)
      .filter((p: any) => str(p.network) && str(p.username))
      .map((p: any) =>
        item({
          network: str(p.network),
          username: str(p.username),
          icon: str(p.network).toLowerCase().replace(/\s+/g, ""),
          url: url(p.url),
        }),
      );

    data.sections.experience.items = arr(parsed.experience)
      .filter((e: any) => str(e.company))
      .map((e: any) =>
        item({
          company: str(e.company),
          position: str(e.position),
          location: str(e.location),
          date: str(e.date),
          summary: str(e.summary),
          url: url(e.url),
        }),
      );

    data.sections.education.items = arr(parsed.education)
      .filter((e: any) => str(e.institution))
      .map((e: any) =>
        item({
          institution: str(e.institution),
          studyType: str(e.studyType),
          area: str(e.area),
          score: str(e.score),
          date: str(e.date),
          summary: str(e.summary),
          url: url(e.url),
        }),
      );

    data.sections.skills.items = arr(parsed.skills)
      .filter((s: any) => str(s.name))
      .map((s: any) =>
        item({
          name: str(s.name),
          description: str(s.description),
          level: 0,
          keywords: arr(s.keywords).map(str).filter(Boolean),
        }),
      );

    data.sections.projects.items = arr(parsed.projects)
      .filter((p: any) => str(p.name))
      .map((p: any) =>
        item({
          name: str(p.name),
          description: str(p.description),
          date: str(p.date),
          summary: str(p.summary),
          keywords: arr(p.keywords).map(str).filter(Boolean),
          url: url(p.url),
        }),
      );

    data.sections.certifications.items = arr(parsed.certifications)
      .filter((c: any) => str(c.name))
      .map((c: any) =>
        item({
          name: str(c.name),
          issuer: str(c.issuer),
          date: str(c.date),
          summary: str(c.summary),
          url: url(c.url),
        }),
      );

    data.sections.languages.items = arr(parsed.languages)
      .filter((l: any) => str(l.name))
      .map((l: any) => item({ name: str(l.name), description: str(l.description), level: 0 }));

    data.sections.awards.items = arr(parsed.awards)
      .filter((a: any) => str(a.title))
      .map((a: any) =>
        item({
          title: str(a.title),
          awarder: str(a.awarder),
          date: str(a.date),
          summary: str(a.summary),
          url: url(a.url),
        }),
      );

    // Validate (fills any remaining defaults) and surface schema errors clearly.
    return resumeDataSchema.parse(data);
  }

  findAll(userId: string) {
    return this.prisma.resume.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } });
  }

  findOne(id: string, userId?: string) {
    if (userId) {
      return this.prisma.resume.findUniqueOrThrow({ where: { userId_id: { userId, id } } });
    }

    return this.prisma.resume.findUniqueOrThrow({ where: { id } });
  }

  async findOneStatistics(id: string) {
    const result = await this.prisma.statistics.findFirst({
      select: { views: true, downloads: true },
      where: { resumeId: id },
    });

    return {
      views: result?.views ?? 0,
      downloads: result?.downloads ?? 0,
    };
  }

  async findOneByUsernameSlug(username: string, slug: string, userId?: string) {
    const resume = await this.prisma.resume.findFirstOrThrow({
      where: { user: { username }, slug, visibility: "public" },
    });

    // Update statistics: increment the number of views by 1
    if (!userId) {
      await this.prisma.statistics.upsert({
        where: { resumeId: resume.id },
        create: { views: 1, downloads: 0, resumeId: resume.id },
        update: { views: { increment: 1 } },
      });
    }

    return resume;
  }

  async update(userId: string, id: string, updateResumeDto: UpdateResumeDto) {
    try {
      const { locked } = await this.prisma.resume.findUniqueOrThrow({
        where: { id },
        select: { locked: true },
      });

      if (locked) throw new BadRequestException(ErrorMessage.ResumeLocked);

      return await this.prisma.resume.update({
        data: {
          title: updateResumeDto.title,
          slug: updateResumeDto.slug,
          visibility: updateResumeDto.visibility,
          data: updateResumeDto.data as Prisma.JsonObject,
        },
        where: { userId_id: { userId, id } },
      });
    } catch (error) {
      if (error.code === "P2025") {
        Logger.error(error);
        throw new InternalServerErrorException(error);
      }
    }
  }

  lock(userId: string, id: string, set: boolean) {
    return this.prisma.resume.update({
      data: { locked: set },
      where: { userId_id: { userId, id } },
    });
  }

  async remove(userId: string, id: string) {
    await Promise.all([
      // Remove files in storage, and their cached keys
      this.storageService.deleteObject(userId, "resumes", id),
      this.storageService.deleteObject(userId, "previews", id),
    ]);

    return this.prisma.resume.delete({ where: { userId_id: { userId, id } } });
  }

  async printResume(resume: ResumeDto, userId?: string) {
    const url = await this.printerService.printResume(resume);

    // Update statistics: increment the number of downloads by 1
    if (!userId) {
      await this.prisma.statistics.upsert({
        where: { resumeId: resume.id },
        create: { views: 0, downloads: 1, resumeId: resume.id },
        update: { downloads: { increment: 1 } },
      });
    }

    return url;
  }

  printPreview(resume: ResumeDto) {
    return this.printerService.printPreview(resume);
  }
}
