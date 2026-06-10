// Local API types — the admin app lives outside the pnpm workspace and
// cannot import @resume-space/dto, so the shapes are mirrored here.

export type Role = "USER" | "ORG_ADMIN" | "SUPER_ADMIN";

export type PostStatus = "PENDING" | "APPROVED" | "REJECTED";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  picture: string | null;
  role: Role;
  organization: string | null;
  twoFactorEnabled: boolean;
};

export type AdminJob = {
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
  status: PostStatus;
  postedById: string | null;
  organization: string | null;
  reviewNote: string | null;
  reviewedAt: string | null;
  expiresAt: string | null;
  views: number;
  createdAt: string;
  updatedAt: string;
  postedBy?: { id: string; name: string; organization: string | null } | null;
  _count?: { applications: number };
};

export type AdminResource = {
  id: string;
  title: string;
  description: string;
  type: "VIDEO" | "ARTICLE";
  category: string;
  videoUrl: string | null;
  content: string | null;
  featured: boolean;
  published: boolean;
  status: PostStatus;
  postedById: string | null;
  organization: string | null;
  reviewNote: string | null;
  reviewedAt: string | null;
  views: number;
  order: number;
  createdAt: string;
  updatedAt: string;
  postedBy?: { id: string; name: string; organization: string | null } | null;
};

export type OrgAccount = {
  id: string;
  name: string;
  email: string;
  username: string;
  organization: string | null;
  disabled: boolean;
  createdAt: string;
  _count: { jobsPosted: number; resourcesPosted: number };
};

export type AdminApplication = {
  id: string;
  jobId: string;
  userId: string;
  resumeUrl: string | null;
  coverLetter: string | null;
  status:
    | "PENDING"
    | "REVIEWED"
    | "SHORTLISTED"
    | "INTERVIEWED"
    | "OFFERED"
    | "REJECTED"
    | "WITHDRAWN"
    | "ACCEPTED";
  notes: string | null;
  appliedAt: string;
  user: { id: string; name: string; email: string; picture: string | null };
};
