import { axios } from "@/client/libs/axios";

export const getJobCategories = async () => {
  const response = await axios.get<string[]>("/job/categories");
  return response.data;
};

