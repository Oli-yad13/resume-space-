"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from "@/components/ui/Modal";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
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

export default function EditResourcePage() {
  const router = useRouter();
  const params = useParams();
  const resourceId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  // Load existing resource
  useEffect(() => {
    const loadResource = async () => {
      try {
        const response = await fetch(`/api/resource/${resourceId}`);
        if (!response.ok) throw new Error("Failed to load resource");

        const data = await response.json();
        setFormData({
          title: data.title,
          description: data.description,
          type: data.type,
          category: data.category,
          videoUrl: data.videoUrl || "",
          content: data.content || "",
          featured: data.featured,
          published: data.published,
          order: data.order,
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadResource();
  }, [resourceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/resource/${resourceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          videoUrl: formData.type === "VIDEO" ? formData.videoUrl : null,
          content: formData.type === "ARTICLE" ? formData.content : null,
        }),
      });

      if (!response.ok) throw new Error("Failed to update resource");

      router.push("/dashboard/resources");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);

    try {
      const response = await fetch(`/api/resource/${resourceId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete resource");

      router.push("/dashboard/resources");
    } catch (err: any) {
      setError(err.message);
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/resources"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Edit Resource</h1>
            <p className="text-sm text-zinc-500">Update resource details</p>
          </div>
        </div>
        <Button
          variant="error"
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-900">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
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
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                maxLength={200}
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                maxLength={500}
                rows={3}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Type (Read-only) */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">Type</label>
              <Input type="text" value={formData.type} disabled />
              <p className="mt-1 text-xs text-zinc-500">Resource type cannot be changed</p>
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
                <label className="mb-2 block text-sm font-medium text-zinc-700">YouTube URL</label>
                <Input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                />
              </div>
            ) : (
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Article Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={12}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-zinc-100">
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <label className="flex items-center justify-between">
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

            <label className="flex items-center justify-between">
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

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">Display Order</label>
              <Input
                type="number"
                min="0"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-zinc-200 pt-6">
          <Link
            href="/dashboard/resources"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            Cancel
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span className="ml-2">Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span className="ml-2">Save Changes</span>
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <ModalHeader>
          <ModalTitle>Delete Resource</ModalTitle>
        </ModalHeader>
        <ModalContent>
          <p className="text-sm text-zinc-600">
            Are you sure you want to delete this resource? This action cannot be undone.
          </p>
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="error" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete Resource"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

