import { prisma } from "@/lib/prisma";
import ResumesClient from "./resumes-client";

async function getResumes() {
  try {
    const resumes = await prisma.resume.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            username: true,
          },
        },
        statistics: true,
      },
    });
    return resumes;
  } catch (error) {
    console.error("Error fetching resumes:", error);
    return [];
  }
}

export default async function ResumesPage() {
  const resumes = await getResumes();

  return <ResumesClient resumes={resumes} />;
}
