import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/session";

async function getStatistics() {
  try {
    const [
      totalUsers,
      totalResumes,
      publicResumes,
      privateResumes,
      emailUsers,
      githubUsers,
      googleUsers,
      verifiedEmails,
      twoFactorEnabled,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.resume.count(),
      prisma.resume.count({ where: { visibility: "public" } }),
      prisma.resume.count({ where: { visibility: "private" } }),
      prisma.user.count({ where: { provider: "email" } }),
      prisma.user.count({ where: { provider: "github" } }),
      prisma.user.count({ where: { provider: "google" } }),
      prisma.user.count({ where: { emailVerified: true } }),
      prisma.user.count({ where: { twoFactorEnabled: true } }),
    ]);

    const topResumes = await prisma.resume.findMany({
      take: 10,
      orderBy: {
        statistics: {
          views: "desc",
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        statistics: true,
      },
    });

    return {
      totalUsers,
      totalResumes,
      publicResumes,
      privateResumes,
      emailUsers,
      githubUsers,
      googleUsers,
      verifiedEmails,
      twoFactorEnabled,
      topResumes,
    };
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return {
      totalUsers: 0,
      totalResumes: 0,
      publicResumes: 0,
      privateResumes: 0,
      emailUsers: 0,
      githubUsers: 0,
      googleUsers: 0,
      verifiedEmails: 0,
      twoFactorEnabled: 0,
      topResumes: [],
    };
  }
}

export default async function StatisticsPage() {
  await requireSuperAdmin();
  const stats = await getStatistics();

  return (
    <div className="space-y-6">
      {/* User Statistics */}
      <div>
        <h3 className="mb-4 text-base font-semibold text-zinc-900">User Statistics</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Total Users
              </p>
              <p className="mt-3 text-3xl font-bold text-zinc-900">{stats.totalUsers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Email Verified
              </p>
              <p className="mt-3 text-3xl font-bold text-zinc-900">{stats.verifiedEmails}</p>
              <p className="mt-2 text-xs text-zinc-500">
                {stats.totalUsers > 0
                  ? `${Math.round((stats.verifiedEmails / stats.totalUsers) * 100)}%`
                  : "0%"}{" "}
                of total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                2FA Enabled
              </p>
              <p className="mt-3 text-3xl font-bold text-zinc-900">{stats.twoFactorEnabled}</p>
              <p className="mt-2 text-xs text-zinc-500">
                {stats.totalUsers > 0
                  ? `${Math.round((stats.twoFactorEnabled / stats.totalUsers) * 100)}%`
                  : "0%"}{" "}
                of total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Avg Resumes/User
              </p>
              <p className="mt-3 text-3xl font-bold text-zinc-900">
                {stats.totalUsers > 0 ? (stats.totalResumes / stats.totalUsers).toFixed(1) : "0"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Provider Distribution */}
      <Card>
        <CardHeader className="border-b border-zinc-100">
          <CardTitle>Authentication Providers</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-900">Email</span>
                <span className="text-sm font-semibold text-zinc-700">
                  {stats.emailUsers} users
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-zinc-900 to-zinc-700 transition-all duration-500"
                  style={{
                    width: `${stats.totalUsers > 0 ? (stats.emailUsers / stats.totalUsers) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-900">GitHub</span>
                <span className="text-sm font-semibold text-zinc-700">
                  {stats.githubUsers} users
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-zinc-900 to-zinc-700 transition-all duration-500"
                  style={{
                    width: `${stats.totalUsers > 0 ? (stats.githubUsers / stats.totalUsers) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-900">Google</span>
                <span className="text-sm font-semibold text-zinc-700">
                  {stats.googleUsers} users
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-zinc-900 to-zinc-700 transition-all duration-500"
                  style={{
                    width: `${stats.totalUsers > 0 ? (stats.googleUsers / stats.totalUsers) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resume Statistics */}
      <div>
        <h3 className="mb-4 text-base font-semibold text-zinc-900">Resume Statistics</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Total Resumes
              </p>
              <p className="mt-3 text-3xl font-bold text-zinc-900">{stats.totalResumes}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Public Resumes
              </p>
              <p className="mt-3 text-3xl font-bold text-zinc-900">{stats.publicResumes}</p>
              <p className="mt-2 text-xs text-zinc-500">
                {stats.totalResumes > 0
                  ? `${Math.round((stats.publicResumes / stats.totalResumes) * 100)}%`
                  : "0%"}{" "}
                of total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Private Resumes
              </p>
              <p className="mt-3 text-3xl font-bold text-zinc-900">{stats.privateResumes}</p>
              <p className="mt-2 text-xs text-zinc-500">
                {stats.totalResumes > 0
                  ? `${Math.round((stats.privateResumes / stats.totalResumes) * 100)}%`
                  : "0%"}{" "}
                of total
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Resumes */}
      <Card>
        <CardHeader className="border-b border-zinc-100">
          <CardTitle>Top Viewed Resumes</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {stats.topResumes.length > 0 ? (
            <div className="space-y-3">
              {stats.topResumes.map((resume: (typeof stats.topResumes)[number], index: number) => (
                <div
                  key={resume.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-100 p-4 transition-all hover:border-zinc-200 hover:shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-zinc-900 to-zinc-700 text-sm font-bold text-white ring-2 ring-zinc-100">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900">{resume.title}</p>
                      <p className="text-xs text-zinc-500">by {resume.user.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-zinc-900">
                      {resume.statistics?.views || 0} views
                    </p>
                    <p className="text-xs text-zinc-500">
                      {resume.statistics?.downloads || 0} downloads
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-zinc-100 p-4 text-4xl">📊</div>
              <p className="mt-4 text-sm font-medium text-zinc-900">No resume data available</p>
              <p className="mt-1 text-xs text-zinc-500">Statistics will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
