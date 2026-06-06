import { t } from "@lingui/macro";
import {
  Briefcase,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  MapPin,
  X,
  XCircle,
} from "@phosphor-icons/react";
import { Button } from "@resume-space/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";

import { MY_APPLICATIONS_KEY } from "@/client/constants/query-keys";
import { toast } from "@/client/hooks/use-toast";
import { getMyApplications, withdrawApplication } from "@/client/services/job";

export const MyApplicationsPage = () => {
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: MY_APPLICATIONS_KEY,
    queryFn: getMyApplications,
  });

  const { mutateAsync: withdraw, isPending: isWithdrawing } = useMutation({
    mutationFn: withdrawApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_APPLICATIONS_KEY });
      toast({ variant: "success", title: t`Application withdrawn successfully` });
    },
    onError: () => {
      toast({ variant: "error", title: t`Failed to withdraw application` });
    },
  });

  const handleWithdraw = async (id: string, title: string) => {
    if (!confirm(t`Are you sure you want to withdraw your application for ${title}?`)) {
      return;
    }
    await withdraw({ id });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string; icon: JSX.Element }> = {
      PENDING: {
        bg: "bg-yellow-500/10",
        text: "text-yellow-600 dark:text-yellow-400",
        icon: <Clock size={16} />,
      },
      REVIEWED: {
        bg: "bg-blue-500/10",
        text: "text-blue-600 dark:text-blue-400",
        icon: <Eye size={16} />,
      },
      SHORTLISTED: {
        bg: "bg-purple-500/10",
        text: "text-purple-600 dark:text-purple-400",
        icon: <CheckCircle size={16} />,
      },
      INTERVIEWED: {
        bg: "bg-indigo-500/10",
        text: "text-indigo-600 dark:text-indigo-400",
        icon: <CheckCircle size={16} />,
      },
      OFFERED: {
        bg: "bg-green-500/10",
        text: "text-green-600 dark:text-green-400",
        icon: <CheckCircle size={16} />,
      },
      ACCEPTED: {
        bg: "bg-emerald-500/10",
        text: "text-emerald-600 dark:text-emerald-400",
        icon: <CheckCircle size={16} />,
      },
      REJECTED: {
        bg: "bg-red-500/10",
        text: "text-red-600 dark:text-red-400",
        icon: <XCircle size={16} />,
      },
      WITHDRAWN: {
        bg: "bg-gray-500/10",
        text: "text-gray-600 dark:text-gray-400",
        icon: <X size={16} />,
      },
    };
    return colors[status] || colors.PENDING;
  };

  const formatStatus = (status: string) => {
    const statuses: Record<string, string> = {
      PENDING: "Pending Review",
      REVIEWED: "Reviewed",
      SHORTLISTED: "Shortlisted",
      INTERVIEWED: "Interviewed",
      OFFERED: "Offer Extended",
      ACCEPTED: "Accepted",
      REJECTED: "Not Selected",
      WITHDRAWN: "Withdrawn",
    };
    return statuses[status] || status;
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

  return (
    <div className="space-y-8 pt-24">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-12 text-center">
        <Briefcase size={48} weight="duotone" className="mx-auto mb-4 opacity-80" />
        <h1 className="text-4xl font-bold">{t`My Applications`}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg opacity-75">
          {t`Track the status of your job applications and manage your submissions.`}
        </p>
      </div>

      <div className="container mx-auto max-w-6xl px-4">
        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="text-sm opacity-75">{t`Total Applications`}</div>
            <div className="mt-1 text-3xl font-bold">{applications.length}</div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="text-sm opacity-75">{t`Pending Review`}</div>
            <div className="mt-1 text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {applications.filter((a) => a.status === "PENDING").length}
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="text-sm opacity-75">{t`In Progress`}</div>
            <div className="mt-1 text-3xl font-bold text-blue-600 dark:text-blue-400">
              {
                applications.filter((a) =>
                  ["REVIEWED", "SHORTLISTED", "INTERVIEWED", "OFFERED"].includes(a.status),
                ).length
              }
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="text-sm opacity-75">{t`Completed`}</div>
            <div className="mt-1 text-3xl font-bold text-green-600 dark:text-green-400">
              {applications.filter((a) => ["ACCEPTED", "REJECTED", "WITHDRAWN"].includes(a.status)).length}
            </div>
          </div>
        </div>

        {/* Applications List */}
        {isLoading ? (
          <div className="flex h-96 items-center justify-center rounded-xl border bg-secondary/30">
            <div className="text-center">
              <Clock size={48} className="mx-auto mb-4 animate-pulse opacity-50" />
              <p className="text-lg font-semibold">{t`Loading applications...`}</p>
            </div>
          </div>
        ) : applications.length === 0 ? (
          <div className="flex h-96 flex-col items-center justify-center rounded-xl border-2 border-dashed bg-secondary/30">
            <Briefcase size={64} className="opacity-20" />
            <p className="mt-6 text-lg font-semibold">{t`No applications yet`}</p>
            <p className="mt-2 text-sm opacity-75">{t`Start applying to jobs to see your applications here`}</p>
            <Link to="/jobs" className="mt-6">
              <Button>{t`Browse Jobs`}</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => {
              if (!application.job) return null;

              const { job } = application;
              const statusInfo = getStatusColor(application.status);

              return (
                <div key={application.id} className="rounded-xl border bg-card p-6 shadow-sm">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    {/* Job Info */}
                    <div className="flex-1">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="group inline-block text-xl font-bold transition-colors hover:text-primary"
                      >
                        {job.title}
                      </Link>

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
                        <span>{formatEmploymentType(job.employmentType)}</span>
                        <span>•</span>
                        <span>{formatLocationType(job.locationType)}</span>
                      </div>

                      <div className="mt-4 flex items-center gap-2 text-sm opacity-75">
                        <Calendar size={16} />
                        <span>Applied {new Date(application.appliedAt).toLocaleDateString()}</span>
                      </div>

                      {/* Cover Letter Preview */}
                      {application.coverLetter && (
                        <details className="mt-4">
                          <summary className="cursor-pointer text-sm font-medium opacity-75 hover:opacity-100">
                            {t`View Cover Letter`}
                          </summary>
                          <div className="mt-2 rounded-lg bg-secondary/30 p-4 text-sm opacity-90">
                            {application.coverLetter}
                          </div>
                        </details>
                      )}
                    </div>

                    {/* Status & Actions */}
                    <div className="flex flex-col items-end gap-3">
                      <div
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${statusInfo.bg} ${statusInfo.text}`}
                      >
                        {statusInfo.icon}
                        <span>{formatStatus(application.status)}</span>
                      </div>

                      {application.status === "PENDING" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleWithdraw(application.id, job.title)}
                          disabled={isWithdrawing}
                          className="gap-2 border-error text-error hover:bg-error hover:text-error-foreground"
                        >
                          <X size={16} />
                          {t`Withdraw`}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

