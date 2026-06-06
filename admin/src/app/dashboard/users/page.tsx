import { prisma } from "@/lib/prisma";
import UsersClient from "./users-client";

async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { resumes: true },
        },
      },
    });
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export default async function UsersPage() {
  const users = await getUsers();

  return <UsersClient users={users} />;
}
