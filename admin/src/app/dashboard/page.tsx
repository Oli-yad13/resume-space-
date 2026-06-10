import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { Users, FileText, Zap, Download, CheckSquare } from "lucide-react";
import DashboardClient from "./dashboard-client";
import { OrgDashboard } from "./org-dashboard";

async function getDashboardStats() {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [totalUsers, totalResumes, activeUsers, totalDownloads, allUsers, pendingPosts] =
      await Promise.all([
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
        Promise.all([
          prisma.job.count({ where: { status: "PENDING" } }),
          prisma.resource.count({ where: { status: "PENDING" } }),
        ]).then(([jobs, resources]) => jobs + resources),
      ]);

    return {
      totalUsers,
      totalResumes,
      activeUsers,
      totalDownloads: totalDownloads._sum.downloads || 0,
      recentUsers: allUsers,
      pendingPosts,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalUsers: 0,
      totalResumes: 0,
      activeUsers: 0,
      totalDownloads: 0,
      recentUsers: [],
      pendingPosts: 0,
    };
  }
}

export default async function DashboardPage() {
  const user = await requireAdmin();

  // Organization admins get their own posting overview (API-driven, scoped to
  // their account) — the platform-wide stats below are super-admin only.
  if (user.role !== "SUPER_ADMIN") {
    return <OrgDashboard />;
  }

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
      {/* Pending approvals call-out */}
      {stats.pendingPosts > 0 && (
        <Link
          href="/dashboard/approvals"
          className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 px-5 py-4 transition-colors hover:bg-amber-100"
        >
          <div className="flex items-center gap-3">
            <CheckSquare className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-900">
                {stats.pendingPosts} post{stats.pendingPosts === 1 ? "" : "s"} awaiting review
              </p>
              <p className="text-xs text-amber-700">
                Organization posts stay off the public site until you approve them.
              </p>
            </div>
          </div>
          <span className="text-sm font-medium text-amber-900">Review →</span>
        </Link>
      )}

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
                  <div className="rounded-md bg-brand-soft p-3 text-brand">
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
