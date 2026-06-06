import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

import { RESOURCES_KEY } from "@/client/constants/query-keys";
import { axios } from "@/client/libs/axios";

import type { ResourceDto } from "./resource";

export type ResourceFilters = {
  type?: "VIDEO" | "ARTICLE";
  category?: string;
  search?: string;
  featured?: boolean;
};

export const fetchResources = async (filters?: ResourceFilters) => {
  const params = new URLSearchParams();

  if (filters?.type) params.append("type", filters.type);
  if (filters?.category) params.append("category", filters.category);
  if (filters?.search) params.append("search", filters.search);
  if (filters?.featured !== undefined) params.append("featured", String(filters.featured));

  const url = `/resource${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await axios.get<ResourceDto[], AxiosResponse<ResourceDto[]>>(url);

  return response.data;
};

export const useResources = (filters?: ResourceFilters) => {
  const {
    error,
    isPending: loading,
    data: resources,
  } = useQuery({
    queryKey: [...RESOURCES_KEY, filters],
    queryFn: () => fetchResources(filters),
  });

  return { resources: resources ?? [], loading, error };
};

