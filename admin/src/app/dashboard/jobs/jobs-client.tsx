"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Search, Briefcase, MapPin, Users, Eye, Calendar, Trash2, Edit, Check, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  locationType: string;
  employmentType: string;
  experienceLevel: string;
  category: string;
  featured: boolean;
  published: boolean;
  views: number;
  createdAt: Date;
  _count: {
    applications: number;
  };
}

interface JobsClientProps {
  jobs: Job[];
}

export function JobsClient({ jobs }: JobsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPublished, setFilterPublished] = useState<"all" | "published" | "draft">("all");
  const [filterType, setFilterType] = useState<string>("all");

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPublished =
      filterPublished === "all"
        ? true
        : filterPublished === "published"
          ? job.published
          : !job.published;

    const matchesType = filterType === "all" ? true : job.employmentType === filterType;

    return matchesSearch && matchesPublished && matchesType;
  });

  const stats = {
    total: jobs.length,
    published: jobs.filter((j) => j.published).length,
    featured: jobs.filter((j) => j.featured).length,
    applications: jobs.reduce((sum, j) => sum + j._count.applications, 0),
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/job/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Job deleted successfully!");
        window.location.reload();
      } else {
        alert("Failed to delete job");
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("Failed to delete job");
    }
  };

  const handleTogglePublish = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/job/${id}/toggle-publish`, {
        method: "PATCH",
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert("Failed to toggle publish status");
      }
    } catch (error) {
      console.error("Error toggling publish status:", error);
      alert("Failed to toggle publish status");
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/job/${id}/toggle-featured`, {
        method: "PATCH",
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert("Failed to toggle featured status");
      }
    } catch (error) {
      console.error("Error toggling featured status:", error);
      alert("Failed to toggle featured status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Jobs Management</h1>
          <p className="mt-1 text-sm text-zinc-400">Manage job postings and applications</p>
        </div>
        <Link href="/dashboard/jobs/new">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Create Job
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Briefcase className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Total Jobs</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <Check className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Published</p>
              <p className="text-2xl font-bold text-white">{stats.published}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
              <Calendar className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Featured</p>
              <p className="text-2xl font-bold text-white">{stats.featured}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
              <Users className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Applications</p>
              <p className="text-2xl font-bold text-white">{stats.applications}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4 sm:flex-row">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800 pl-9 pr-4 text-sm text-white placeholder:text-zinc-400 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
          />
        </div>

        {/* Status Filter */}
        <select
          value={filterPublished}
          onChange={(e) => setFilterPublished(e.target.value as "all" | "published" | "draft")}
          className="h-10 rounded-lg border border-zinc-700 bg-zinc-800 px-4 text-sm text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>

        {/* Type Filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="h-10 rounded-lg border border-zinc-700 bg-zinc-800 px-4 text-sm text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
        >
          <option value="all">All Types</option>
          <option value="FULL_TIME">Full Time</option>
          <option value="PART_TIME">Part Time</option>
          <option value="CONTRACT">Contract</option>
          <option value="INTERNSHIP">Internship</option>
          <option value="FREELANCE">Freelance</option>
        </select>
      </div>

      {/* Jobs Table */}
      <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-zinc-800 bg-zinc-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Job
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Briefcase className="mx-auto h-12 w-12 text-zinc-700" />
                    <p className="mt-4 text-sm text-zinc-400">No jobs found</p>
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-zinc-800/50">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="font-medium text-white">{job.title}</div>
                          <div className="mt-1 flex items-center gap-2 text-sm text-zinc-400">
                            <span>{job.company}</span>
                            <span>•</span>
                            <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs">
                              {job.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-zinc-300">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="mt-1 text-xs text-zinc-400">
                        {job.locationType.replace("_", " ")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-zinc-300">
                        {job.employmentType.replace("_", " ")}
                      </div>
                      <div className="mt-1 text-xs text-zinc-400">
                        {job.experienceLevel.replace("_", " ")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1 text-zinc-400">
                          <Eye className="h-4 w-4" />
                          <span>{job.views}</span>
                        </div>
                        <div className="flex items-center gap-1 text-zinc-400">
                          <Users className="h-4 w-4" />
                          <span>{job._count.applications}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleTogglePublish(job.id)}
                          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${
                            job.published
                              ? "bg-green-500/10 text-green-500"
                              : "bg-yellow-500/10 text-yellow-500"
                          }`}
                        >
                          {job.published ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          {job.published ? "Published" : "Draft"}
                        </button>
                        {job.featured && (
                          <button
                            onClick={() => handleToggleFeatured(job.id)}
                            className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-500"
                          >
                            ★ Featured
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/jobs/${job.id}/applications`}>
                          <Button size="sm" variant="outline" className="gap-1">
                            <Users className="h-3 w-3" />
                            {job._count.applications}
                          </Button>
                        </Link>
                        <Link href={`/dashboard/jobs/${job.id}/edit`}>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="error"
                          onClick={() => handleDelete(job.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-center text-sm text-zinc-400">
        Showing {filteredJobs.length} of {jobs.length} jobs
      </div>
    </div>
  );
}

