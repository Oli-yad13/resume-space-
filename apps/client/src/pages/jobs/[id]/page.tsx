import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import {
  ArrowLeft,
  Briefcase,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  CurrencyDollar,
  Eye,
  MapPin,
  Newspaper,
  PaperPlaneTilt,
} from "@phosphor-icons/react";
import { Button } from "@resume-space/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate, useParams, LoaderFunction, redirect } from "react-router";

import { JOB_KEY, MY_APPLICATIONS_KEY } from "@/client/constants/query-keys";
import { toast } from "@/client/hooks/use-toast";
import { queryClient } from "@/client/libs/query-client";
import { applyToJob, findJobById } from "@/client/services/job";
import { useUser } from "@/client/services/user";

// Loader to validate job ID and handle errors
export const jobDetailLoader: LoaderFunction = async ({ params }) => {
  const id = params.id;

  if (!id) {
    throw new Response("Job ID is required", { status: 400 });
  }

  // Check if ID contains slashes (invalid format)
  if (id.includes("/")) {
    throw new Response("Invalid job ID format", { status: 404 });
  }

  try {
    // Pre-fetch the job to catch 404s early
    await queryClient.fetchQuery({
      queryKey: [...JOB_KEY, id],
      queryFn: () => findJobById({ id }),
    });
    return null;
  } catch (error: any) {
    // If it's a 404, throw it as a Response to trigger errorElement
    if (error?.response?.status === 404 || error?.status === 404) {
      throw new Response("Job not found", { status: 404 });
    }
    // Re-throw other errors
    throw error;
  }
};

