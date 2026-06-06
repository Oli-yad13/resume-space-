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
  Plus,
  Video,
  FileText,
  Eye,
  Edit,
  Trash2,
  X,
  Star,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";

interface Resource {
  id: string;
  title: string;
  description: string;
  type: "VIDEO" | "ARTICLE";
  category: string;
  videoUrl: string | null;
  featured: boolean;
  published: boolean;
  views: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ResourcesClientProps {
  resources: Resource[];
}

export default function ResourcesClient({ resources }: ResourcesClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "VIDEO" | "ARTICLE">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  // Filter resources
  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === "ALL" || resource.type === typeFilter;

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "PUBLISHED" && resource.published) ||
      (statusFilter === "DRAFT" && !resource.published);

    return matchesSearch && matchesType && matchesStatus;
  });

  // Export to CSV
  const handleExport = () => {
    const headers = ["Title", "Type", "Category", "Status", "Featured", "Views", "Created"];
    const csvData = filteredResources.map((resource) => [
      resource.title,
      resource.type,
      resource.category,
      resource.published ? "Published" : "Draft",
      resource.featured ? "Yes" : "No",
      resource.views.toString(),
      new Date(resource.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `resources-export-${new Date().toISOString().split("T")[0]}.csv`);
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
              <CardTitle>All Resources</CardTitle>
              <p className="mt-2 text-sm text-zinc-500">
                {filteredResources.length} of {resources.length} resources
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-64 rounded-lg border border-zinc-200 bg-white pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-all duration-200 hover:border-zinc-300 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
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
                className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>

              {/* Add New Button */}
              <Link
                href="/dashboard/resources/new"
                className="flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              >
                <Plus className="h-4 w-4" />
                <span>Add Resource</span>
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-700">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700"
              >
                <option value="ALL">All</option>
                <option value="VIDEO">Videos</option>
                <option value="ARTICLE">Articles</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-700">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700"
              >
                <option value="ALL">All</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredResources.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="font-medium text-zinc-900 truncate">{resource.title}</p>
                        <p className="text-xs text-zinc-500 truncate">{resource.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {resource.type === "VIDEO" ? (
                        <Badge variant="default" className="flex items-center gap-1 w-fit">
                          <Video className="h-3 w-3" />
                          Video
                        </Badge>
                      ) : (
                        <Badge variant="default" className="flex items-center gap-1 w-fit">
                          <FileText className="h-3 w-3" />
                          Article
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-zinc-700">{resource.category}</span>
                    </TableCell>
                    <TableCell>
                      {resource.published ? (
                        <Badge variant="success" className="flex items-center gap-1 w-fit">
                          <CheckCircle className="h-3 w-3" />
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="flex items-center gap-1 w-fit">
                          <XCircle className="h-3 w-3" />
                          Draft
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {resource.featured && (
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-zinc-600">
                        <Eye className="h-3 w-3" />
                        <span className="text-sm">{resource.views}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-zinc-600">
                      {formatDateTime(resource.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedResource(resource)}
                          className="rounded-lg border border-zinc-200 px-2 py-1 text-xs font-medium text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-50"
                        >
                          View
                        </button>
                        <Link
                          href={`/dashboard/resources/${resource.id}/edit`}
                          className="rounded-lg border border-zinc-200 px-2 py-1 text-xs font-medium text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-50"
                        >
                          <Edit className="h-3 w-3" />
                        </Link>
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
                {searchQuery || typeFilter !== "ALL" || statusFilter !== "ALL"
                  ? "No resources found"
                  : "No resources yet"}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {searchQuery || typeFilter !== "ALL" || statusFilter !== "ALL"
                  ? "Try adjusting your filters"
                  : "Create your first resource to get started"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resource Detail Modal */}
      {selectedResource && (
        <Modal isOpen={!!selectedResource} onClose={() => setSelectedResource(null)}>
          <ModalHeader>
            <ModalTitle>{selectedResource.title}</ModalTitle>
          </ModalHeader>
          <ModalContent>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Description
                </p>
                <p className="mt-1 text-sm text-zinc-900">{selectedResource.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Type</p>
                  <p className="mt-1 text-sm font-medium text-zinc-900">
                    {selectedResource.type}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Category
                  </p>
                  <p className="mt-1 text-sm font-medium text-zinc-900">
                    {selectedResource.category}
                  </p>
                </div>
              </div>

              {selectedResource.videoUrl && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Video URL
                  </p>
                  <a
                    href={selectedResource.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-sm text-blue-600 hover:underline"
                  >
                    {selectedResource.videoUrl}
                  </a>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Status
                  </p>
                  <p className="mt-1">
                    {selectedResource.published ? (
                      <Badge variant="success">Published</Badge>
                    ) : (
                      <Badge variant="warning">Draft</Badge>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Featured
                  </p>
                  <p className="mt-1 text-sm font-medium text-zinc-900">
                    {selectedResource.featured ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Views</p>
                <p className="mt-1 text-2xl font-bold text-zinc-900">{selectedResource.views}</p>
              </div>
            </div>
          </ModalContent>
          <ModalFooter>
            <Button variant="outline" onClick={() => setSelectedResource(null)}>
              Close
            </Button>
            <Link href={`/dashboard/resources/${selectedResource.id}/edit`}>
              <Button variant="default">Edit Resource</Button>
            </Link>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}

