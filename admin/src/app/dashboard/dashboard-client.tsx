"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { Users } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

interface DashboardClientProps {
  recentUsers: User[];
}

export default function DashboardClient({ recentUsers }: DashboardClientProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Pagination logic
  const totalPages = Math.ceil(recentUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = recentUsers.slice(startIndex, endIndex);

  return (
    <Card>
      <CardHeader className="border-b border-zinc-100">
        <div className="flex items-center justify-between">
          <CardTitle>Recent Users</CardTitle>
          <span className="text-sm font-medium text-zinc-500">
            {recentUsers.length} total users
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {recentUsers.length > 0 ? (
          <>
            <div className="space-y-3">
              {paginatedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-100 p-4 transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-zinc-900 to-zinc-700 text-sm font-semibold text-white ring-2 ring-zinc-100">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900">{user.name}</p>
                      <p className="text-sm text-zinc-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                      Joined
                    </p>
                    <p className="text-sm font-medium text-zinc-700">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-zinc-100 p-6">
              <Users className="h-12 w-12 text-zinc-400" />
            </div>
            <p className="mt-4 text-sm font-medium text-zinc-900">No users yet</p>
            <p className="mt-1 text-xs text-zinc-500">New users will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
