import { prisma } from "@/lib/prisma";
import ResourcesClient from "./resources-client";

async function getResources() {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
    });
    return resources;
  } catch (error) {
    console.error("Error fetching resources:", error);
    return [];
  }
}

export default async function ResourcesPage() {
  const resources = await getResources();

  return <ResourcesClient resources={resources} />;
}

