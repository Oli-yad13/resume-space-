"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NewJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    companyLogo: "",
    location: "",
    locationType: "REMOTE",
    employmentType: "FULL_TIME",
    description: "",
    requirements: "",
    responsibilities: "",
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "ETB",
    category: "",
    tags: "",
    experienceLevel: "MID_LEVEL",
    featured: false,
    published: true,
    expiresAt: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/job`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
          salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
          tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : [],
          expiresAt: formData.expiresAt || null,
        }),
      });

      if (response.ok) {
        alert("Job created successfully!");
        router.push("/dashboard/jobs");
      } else {
        const error = await response.json();
        alert(`Failed to create job: ${error.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error creating job:", error);
      alert("Failed to create job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/jobs"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-white">Create Job</h1>
        <p className="mt-1 text-sm text-zinc-400">Add a new job posting</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Basic Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-zinc-300">Job Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                placeholder="e.g. Senior Software Engineer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300">Company Name *</label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                placeholder="e.g. Acme Inc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300">Company Logo URL</label>
              <input
                type="url"
                value={formData.companyLogo}
                onChange={(e) => setFormData({ ...formData, companyLogo: e.target.value })}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300">Location *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                placeholder="e.g. San Francisco, CA"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300">Location Type *</label>
              <select
                required
                value={formData.locationType}
                onChange={(e) => setFormData({ ...formData, locationType: e.target.value })}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
              >
                <option value="REMOTE">Remote</option>
                <option value="ONSITE">Onsite</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300">Employment Type *</label>
              <select
                required
                value={formData.employmentType}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="FREELANCE">Freelance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300">Experience Level *</label>
              <select
                required
                value={formData.experienceLevel}
                onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
              >
                <option value="ENTRY">Entry Level</option>
                <option value="JUNIOR">Junior</option>
                <option value="MID_LEVEL">Mid Level</option>
                <option value="SENIOR">Senior</option>
                <option value="LEAD">Lead</option>
                <option value="EXECUTIVE">Executive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300">Category *</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                placeholder="e.g. Engineering"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300">Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                placeholder="e.g. React, Node.js, TypeScript"
              />
            </div>
          </div>
        </div>

        {/* Salary Information */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Salary Information</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-zinc-300">Min Salary</label>
              <input
                type="number"
                value={formData.salaryMin}
                onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                placeholder="50000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300">Max Salary</label>
              <input
                type="number"
                value={formData.salaryMax}
                onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                placeholder="100000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300">Currency</label>
              <select
                value={formData.salaryCurrency}
                onChange={(e) => setFormData({ ...formData, salaryCurrency: e.target.value })}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
              </select>
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Job Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300">Description *</label>
              <textarea
                required
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                placeholder="Job description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300">Requirements</label>
              <textarea
                rows={6}
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                placeholder="Job requirements..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300">Responsibilities</label>
              <textarea
                rows={6}
                value={formData.responsibilities}
                onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                placeholder="Job responsibilities..."
              />
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300">Expires At (Optional)</label>
              <input
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-white focus:ring-white"
                />
                <span className="text-sm text-zinc-300">Publish immediately</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-white focus:ring-white"
                />
                <span className="text-sm text-zinc-300">Feature this job</span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/dashboard/jobs">
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Job"}
          </Button>
        </div>
      </form>
    </div>
  );
}

