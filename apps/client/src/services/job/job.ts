import { axios } from "@/client/libs/axios";
import type { JobDto } from "./jobs";

export const findJobById = async (data: { id: string }) => {
  const response = await axios.get<JobDto>(`/job/${data.id}`);
  return response.data;
};

