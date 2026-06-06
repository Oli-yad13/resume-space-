import { axios } from "@/client/libs/axios";
import type { JobDto } from "./jobs";

export type ApplicationDto = {
  id: string;
  jobId: string;
  userId: string;
  resumeUrl: string | null;
  coverLetter: string | null;
  status: "PENDING" | "REVIEWED" | "SHORTLISTED" | "INTERVIEWED" | "OFFERED" | "REJECTED" | "WITHDRAWN" | "ACCEPTED";
  notes: string | null;
  appliedAt: Date | string;
  updatedAt: Date | string;
  job?: JobDto;
};

export const getMyApplications = async () => {
  const response = await axios.get<ApplicationDto[]>("/job/my-applications/list");
  return response.data;
};

export const withdrawApplication = async (data: { id: string }) => {
  const response = await axios.patch(`/job/applications/${data.id}/withdraw`);
  return response.data;
};

