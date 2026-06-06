import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import {
  Briefcase,
  Building,
  Clock,
  CurrencyDollar,
  MapPin,
  MagnifyingGlass,
  Sparkle,
  TrendUp,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router";

import { JOBS_KEY, JOB_CATEGORIES_KEY } from "@/client/constants/query-keys";
import { findAllJobs, getJobCategories, useJobRecommendations } from "@/client/services/job";
import { useUser } from "@/client/services/user";

export const JobsPage = () => {
  const { i18n } = useLingui();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedExperience, setSelectedExperience] = useState("");

  // AI-powered recommendations (only fetch if user is logged in)
  const { recommendations, loading: recommendationsLoading } = useJobRecommendations();
  const showRecommendations = user && recommendations.length > 0 && !searchQuery;

  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: [...JOBS_KEY, { searchQuery, selectedCategory, selectedLocation, selectedType, selectedExperience }],
    queryFn: () =>
      findAllJobs({
        search: searchQuery || undefined,
        category: selectedCategory || undefined,
        locationType: selectedLocation || undefined,
        employmentType: selectedType || undefined,
        experienceLevel: selectedExperience || undefined,
      }),
  });

  const { data: categories } = useQuery({
    queryKey: JOB_CATEGORIES_KEY,
    queryFn: getJobCategories,
  });

  const jobs = jobsData?.jobs || [];
  const featuredJobs = jobs.filter((job) => job.featured).slice(0, 3);
  const regularJobs = jobs.filter((job) => !job.featured);

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

  return (
    <div className="space-y-8 pt-24">
      {/* Hero Section */}
      <div className="rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-12 text-center">
        <Briefcase size={48} weight="duotone" className="mx-auto mb-4 opacity-80" />
        <h1 className="text-4xl font-bold">{t`Job Marketplace`}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg opacity-75">
          {t`Find your dream job from our curated list of opportunities. Browse positions, apply directly, and track your applications.`}
        </p>
      </div>

      <div className="container mx-auto max-w-7xl px-4">
        {/* Search Bar */}
        <div className="mb-6 rounded-xl border bg-secondary/30 p-4 shadow-sm">
          <div className="relative">
            <MagnifyingGlass
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={i18n._(t`Search jobs, companies, or keywords...`)}
              className="w-full rounded-lg border bg-background py-3 pl-12 pr-4 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-3">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="rounded-lg border bg-background px-4 py-2 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">{i18n._(t`All Locations`)}</option>
            <option value="REMOTE">{i18n._(t`Remote`)}</option>
            <option value="ONSITE">{i18n._(t`On-site`)}</option>
            <option value="HYBRID">{i18n._(t`Hybrid`)}</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-lg border bg-background px-4 py-2 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">{i18n._(t`All Types`)}</option>
            <option value="FULL_TIME">{i18n._(t`Full Time`)}</option>
            <option value="PART_TIME">{i18n._(t`Part Time`)}</option>
            <option value="CONTRACT">{i18n._(t`Contract`)}</option>
            <option value="INTERNSHIP">{i18n._(t`Internship`)}</option>
            <option value="FREELANCE">{i18n._(t`Freelance`)}</option>
          </select>

          <select
            value={selectedExperience}
            onChange={(e) => setSelectedExperience(e.target.value)}
            className="rounded-lg border bg-background px-4 py-2 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">{i18n._(t`All Experience Levels`)}</option>
            <option value="ENTRY">{i18n._(t`Entry Level`)}</option>
            <option value="JUNIOR">{i18n._(t`Junior`)}</option>
            <option value="MID_LEVEL">{i18n._(t`Mid Level`)}</option>
            <option value="SENIOR">{i18n._(t`Senior`)}</option>
            <option value="LEAD">{i18n._(t`Lead`)}</option>
            <option value="EXECUTIVE">{i18n._(t`Executive`)}</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border bg-background px-4 py-2 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">{i18n._(t`All Categories`)}</option>
            {categories?.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {(searchQuery || selectedCategory || selectedLocation || selectedType || selectedExperience) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("");
                setSelectedLocation("");
                setSelectedType("");
                setSelectedExperience("");
              }}
              className="rounded-lg border border-error px-4 py-2 text-error transition-colors hover:bg-error hover:text-error-foreground"
            >
              {i18n._(t`Clear Filters`)}
            </button>
          )}
        </div>

        {/* AI-Powered Recommendations */}
        {showRecommendations && (
          <div className="mb-12">
            <div className="mb-4 flex items-center gap-2">
              <Sparkle size={24} weight="duotone" className="text-primary" />
              <h2 className="text-2xl font-bold">{t`Recommended For You`}</h2>
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                AI-Powered
              </span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((job) => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="group overflow-hidden rounded-xl border bg-secondary/30 transition-all hover:shadow-lg"
                >
                  <div className="p-6">
                    <div className="mb-3 flex items-start justify-between">
                      <h3 className="line-clamp-2 text-lg font-semibold group-hover:text-primary">
                        {job.title}
                      </h3>
                      <span className="ml-2 rounded-full bg-primary/20 px-2 py-1 text-xs font-bold text-primary">
                        {job.aiScore}%
                      </span>
                    </div>

                    <div className="mb-3 flex items-center gap-2 text-sm opacity-75">
                      <Building size={16} />
                      <span>{job.company}</span>
                    </div>

                    <div className="mb-3 flex items-center gap-2 text-sm opacity-75">
                      <MapPin size={16} />
                      <span>{job.location} · {formatLocationType(job.locationType)}</span>
                    </div>

                    {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency) && (
                      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
                        <CurrencyDollar size={16} />
                        <span>{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</span>
                      </div>
                    )}

                    <div className="mt-4 rounded-lg bg-primary/5 p-3">
                      <p className="text-xs italic text-muted-foreground">
                        <Sparkle size={12} weight="fill" className="mr-1 inline" />
                        {job.aiReasoning}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Featured Jobs */}
        {featuredJobs.length > 0 && !searchQuery && (
          <div className="mb-12">
            <div className="mb-4 flex items-center gap-2">
              <TrendUp size={24} weight="duotone" />
              <h2 className="text-2xl font-bold">{t`Featured Jobs`}</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredJobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="group relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-6 shadow-lg transition-all hover:scale-[1.02] hover:border-primary/40 hover:shadow-xl"
                >
                  <div className="absolute right-4 top-4 rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary backdrop-blur-sm">
                    {t`Featured`}
                  </div>

                  {job.companyLogo && (
                    <img
                      src={job.companyLogo}
                      alt={job.company}
                      className="mb-4 h-12 w-12 rounded-lg object-contain"
                    />
                  )}

                  <h3 className="mb-2 text-xl font-bold transition-colors group-hover:text-primary">
                    {job.title}
                  </h3>

                  <div className="mb-4 flex items-center gap-2 text-sm opacity-75">
                    <Building size={16} />
                    <span>{job.company}</span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="opacity-60" />
                      <span>
                        {job.location} • {formatLocationType(job.locationType)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Briefcase size={16} className="opacity-60" />
                      <span>{formatEmploymentType(job.employmentType)}</span>
                    </div>

                    {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency) && (
                      <div className="flex items-center gap-2">
                        <CurrencyDollar size={16} className="opacity-60" />
                        <span className="font-semibold text-primary">
                          {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                        </span>
                      </div>
                    )}
                  </div>

                  {job.tags && job.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {job.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-secondary px-2 py-1 text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All Jobs */}
        <div>
          <h2 className="mb-6 text-2xl font-bold">
            {featuredJobs.length > 0 && !searchQuery ? t`All Jobs` : t`Jobs`}
          </h2>

          {jobsLoading ? (
            <div className="flex h-96 items-center justify-center rounded-xl border bg-secondary/30">
              <div className="text-center">
                <Clock size={48} className="mx-auto mb-4 animate-pulse opacity-50" />
                <p className="text-lg font-semibold">{t`Loading jobs...`}</p>
              </div>
            </div>
          ) : regularJobs.length === 0 ? (
            <div className="flex h-96 flex-col items-center justify-center rounded-xl border-2 border-dashed bg-secondary/30">
              <Briefcase size={64} className="opacity-20" />
              <p className="mt-6 text-lg font-semibold">{t`No jobs found`}</p>
              <p className="mt-2 text-sm opacity-75">{t`Try adjusting your filters or search query`}</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {regularJobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="group rounded-xl border bg-card p-6 shadow-sm transition-all hover:scale-[1.02] hover:border-primary/40 hover:shadow-md"
                >
                  {job.companyLogo && (
                    <img
                      src={job.companyLogo}
                      alt={job.company}
                      className="mb-4 h-12 w-12 rounded-lg object-contain"
                    />
                  )}

                  <h3 className="mb-2 text-lg font-bold transition-colors group-hover:text-primary">
                    {job.title}
                  </h3>

                  <div className="mb-4 flex items-center gap-2 text-sm opacity-75">
                    <Building size={16} />
                    <span>{job.company}</span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="opacity-60" />
                      <span>
                        {job.location} • {formatLocationType(job.locationType)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Briefcase size={16} className="opacity-60" />
                      <span>{formatEmploymentType(job.employmentType)}</span>
                    </div>

                    {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency) && (
                      <div className="flex items-center gap-2">
                        <CurrencyDollar size={16} className="opacity-60" />
                        <span className="font-semibold text-primary">
                          {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                        </span>
                      </div>
                    )}
                  </div>

                  {job.tags && job.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {job.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-secondary px-2 py-1 text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Results Count */}
        {!jobsLoading && jobs.length > 0 && (
          <div className="mt-8 text-center text-sm opacity-75">
            {t`Showing ${jobs.length} ${jobs.length === 1 ? "job" : "jobs"}`}
          </div>
        )}
      </div>
    </div>
  );
};

