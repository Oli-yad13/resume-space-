"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, User, Mail, FileText, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Application {
  id: string;
  status: string;
  resumeUrl: string | null;
  coverLetter: string | null;
  notes: string | null;
  appliedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    picture: string | null;
  };
}

interface Job {
  id: string;
  title: string;
  company: string;
}

export default function ApplicationsPage({ params }: { params: { id: string } }) {
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [jobRes, appsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/job/${params.id}`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/job/${params.id}/applications`),
      ]);

      if (jobRes.ok) {
        const jobData = await jobRes.json();
        setJob(jobData);
      }

      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setApplications(appsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (applicationId: string, status: string, notes?: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/job/applications/${applicationId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status, notes }),
        }
      );

      if (response.ok) {
        alert("Application status updated!");
        fetchData();
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-500/10 text-yellow-500",
      REVIEWED: "bg-blue-500/10 text-blue-500",
      SHORTLISTED: "bg-purple-500/10 text-purple-500",
      INTERVIEWED: "bg-indigo-500/10 text-indigo-500",
      OFFERED: "bg-green-500/10 text-green-500",
      ACCEPTED: "bg-emerald-500/10 text-emerald-500",
      REJECTED: "bg-red-500/10 text-red-500",
      WITHDRAWN: "bg-gray-500/10 text-gray-500",
    };
    return colors[status] || "bg-zinc-500/10 text-zinc-500";
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-zinc-400">Loading applications...</div>
      </div>
    );
  }

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
        <h1 className="mt-4 text-3xl font-bold text-white">
          {job?.title} - Applications
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          {job?.company} • {applications.length} applications
        </p>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {applications.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
            <div className="text-center">
              <User className="mx-auto h-12 w-12 text-zinc-700" />
              <p className="mt-4 text-sm text-zinc-400">No applications yet</p>
            </div>
          </div>
        ) : (
          applications.map((application) => (
            <div
              key={application.id}
              className="rounded-lg border border-zinc-800 bg-zinc-900 p-6"
            >
              {/* Applicant Info */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {application.user.picture ? (
                    <img
                      src={application.user.picture}
                      alt={application.user.name}
                      className="h-12 w-12 rounded-full"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
                      <User className="h-6 w-6 text-zinc-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-white">{application.user.name}</h3>
                    <div className="mt-1 flex items-center gap-2 text-sm text-zinc-400">
                      <Mail className="h-4 w-4" />
                      <a
                        href={`mailto:${application.user.email}`}
                        className="hover:text-white"
                      >
                        {application.user.email}
                      </a>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-zinc-400">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Applied {new Date(application.appliedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <select
                    value={application.status}
                    onChange={(e) => updateStatus(application.id, e.target.value)}
                    className={`rounded-lg border-0 px-3 py-1.5 text-sm font-medium ${getStatusColor(application.status)}`}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="REVIEWED">Reviewed</option>
                    <option value="SHORTLISTED">Shortlisted</option>
                    <option value="INTERVIEWED">Interviewed</option>
                    <option value="OFFERED">Offered</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="WITHDRAWN">Withdrawn</option>
                  </select>
                </div>
              </div>

              {/* Application Details */}
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {/* Resume */}
                {application.resumeUrl && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-400">Resume</label>
                    <a
                      href={application.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-2 text-sm text-white hover:underline"
                    >
                      <FileText className="h-4 w-4" />
                      View Resume
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                )}

                {/* Cover Letter */}
                {application.coverLetter && (
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-zinc-400">Cover Letter</label>
                    <div className="mt-1 rounded-lg border border-zinc-800 bg-zinc-800/50 p-4 text-sm text-zinc-300">
                      {application.coverLetter}
                    </div>
                  </div>
                )}

                {/* Admin Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-zinc-400">Admin Notes</label>
                  <textarea
                    defaultValue={application.notes || ""}
                    onBlur={(e) => {
                      if (e.target.value !== (application.notes || "")) {
                        updateStatus(application.id, application.status, e.target.value);
                      }
                    }}
                    placeholder="Add notes about this application..."
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

