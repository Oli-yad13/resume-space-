"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, Save, Eye } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  "Resume Writing",
  "Cover Letters",
  "Interview Preparation",
  "Job Search Strategies",
  "LinkedIn Optimization",
  "Career Development",
  "Networking Tips",
  "Salary Negotiation",
  "Portfolio Building",
];

export default function NewResourcePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "VIDEO" as "VIDEO" | "ARTICLE",
    category: CATEGORIES[0],
    videoUrl: "",
    content: "",
    featured: false,
    published: true,
    order: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate
      if (!formData.title || !formData.description) {
        throw new Error("Title and description are required");
      }

      if (formData.type === "VIDEO" && !formData.videoUrl) {
        throw new Error("Video URL is required for video resources");
      }

      if (formData.type === "ARTICLE" && !formData.content) {
        throw new Error("Content is required for article resources");
      }

      // Submit to API
      const response = await fetch("/api/resource", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          videoUrl: formData.type === "VIDEO" ? formData.videoUrl : null,
          content: formData.type === "ARTICLE" ? formData.content : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create resource");
      }

      // Redirect back to resources page
      router.push("/dashboard/resources");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const videoId = formData.type === "VIDEO" ? extractVideoId(formData.videoUrl) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/resources"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Create New Resource</h1>
          <p className="text-sm text-zinc-500">Add a new video or article resource</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-900">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="border-b border-zinc-100">
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {/* Title */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., How to Write a Perfect Resume"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    maxLength={200}
                  />
                  <p className="mt-1 text-xs text-zinc-500">{formData.title.length}/200</p>
                </div>

                {/* Description */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Brief description of the resource..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    maxLength={500}
                    rows={3}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                  />
                  <p className="mt-1 text-xs text-zinc-500">{formData.description.length}/500</p>
                </div>

                {/* Category */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">
                    Resource Type <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 p-3 transition-colors hover:bg-zinc-50">
                      <input
                        type="radio"
                        name="type"
                        value="VIDEO"
                        checked={formData.type === "VIDEO"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            type: e.target.value as "VIDEO",
                          })
                        }
                        className="h-4 w-4"
                      />
                      <span className="text-sm font-medium text-zinc-900">Video</span>
                    </label>
                    <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 p-3 transition-colors hover:bg-zinc-50">
                      <input
                        type="radio"
                        name="type"
                        value="ARTICLE"
                        checked={formData.type === "ARTICLE"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            type: e.target.value as "ARTICLE",
                          })
                        }
                        className="h-4 w-4"
                      />
                      <span className="text-sm font-medium text-zinc-900">Article</span>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b border-zinc-100">
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {formData.type === "VIDEO" ? (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-700">
                      YouTube URL <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      required={formData.type === "VIDEO"}
                    />
                    <p className="mt-1 text-xs text-zinc-500">
                      Paste a YouTube video URL (watch, embed, or short URL)
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-700">
                      Article Content <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      placeholder="Write your article content here..."
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      required={formData.type === "ARTICLE"}
                      rows={12}
                      className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                    />
                    <p className="mt-1 text-xs text-zinc-500">
                      Supports plain text (Rich text editor coming soon)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b border-zinc-100">
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {/* Published */}
                <label className="flex cursor-pointer items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">Published</p>
                    <p className="text-xs text-zinc-500">Make this resource publicly visible</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="h-4 w-4"
                  />
                </label>

                {/* Featured */}
                <label className="flex cursor-pointer items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">Featured</p>
                    <p className="text-xs text-zinc-500">Show in featured section</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="h-4 w-4"
                  />
                </label>

                {/* Display Order */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">
                    Display Order
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
                    }
                  />
                  <p className="mt-1 text-xs text-zinc-500">
                    Lower numbers appear first (0 = default)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-zinc-500" />
                  <CardTitle>Preview</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {formData.type === "VIDEO" && videoId ? (
                  <div className="space-y-4">
                    <div className="aspect-video w-full overflow-hidden rounded-lg bg-zinc-100">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    {formData.title && (
                      <div>
                        <h3 className="text-lg font-bold text-zinc-900">{formData.title}</h3>
                        {formData.description && (
                          <p className="mt-2 text-sm text-zinc-600">{formData.description}</p>
                        )}
                        {formData.category && (
                          <p className="mt-2 text-xs font-medium text-zinc-500">
                            {formData.category}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : formData.type === "ARTICLE" && formData.content ? (
                  <div className="space-y-4">
                    {formData.title && (
                      <h3 className="text-lg font-bold text-zinc-900">{formData.title}</h3>
                    )}
                    {formData.description && (
                      <p className="text-sm text-zinc-600">{formData.description}</p>
                    )}
                    <div className="rounded-lg bg-zinc-50 p-4">
                      <p className="whitespace-pre-wrap text-sm text-zinc-800">
                        {formData.content}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-64 items-center justify-center rounded-lg bg-zinc-50">
                    <p className="text-sm text-zinc-500">
                      {formData.type === "VIDEO"
                        ? "Enter a YouTube URL to see preview"
                        : "Enter content to see preview"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-zinc-200 pt-6">
          <Link
            href="/dashboard/resources"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            Cancel
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span className="ml-2">Creating...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span className="ml-2">Create Resource</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

