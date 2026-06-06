import type { QueryKey } from "@tanstack/react-query";

export const USER_KEY: QueryKey = ["user"];
export const AUTH_PROVIDERS_KEY: QueryKey = ["auth", "providers"];

export const LANGUAGES_KEY: QueryKey = ["translation", "languages"];

export const RESUME_KEY: QueryKey = ["resume"];
export const RESUMES_KEY: QueryKey = ["resumes"];
export const RESUME_PREVIEW_KEY: QueryKey = ["resume", "preview"];

export const RESOURCE_KEY: QueryKey = ["resource"];
export const RESOURCES_KEY: QueryKey = ["resources"];
export const RESOURCE_CATEGORIES_KEY: QueryKey = ["resources", "categories"];
export const RESOURCE_STATS_KEY: QueryKey = ["resources", "stats"];

export const JOB_KEY: QueryKey = ["job"];
export const JOBS_KEY: QueryKey = ["jobs"];
export const JOB_CATEGORIES_KEY: QueryKey = ["jobs", "categories"];
export const JOB_STATS_KEY: QueryKey = ["jobs", "stats"];
export const MY_APPLICATIONS_KEY: QueryKey = ["my", "applications"];
export const JOB_RECOMMENDATIONS_KEY: QueryKey = ["jobs", "recommendations", "ai"];
export const JOB_SMART_SEARCH_KEY: QueryKey = ["jobs", "search", "ai"];