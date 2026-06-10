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
import {
  Search,
  Download,
  FileText,
  Eye,
  User,
  Calendar,
  Lock,
  Globe,
  X,
  ExternalLink,
} from "lucide-react";

interface Resume {
  id: string;
  title: string;
  slug: string;
  visibility: string;
  locked: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    name: string;
    email: string;
    username: string;
  };
  statistics: {
    views: number;
    downloads: number;
  } | null;
}

interface ResumesClientProps {
  resumes: Resume[];
}

export default function ResumesClient({ resumes }: ResumesClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);

  // Filter resumes based on search query
  const filteredResumes = resumes.filter(
    (resume) =>
      resume.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resume.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resume.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resume.user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Get resume URL - Pattern: /:username/:slug
  const getResumeUrl = (username: string, slug: string) => {
    // In development: http://localhost:5173
    // In production: set NEXT_PUBLIC_CLIENT_URL in .env.local
    const clientUrl =
      typeof window !== "undefined"
        ? process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:5173"
        : "http://localhost:5173";
    return `${clientUrl}/${username}/${slug}`;
  };

  // Open resume in new tab
  const handleViewResume = (username: string, slug: string) => {
    window.open(getResumeUrl(username, slug), "_blank", "noopener,noreferrer");
  };

  // Export resumes to CSV
  const handleExport = () => {
    const headers = [
      "Title",
      "Slug",
      "Owner Name",
      "Owner Email",
      "Visibility",
      "Status",
      "Views",
      "Downloads",
      "Created",
      "Last Updated",
    ];
    const csvData = filteredResumes.map((resume) => [
      resume.title,
      resume.slug,
      resume.user.name,
      resume.user.email,
      resume.visibility,
      resume.locked ? "Locked" : "Active",
      resume.statistics?.views?.toString() || "0",
      resume.statistics?.downloads?.toString() || "0",
      new Date(resume.createdAt).toLocaleDateString(),
      new Date(resume.updatedAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `resumes-export-${new Date().toISOString().split("T")[0]}.csv`);
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
              <CardTitle>All Resumes</CardTitle>
              <p className="mt-2 text-sm text-zinc-500">
                {filteredResumes.length} of {resumes.length} resumes
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search resumes..."
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
          {filteredResumes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResumes.map((resume) => (
                  <TableRow key={resume.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-zinc-900">{resume.title}</p>
                        <p className="text-xs text-zinc-500">/{resume.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-zinc-900">{resume.user.name}</p>
                        <p className="text-xs text-zinc-500">{resume.user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {resume.visibility === "public" ? (
                        <Badge variant="success">Public</Badge>
                      ) : (
                        <Badge variant="default">Private</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {resume.locked ? (
                        <Badge variant="warning">Locked</Badge>
                      ) : (
                        <Badge variant="info">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Eye className="h-4 w-4 text-zinc-400" />
                        <span className="font-medium text-zinc-900">
                          {resume.statistics?.views || 0}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Download className="h-4 w-4 text-zinc-400" />
                        <span className="font-medium text-zinc-900">
                          {resume.statistics?.downloads || 0}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-zinc-600">
                      {formatDateTime(resume.updatedAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {/* Only show View Resume button for public resumes */}
                        {resume.visibility === "public" && (
                          <button
                            onClick={() => handleViewResume(resume.user.username, resume.slug)}
                            className="flex items-center gap-1 rounded-lg border border-zinc-200 px-2 py-1 text-xs font-medium text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-50"
                            title="View Public Resume"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedResume(resume)}
                          className="rounded-lg border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-50"
                        >
                          Details
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-zinc-100 p-6">
                <FileText className="h-12 w-12 text-zinc-400" />
              </div>
              <p className="mt-4 text-sm font-medium text-zinc-900">
                {searchQuery ? "No resumes found" : "No resumes yet"}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {searchQuery ? "Try adjusting your search" : "Created resumes will appear here"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resume Detail Modal */}
      {selectedResume && (
        <Modal isOpen={!!selectedResume} onClose={() => setSelectedResume(null)}>
          <ModalHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-zinc-900 to-zinc-700">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <ModalTitle>{selectedResume.title}</ModalTitle>
                <p className="text-sm text-zinc-500">/{selectedResume.slug}</p>
              </div>
            </div>
          </ModalHeader>
          <ModalContent>
            <div className="space-y-4">
              {/* Owner */}
              <div className="flex items-start gap-3 rounded-lg border border-zinc-100 p-3">
                <div className="rounded-lg bg-zinc-100 p-2">
                  <User className="h-4 w-4 text-zinc-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Resume Owner
                  </p>
                  <p className="mt-1 text-sm font-medium text-zinc-900">
                    {selectedResume.user.name}
                  </p>
                  <p className="text-sm text-zinc-600">{selectedResume.user.email}</p>
                </div>
              </div>

              {/* Visibility & Status */}
              <div className="flex items-start gap-3 rounded-lg border border-zinc-100 p-3">
                <div className="rounded-lg bg-zinc-100 p-2">
                  {selectedResume.visibility === "public" ? (
                    <Globe className="h-4 w-4 text-zinc-600" />
                  ) : (
                    <Lock className="h-4 w-4 text-zinc-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Visibility & Status
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-900">Visibility:</span>
                    {selectedResume.visibility === "public" ? (
                      <Badge variant="success">Public</Badge>
                    ) : (
                      <Badge variant="default">Private</Badge>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-900">Status:</span>
                    {selectedResume.locked ? (
                      <Badge variant="warning">Locked</Badge>
                    ) : (
                      <Badge variant="info">Active</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="flex items-start gap-3 rounded-lg border border-zinc-100 p-3">
                <div className="rounded-lg bg-zinc-100 p-2">
                  <Eye className="h-4 w-4 text-zinc-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Statistics
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-zinc-500">Views</p>
                      <p className="text-2xl font-bold text-zinc-900">
                        {selectedResume.statistics?.views || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Downloads</p>
                      <p className="text-2xl font-bold text-zinc-900">
                        {selectedResume.statistics?.downloads || 0}
                      </p>
                    </div>
                  </div>
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
                      Created
                    </p>
                    <p className="mt-1 text-sm font-medium text-zinc-900">
                      {formatDateTime(selectedResume.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Last Updated
                    </p>
                    <p className="mt-1 text-sm font-medium text-zinc-900">
                      {formatDateTime(selectedResume.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ModalContent>
          <ModalFooter>
            {/* Only show View Resume button for public resumes */}
            {selectedResume.visibility === "public" && (
              <Button
                variant="secondary"
                onClick={() => handleViewResume(selectedResume.user.username, selectedResume.slug)}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Resume
              </Button>
            )}
            <Button variant="outline" onClick={() => setSelectedResume(null)}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}