export const JobDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { i18n } = useLingui();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useUser();

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [resumeUrl, setResumeUrl] = useState("");
  const [coverLetter, setCoverLetter] = useState("");

  const { data: job, isLoading, isError } = useQuery({
    queryKey: [...JOB_KEY, id],
    queryFn: () => findJobById({ id: id! }),
    enabled: !!id,
  });

  const { mutateAsync: apply, isPending: isApplying } = useMutation({
    mutationFn: applyToJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_APPLICATIONS_KEY });
      toast({ variant: "success", title: t`Application submitted successfully!` });
      setShowApplyModal(false);
      setResumeUrl("");
      setCoverLetter("");
    },
    onError: (error: Error) => {
      toast({ variant: "error", title: error.message || t`Failed to submit application` });
    },
  });

  const handleApply = async () => {
    if (!user) {
      toast({ variant: "error", title: t`Please sign in to apply for this job` });
      navigate("/auth/login");
      return;
    }

    if (!id) return;

    await apply({
      jobId: id,
      resumeUrl: resumeUrl || null,
      coverLetter: coverLetter || null,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto flex h-96 max-w-6xl items-center justify-center px-4">
        <div className="text-center">
          <Clock size={48} className="mx-auto mb-4 animate-pulse opacity-50" />
          <p className="text-lg font-semibold">{t`Loading job...`}</p>
        </div>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="container mx-auto flex h-96 max-w-6xl flex-col items-center justify-center px-4">
        <Newspaper size={64} className="opacity-20" />
        <p className="mt-6 text-lg font-semibold">{t`Job not found`}</p>
        <Link to="/jobs" className="mt-4">
          <Button>{t`Back to Jobs`}</Button>
        </Link>
      </div>
    );
  }

  const formatSalary = (min: number | null, max: number | null, currency: string) => {
    if (!min && !max) return null;
    if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `${currency} ${min.toLocaleString()}+`;
    return `Up to ${currency} ${max?.toLocaleString()}`;
  };

  const formatLocationType = (type: string) => {
    const types: Record<string, string> = {
      REMOTE: "Remote",
      ONSITE: "On-site",
      HYBRID: "Hybrid",
    };
    return types[type] || type;
  };

  const formatEmploymentType = (type: string) => {
    const types: Record<string, string> = {
      FULL_TIME: "Full Time",
      PART_TIME: "Part Time",
      CONTRACT: "Contract",
      INTERNSHIP: "Internship",
      FREELANCE: "Freelance",
    };
    return types[type] || type;
  };

  const formatExperienceLevel = (level: string) => {
    const levels: Record<string, string> = {
      ENTRY: "Entry Level",
      JUNIOR: "Junior",
      MID_LEVEL: "Mid Level",
      SENIOR: "Senior",
      LEAD: "Lead",
      EXECUTIVE: "Executive",
    };
    return levels[level] || level;
  };

  return (
    <div className="space-y-8 pb-8 pt-24">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Back Button */}
        <Link to="/jobs" className="inline-flex items-center gap-2 text-sm opacity-75 hover:opacity-100">
          <ArrowLeft size={16} />
          <span>{t`Back to Jobs`}</span>
        </Link>

        {/* Job Header */}
        <div className="mt-6 rounded-xl border bg-card p-8 shadow-lg">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4">
              {job.companyLogo && (
                <img
                  src={job.companyLogo}
                  alt={job.company}
                  className="h-16 w-16 rounded-lg object-contain"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold">{job.title}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm opacity-75">
                  <div className="flex items-center gap-1">
                    <Building size={16} />
                    <span>{job.company}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    <span>{job.location}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Eye size={16} />
                    <span>{job.views} views</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                    {formatEmploymentType(job.employmentType)}
                  </span>
                  <span className="rounded-full bg-secondary px-3 py-1 text-sm font-medium">
                    {formatLocationType(job.locationType)}
                  </span>
                  <span className="rounded-full bg-secondary px-3 py-1 text-sm font-medium">
                    {formatExperienceLevel(job.experienceLevel)}
                  </span>
                  {job.category && (
                    <span className="rounded-full bg-secondary px-3 py-1 text-sm font-medium">
                      {job.category}
                    </span>
                  )}
                  {job.featured && (
                    <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-sm font-medium text-yellow-600 dark:text-yellow-400">
                      ⭐ Featured
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Button size="lg" onClick={() => setShowApplyModal(true)} className="gap-2">
              <PaperPlaneTilt size={20} />
              {t`Apply Now`}
            </Button>
          </div>

          {/* Salary */}
          {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency) && (
            <div className="mt-6 flex items-center gap-2 text-lg font-semibold text-primary">
              <CurrencyDollar size={24} />
              <span>{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</span>
            </div>
          )}

          {/* Posted Date */}
          <div className="mt-4 flex items-center gap-2 text-sm opacity-75">
            <Calendar size={16} />
            <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Job Details */}
        <div className="mt-8 space-y-8 rounded-xl border bg-card p-8">
          {/* Description */}
          <div>
            <h2 className="mb-4 text-2xl font-bold">{t`Job Description`}</h2>
            <div className="prose max-w-none whitespace-pre-wrap opacity-90">{job.description}</div>
          </div>

          {/* Requirements */}
          {job.requirements && (
            <div>
              <h2 className="mb-4 text-2xl font-bold">{t`Requirements`}</h2>
              <div className="prose max-w-none whitespace-pre-wrap opacity-90">{job.requirements}</div>
            </div>
          )}

          {/* Responsibilities */}
          {job.responsibilities && (
            <div>
              <h2 className="mb-4 text-2xl font-bold">{t`Responsibilities`}</h2>
              <div className="prose max-w-none whitespace-pre-wrap opacity-90">{job.responsibilities}</div>
            </div>
          )}

          {/* Tags */}
          {job.tags && job.tags.length > 0 && (
            <div>
              <h2 className="mb-4 text-2xl font-bold">{t`Skills & Tags`}</h2>
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <span key={tag} className="rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Apply Button (Bottom) */}
          <div className="pt-6">
            <Button size="lg" onClick={() => setShowApplyModal(true)} className="w-full gap-2 sm:w-auto">
              <PaperPlaneTilt size={20} />
              {t`Apply for this position`}
            </Button>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl border bg-background p-8 shadow-2xl">
            <h2 className="mb-6 text-2xl font-bold">{t`Apply for ${job.title}`}</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t`Resume URL`} <span className="opacity-50">({t`Optional`})</span>
                </label>
                <input
                  type="url"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border bg-secondary/30 px-4 py-3 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t`Cover Letter`} <span className="opacity-50">({t`Optional`})</span>
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder={i18n._(t`Tell us why you're a great fit for this role...`)}
                  rows={6}
                  className="w-full rounded-lg border bg-secondary/30 px-4 py-3 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowApplyModal(false)}
                  disabled={isApplying}
                  className="flex-1"
                >
                  {t`Cancel`}
                </Button>
                <Button onClick={handleApply} disabled={isApplying} className="flex-1 gap-2">
                  {isApplying ? (
                    <>
                      <Clock size={18} className="animate-spin" />
                      {t`Submitting...`}
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      {t`Submit Application`}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

