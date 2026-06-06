import type { ResumeData } from "@resume-space/schema";
import type { AxiosResponse } from "axios";

import { axios } from "@/client/libs/axios";

/**
 * Upload a real resume/CV file (PDF, image, or plain text) and have the server
 * parse it into ResumeData via AI. The result is returned for preview; persist it
 * afterwards with `importResume({ data })`.
 */
export const parseResumeFile = async (file: File): Promise<ResumeData> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post<{ data: ResumeData }, AxiosResponse<{ data: ResumeData }>>(
    "/resume/import/parse",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  return response.data.data;
};
