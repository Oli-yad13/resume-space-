import { Card, CardContent } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { Users, FileText, Zap, Download } from "lucide-react";
import DashboardClient from "./dashboard-client";

async function getDashboardStats() {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [totalUsers, totalResumes, activeUsers, totalDownloads, allUsers] = await Promise.all([
      prisma.user.count(),
      prisma.resume.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      }),
      prisma.statistics.aggregate({
        _sum: { downloads: true },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      totalUsers,
      totalResumes,
      activeUsers,
      totalDownloads: totalDownloads._sum.downloads || 0,
      recentUsers: allUsers,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalUsers: 0,
      totalResumes: 0,
      activeUsers: 0,
      totalDownloads: 0,
      recentUsers: [],
    };
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      description: "Registered users",
    },
    {
      title: "Total Resumes",
      value: stats.totalResumes,
      icon: FileText,
      description: "Created resumes",
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      icon: Zap,
      description: "Users this week",
    },
    {
      title: "Total Downloads",
      value: stats.totalDownloads,
      icon: Download,
      description: "Resume downloads",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="group cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      {stat.title}
                    </p>
                    <h3 className="mt-3 text-3xl font-bold text-zinc-900">
                      {stat.value.toLocaleString()}
                    </h3>
                    <p className="mt-2 text-xs text-zinc-500">{stat.description}</p>
                  </div>
                  <div className="rounded-lg bg-zinc-100 p-3 text-zinc-600 transition-all duration-300 group-hover:bg-zinc-900 group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Users with Pagination */}
      <DashboardClient recentUsers={stats.recentUsers} />
    </div>
  );
}
