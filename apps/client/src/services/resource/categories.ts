import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

import { RESOURCE_CATEGORIES_KEY } from "@/client/constants/query-keys";
import { axios } from "@/client/libs/axios";

export type ResourceCategory = {
  category: string;
  count: number;
};

export const fetchResourceCategories = async () => {
  const response = await axios.get<ResourceCategory[], AxiosResponse<ResourceCategory[]>>(
    "/resource/categories",
  );

  return response.data;
};

export const useResourceCategories = () => {
  const {
    error,
    isPending: loading,
    data: categories,
  } = useQuery({
    queryKey: RESOURCE_CATEGORIES_KEY,
    queryFn: fetchResourceCategories,
  });

  return { categories: categories ?? [], loading, error };
};

