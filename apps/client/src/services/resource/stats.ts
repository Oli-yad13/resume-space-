import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

import { RESOURCE_STATS_KEY } from "@/client/constants/query-keys";
import { axios } from "@/client/libs/axios";

export type ResourceStats = {
  total: number;
  videos: number;
  articles: number;
  totalViews: number;
};

export const fetchResourceStats = async () => {
  const response = await axios.get<ResourceStats, AxiosResponse<ResourceStats>>("/resource/stats");

  return response.data;
};

export const useResourceStats = () => {
  const {
    error,
    isPending: loading,
    data: stats,
  } = useQuery({
    queryKey: RESOURCE_STATS_KEY,
    queryFn: fetchResourceStats,
  });

  return { stats, loading, error };
};

