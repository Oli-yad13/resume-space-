import { axios } from "@/client/libs/axios";

export type ResourceDto = {
  id: string;
  title: string;
  description: string;
  type: "VIDEO" | "ARTICLE";
  category: string;
  videoUrl: string | null;
  content: string | null;
  featured: boolean;
  published: boolean;
  views: number;
  order: number;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export const findResourceById = async (data: { id: string }) => {
  const response = await axios.get<ResourceDto>(`/resource/${data.id}`);

  return response.data;
};

