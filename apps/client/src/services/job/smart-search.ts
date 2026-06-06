import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

import { JOB_SMART_SEARCH_KEY } from "@/client/constants/query-keys";
import { axios } from "@/client/libs/axios";

type SmartSearchResponse = {
  jobs: Array<{
    id: string;
    title: string;
    company: string;
    description: string;
    location: string;
    salaryMin: number | null;
    salaryMax: number | null;
    salaryCurrency: string;
    category: string;
    experienceLevel: string;
    employmentType: string;
    locationType: string;
    views: number;
    createdAt: string;
  }>;
  total: number;
  aiEnhanced?: boolean;
  aiInsights?: string;
  enhancedQuery?: string;
};

export const getSmartSearchResults = async (params: {
  query: string;
  category?: string;
  locationType?: string;
  employmentType?: string;
  experienceLevel?: string;
}): Promise<SmartSearchResponse> => {
  const response = await axios.get<SmartSearchResponse, AxiosResponse<SmartSearchResponse>>(
    "/job/search/ai",
    {
      params: {
        q: params.query,
        category: params.category,
        locationType: params.locationType,
        employmentType: params.employmentType,
        experienceLevel: params.experienceLevel,
      },
    },
  );

  return response.data;
};

export const useSmartSearch = (params: {
  query: string;
  category?: string;
  locationType?: string;
  employmentType?: string;
  experienceLevel?: string;
  enabled?: boolean;
}) => {
  const {
    data,
    error,
    isPending: loading,
    refetch,
  } = useQuery({
    queryKey: [...JOB_SMART_SEARCH_KEY, params],
    queryFn: () => getSmartSearchResults(params),
    enabled: params.enabled !== false && !!params.query,
    // Cache for 5 minutes
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return {
    jobs: data?.jobs || [],
    total: data?.total || 0,
    aiEnhanced: data?.aiEnhanced || false,
    aiInsights: data?.aiInsights,
    enhancedQuery: data?.enhancedQuery,
    loading,
    error,
    refetch,
  };
};

