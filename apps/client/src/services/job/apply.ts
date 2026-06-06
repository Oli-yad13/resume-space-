import { axios } from "@/client/libs/axios";

export type ApplyToJobDto = {
  jobId: string;
  resumeUrl?: string | null;
  coverLetter?: string | null;
};

export const applyToJob = async (data: ApplyToJobDto) => {
  // Only send resumeUrl and coverLetter in the body
  // jobId comes from the URL parameter
  // Transform empty strings to null for validation
  const body = {
    resumeUrl: data.resumeUrl && data.resumeUrl.trim() !== "" ? data.resumeUrl.trim() : null,
    coverLetter: data.coverLetter && data.coverLetter.trim() !== "" ? data.coverLetter.trim() : null,
  };
  
  const response = await axios.post(`/job/${data.jobId}/apply`, body);
  return response.data;
};

