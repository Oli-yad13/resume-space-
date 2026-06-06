import { Metadata } from "next";
import { JobsClient } from "./jobs-client";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Jobs Management",
  description: "Manage job postings",
};

async function getJobs() {
  try {
    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });
    return jobs;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }
}

export default async function JobsPage() {
  const jobs = await getJobs();

  return <JobsClient jobs={jobs} />;
}

