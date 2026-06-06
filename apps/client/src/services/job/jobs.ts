import { axios } from "@/client/libs/axios";

export type JobDto = {
  id: string;
  title: string;
  company: string;
  companyLogo: string | null;
  location: string;
  locationType: "REMOTE" | "ONSITE" | "HYBRID";
  employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "FREELANCE";
  description: string;
  requirements: string | null;
  responsibilities: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  category: string;
  tags: string[];
  experienceLevel: "ENTRY" | "JUNIOR" | "MID_LEVEL" | "SENIOR" | "LEAD" | "EXECUTIVE";
  featured: boolean;
  published: boolean;
  expiresAt: Date | string | null;
  views: number;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type JobFilters = {
  search?: string;
  category?: string;
  locationType?: string;
  employmentType?: string;
  experienceLevel?: string;
  featured?: boolean;
  skip?: number;
  take?: number;
};

export const findAllJobs = async (filters: JobFilters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.search) params.append("search", filters.search);
  if (filters.category) params.append("category", filters.category);
  if (filters.locationType) params.append("locationType", filters.locationType);
  if (filters.employmentType) params.append("employmentType", filters.employmentType);
  if (filters.experienceLevel) params.append("experienceLevel", filters.experienceLevel);
  if (filters.featured !== undefined) params.append("featured", String(filters.featured));
  if (filters.skip) params.append("skip", String(filters.skip));
  if (filters.take) params.append("take", String(filters.take));

  const response = await axios.get<{ jobs: JobDto[]; total: number }>(`/job?${params.toString()}`);
  return response.data;
};

