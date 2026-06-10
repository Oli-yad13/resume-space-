"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/utils";
import { Search, Download, Users, Mail, Calendar, Shield, FileText, X } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  provider: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    resumes: number;
  };
}

interface UsersClientProps {
  users: User[];
}

export default function UsersClient({ users }: UsersClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Export users to CSV
  const handleExport = () => {
    const headers = [
      "Name",
      "Username",
      "Email",
      "Provider",
      "Email Verified",
      "2FA",
      "Resumes",
      "Joined",
    ];
    const csvData = filteredUsers.map((user) => [
      user.name,
      user.username,
      user.email,
      user.provider,
      user.emailVerified ? "Yes" : "No",
      user.twoFactorEnabled ? "Yes" : "No",
      user._count.resumes.toString(),
      new Date(user.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `users-export-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b border-zinc-100">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>All Users</CardTitle>
              <p className="mt-2 text-sm text-zinc-500">
                {filteredUsers.length} of {users.length} users
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-64 rounded-lg border border-zinc-200 bg-white pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-all duration-200 hover:border-zinc-300 focus:border-brand focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Export Button */}
              <button
                onClick={handleExport}
                className="flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Resumes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>2FA</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-zinc-900 to-zinc-700 text-sm font-semibold text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900">{user.name}</p>
                          <p className="text-xs text-zinc-500">@{user.username}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-700">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="default">{user.provider}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-700">
                        {user._count.resumes}
                      </span>
                    </TableCell>
                    <TableCell>
                      {user.emailVerified ? (
                        <Badge variant="success">Verified</Badge>
                      ) : (
                        <Badge variant="warning">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.twoFactorEnabled ? (
                        <Badge variant="success">Enabled</Badge>
                      ) : (
                        <Badge variant="default">Disabled</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-zinc-600">
                      {formatDateTime(user.createdAt)}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="rounded-lg border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-50"
                      >
                        View Details
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-zinc-100 p-6">
                <Users className="h-12 w-12 text-zinc-400" />
              </div>
              <p className="mt-4 text-sm font-medium text-zinc-900">
                {searchQuery ? "No users found" : "No users yet"}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {searchQuery ? "Try adjusting your search" : "Registered users will appear here"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      {selectedUser && (
        <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)}>
          <ModalHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-zinc-900 to-zinc-700 text-lg font-bold text-white">
                {selectedUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <ModalTitle>{selectedUser.name}</ModalTitle>
                <p className="text-sm text-zinc-500">@{selectedUser.username}</p>
              </div>
            </div>
          </ModalHeader>
          <ModalContent>
            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-start gap-3 rounded-lg border border-zinc-100 p-3">
                <div className="rounded-lg bg-zinc-100 p-2">
                  <Mail className="h-4 w-4 text-zinc-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Email Address
                  </p>
                  <p className="mt-1 text-sm font-medium text-zinc-900">{selectedUser.email}</p>
                  <div className="mt-1">
                    {selectedUser.emailVerified ? (
                      <Badge variant="success">Verified</Badge>
                    ) : (
                      <Badge variant="warning">Not Verified</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Provider */}
              <div className="flex items-start gap-3 rounded-lg border border-zinc-100 p-3">
                <div className="rounded-lg bg-zinc-100 p-2">
                  <Shield className="h-4 w-4 text-zinc-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Authentication
                  </p>
                  <p className="mt-1 text-sm font-medium text-zinc-900">
                    Provider: <Badge variant="default">{selectedUser.provider}</Badge>
                  </p>
                  <p className="mt-1 text-sm font-medium text-zinc-900">
                    2FA:{" "}
                    {selectedUser.twoFactorEnabled ? (
                      <Badge variant="success">Enabled</Badge>
                    ) : (
                      <Badge variant="default">Disabled</Badge>
                    )}
                  </p>
                </div>
              </div>

              {/* Resumes */}
              <div className="flex items-start gap-3 rounded-lg border border-zinc-100 p-3">
                <div className="rounded-lg bg-zinc-100 p-2">
                  <FileText className="h-4 w-4 text-zinc-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Resumes Created
                  </p>
                  <p className="mt-1 text-2xl font-bold text-zinc-900">
                    {selectedUser._count.resumes}
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div className="flex items-start gap-3 rounded-lg border border-zinc-100 p-3">
                <div className="rounded-lg bg-zinc-100 p-2">
                  <Calendar className="h-4 w-4 text-zinc-600" />
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Joined
                    </p>
                    <p className="mt-1 text-sm font-medium text-zinc-900">
                      {formatDateTime(selectedUser.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Last Updated
                    </p>
                    <p className="mt-1 text-sm font-medium text-zinc-900">
                      {formatDateTime(selectedUser.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ModalContent>
          <ModalFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}
